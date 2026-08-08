import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth";
import { generate, type Attempt, type HistoryMsg } from "./provider";

// Provider cascade per tier: primary OpenAI, then Anthropic, then Google.
// A tier survives any single provider outage (or an unset key) automatically.
const FREE_CHAIN: Attempt[] = [
  { provider: "openai", model: "gpt-5.6-luna" },
  { provider: "anthropic", model: "claude-haiku-4-5" },
  { provider: "gemini", model: "gemini-flash-latest" },
];
const PREMIUM_CHAIN: Attempt[] = [
  { provider: "openai", model: "gpt-5.6-terra" },
  { provider: "anthropic", model: "claude-sonnet-5" },
  { provider: "gemini", model: "gemini-pro-latest" },
];

const app = new Hono<{ Bindings: Env }>();

// Allow the static frontend to call the API with credentials (cookies + bearer).
// The Cloudflare Pages *.pages.dev alias is included so staging deploys can be
// verified before the custom domain is cut over.
app.use("*", async (c, next) => {
  const allowed = [
    c.env.FRONTEND_URL || "http://localhost:5185",
    "https://shatteredsaga.com",
    "https://www.shatteredsaga.com",
    "https://shattered-saga.pages.dev",
    "http://localhost:5185",
  ];
  return cors({
    origin: (o) => (allowed.includes(o) ? o : allowed[0]),
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  })(c, next);
});

function authFor(c: any) {
  const baseURL = new URL(c.req.url).origin;
  return createAuth(c.env, c.req.raw.cf, baseURL);
}

// Health check.
app.get("/api/health", (c) => c.json({ ok: true, service: "shattered-saga-api" }));

// Better Auth — /api/auth/sign-up, /sign-in, /verify-email, /reset-password, etc.
app.all("/api/auth/*", (c) => authFor(c).handler(c.req.raw));

// Current user's tier + energy (replaces the old Supabase profile fetch).
app.get("/api/me", async (c) => {
  const session = await authFor(c).api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const { user } = session;
  return c.json({
    id: user.id,
    email: user.email,
    subscription_tier: (user as any).subscription_tier ?? "free",
    energy_balance: (user as any).energy_balance ?? 0,
  });
});

const UNLIMITED_FLASH_TIERS = ["supporter", "adventurer", "legend"];
// Only these tiers may use the (roughly 10x more expensive) premium model chain.
// Supporter is the BYOK tier — it brings its own key rather than using ours.
const PREMIUM_ELIGIBLE_TIERS = ["adventurer", "legend"];

// Hard input caps. Legitimate play is far below these (the client already caps
// history to 8 turns free / 25 paid), but without a ceiling an authenticated user
// could send arbitrarily large payloads and bill them to our provider accounts.
const MAX_SYSTEM_PROMPT_CHARS = 60_000;
const MAX_HISTORY_ENTRIES = 80;
const MAX_HISTORY_CHARS = 80_000;

// Metered AI proxy for Free/Premium tiers. BYOK is NOT handled here — it stays
// browser-direct. Verifies the session, meters energy in D1, then calls Gemini
// with the server key.
app.post("/api/complete", async (c) => {
  const session = await authFor(c).api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const userId = session.user.id;
  const tier = ((session.user as any).subscription_tier ?? "free") as string;

  let body: {
    model?: string;
    systemPrompt?: string;
    history?: HistoryMsg[];
    premiumTurn?: boolean;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "bad_request", message: "Invalid JSON body." }, 400);
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : "";

  // Reject oversized payloads before spending any energy or provider tokens.
  const historyChars = history.reduce(
    (n, m) => n + (typeof m?.content === "string" ? m.content.length : 0),
    0
  );
  if (
    systemPrompt.length > MAX_SYSTEM_PROMPT_CHARS ||
    history.length > MAX_HISTORY_ENTRIES ||
    historyChars > MAX_HISTORY_CHARS
  ) {
    return c.json(
      { error: "payload_too_large", message: "This turn's context is too large. Start a new adventure or trim your history." },
      413
    );
  }

  // The premium model chain is chosen SERVER-SIDE from the user's tier. The client
  // request is only a hint — trusting it would let any free account invoke the
  // premium models for the price of one standard turn.
  const premiumTurn = body.premiumTurn === true && PREMIUM_ELIGIBLE_TIERS.includes(tier);
  const chain = premiumTurn ? PREMIUM_CHAIN : FREE_CHAIN;

  // Free tier pays energy on every turn; subscribers get unlimited standard (Flash)
  // play and only pay energy for premium (Pro) turns.
  const consumesEnergy = premiumTurn || !UNLIMITED_FLASH_TIERS.includes(tier);

  if (consumesEnergy) {
    const result = await c.env.DATABASE.prepare(
      "UPDATE users SET energy_balance = energy_balance - 1 WHERE id = ? AND energy_balance >= 1"
    )
      .bind(userId)
      .run();
    if (result.meta.changes === 0) {
      return c.json(
        { error: "insufficient_energy", message: "Out of turns. Watch an ad or upgrade to refill." },
        402
      );
    }
  }

  try {
    // Runs the whole provider cascade (OpenAI → Anthropic → Google); only throws
    // if every provider fails, in which case we refund the speculative debit.
    const { text, totalTokens, provider, model } = await generate(c.env, chain, systemPrompt, history);
    const remaining = await currentEnergy(c.env, userId);
    return c.json({ text, totalTokens, provider, model, energy_remaining: remaining, error: null });
  } catch (e: any) {
    if (consumesEnergy) {
      await c.env.DATABASE.prepare(
        "UPDATE users SET energy_balance = energy_balance + 1 WHERE id = ?"
      )
        .bind(userId)
        .run();
    }
    // Log the real upstream error server-side; return a generic message so raw
    // provider responses (which can carry internal detail) never reach the client.
    console.error("[complete] all providers failed:", e?.message);
    return c.json(
      { error: "provider_error", message: "The Game Master is unreachable right now. Please try again in a moment." },
      502
    );
  }
});

async function currentEnergy(env: Env, userId: string): Promise<number> {
  const row = await env.DATABASE.prepare("SELECT energy_balance FROM users WHERE id = ?")
    .bind(userId)
    .first<{ energy_balance: number }>();
  return row?.energy_balance ?? 0;
}

export default app;
