import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth";
import { generate, type Attempt, type HistoryMsg } from "./provider";
import { registerSaveRoutes, readGemState } from "./saves";
import { registerBillingRoutes } from "./billing";

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

// Send auth failures back to the app so ordinary users see recovery guidance
// instead of a raw API-domain error page.
app.get("/api/auth/error", (c) => {
  const frontend = c.env.FRONTEND_URL || "https://shatteredsaga.com";
  const error = c.req.query("error") || "unknown";
  const redirect = new URL(frontend);
  redirect.searchParams.set("auth_error", error);
  return c.redirect(redirect.toString(), 302);
});

// Better Auth — /api/auth/sign-up, /sign-in, /verify-email, /reset-password, etc.
app.all("/api/auth/*", (c) => authFor(c).handler(c.req.raw));

function safeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Privacy-safe login support report. Do not store passwords, OAuth tokens,
// provider access tokens, BYOK keys, or provider secrets here.
app.post("/api/support/auth-issue", async (c) => {
  const session = await authFor(c).api.getSession({ headers: c.req.raw.headers }).catch(() => null);
  let body: Record<string, unknown> = {};
  try {
    body = await c.req.json();
  } catch {
    // Body is optional so users can report from a generic error state.
  }

  const errorCode = safeText(body.error, 80) || "unknown";
  const contactEmail = safeText(body.email, 254);
  const message = safeText(body.message, 1000);
  const path = safeText(body.path, 200);
  const userAgent = safeText(body.userAgent, 500) || safeText(c.req.header("User-Agent"), 500);
  const ip = c.req.header("CF-Connecting-IP") || "";
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const ipHash = ip ? await sha256Hex(`${ip}:${createdAt.toString().slice(0, 8)}`) : null;

  await c.env.DATABASE.prepare(
    `INSERT INTO auth_issues
      (id, user_id, contact_email, error_code, message, path, user_agent, ip_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, session?.user?.id || null, contactEmail, errorCode, message, path, userAgent, ipHash, createdAt)
    .run();

  return c.json({ ok: true, issueId: id });
});

// Owner-only support lookup. It returns account ids, emails, and provider ids,
// but never OAuth tokens, password hashes, BYOK keys, or provider secrets.
app.get("/api/admin/auth-issues", async (c) => {
  const token = c.req.header("x-admin-token") || c.req.query("token");
  if (!c.env.BILLING_ADMIN_TOKEN || token !== c.env.BILLING_ADMIN_TOKEN) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const limit = Math.min(Math.max(Number(c.req.query("limit") || 25), 1), 100);
  const rows = await c.env.DATABASE.prepare(
    `SELECT
       ai.id,
       ai.created_at,
       ai.error_code,
       ai.contact_email,
       ai.message,
       ai.path,
       ai.user_agent,
       ai.user_id,
       u.email AS account_email,
       GROUP_CONCAT(a.provider_id) AS linked_providers
     FROM auth_issues ai
     LEFT JOIN users u ON u.id = ai.user_id
     LEFT JOIN accounts a ON a.user_id = ai.user_id
     GROUP BY ai.id
     ORDER BY ai.created_at DESC
     LIMIT ?`
  )
    .bind(limit)
    .all();

  return c.json({ issues: rows.results || [] });
});

// Current user's tier, energy, gems and unlocked save slots.
app.get("/api/me", async (c) => {
  const session = await authFor(c).api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const { user } = session;
  // gems/unlocked_slots are app columns Better Auth doesn't model, so read them
  // straight from D1. They are server-authoritative — never trusted from the client.
  const { gems, unlockedSlots } = await readGemState(c.env, user.id);
  const linked = await c.env.DATABASE.prepare(
    "SELECT provider_id FROM accounts WHERE user_id = ? ORDER BY provider_id"
  )
    .bind(user.id)
    .all<{ provider_id: string }>();
  return c.json({
    id: user.id,
    email: user.email,
    subscription_tier: (user as any).subscription_tier ?? "free",
    energy_balance: (user as any).energy_balance ?? 0,
    gems,
    unlocked_slots: unlockedSlots,
    linked_providers: (linked.results || []).map((row) => row.provider_id),
  });
});

// Cloud save slots + gem spending. Shares the same session check as everything else.
registerSaveRoutes(app, async (c) => {
  const session = await authFor(c).api.getSession({ headers: c.req.raw.headers });
  return session ? { id: session.user.id } : null;
});

// Stripe checkout + webhook. Entitlements are granted only by the webhook.
registerBillingRoutes(app, async (c) => {
  const session = await authFor(c).api.getSession({ headers: c.req.raw.headers });
  return session ? { id: session.user.id, email: session.user.email } : null;
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

// ---------------------------------------------------------------------------
// Facebook Data Deletion Callback (required by Meta before an app can go Live).
//
// Meta POSTs a `signed_request` when a user removes the app. We verify its HMAC
// with the app secret, delete that user's account, and reply with a status URL
// plus a confirmation code, as Meta's contract requires.
// ---------------------------------------------------------------------------

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
}

async function verifySignedRequest(signed: string, appSecret: string): Promise<any | null> {
  // Everything here runs on attacker-controllable input: atob() throws on
  // malformed base64, so the whole routine is guarded and any failure is simply
  // treated as "not verified" rather than surfacing as a 500.
  try {
    const [sigPart, payloadPart] = signed.split(".");
    if (!sigPart || !payloadPart) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(appSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expected = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart))
    );
    const actual = b64urlToBytes(sigPart);

    // Constant-time comparison.
    if (expected.length !== actual.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
    if (diff !== 0) return null;

    return JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadPart)));
  } catch {
    return null;
  }
}

// NOTE: deliberately NOT under /api/auth/* — that path is claimed by the
// Better Auth catch-all above, which would swallow this route and 404.
app.post("/api/facebook/data-deletion", async (c) => {
  const secret = c.env.FACEBOOK_CLIENT_SECRET;
  if (!secret) return c.json({ error: "not_configured" }, 500);

  let signed = "";
  try {
    const body = await c.req.parseBody();
    signed = String(body["signed_request"] || "");
  } catch {
    /* fall through */
  }
  if (!signed) return c.json({ error: "bad_request" }, 400);

  const payload = await verifySignedRequest(signed, secret);
  if (!payload?.user_id) return c.json({ error: "invalid_signature" }, 400);

  // Map the Facebook user id to our user via the accounts table, then delete.
  // sessions/accounts cascade on user delete.
  const row = await c.env.DATABASE.prepare(
    "SELECT user_id FROM accounts WHERE provider_id = 'facebook' AND account_id = ?"
  )
    .bind(String(payload.user_id))
    .first<{ user_id: string }>();

  if (row?.user_id) {
    await c.env.DATABASE.prepare("DELETE FROM users WHERE id = ?").bind(row.user_id).run();
  }

  // Confirmation code is for the user to track the request; the fb user id is
  // sufficient and non-secret here.
  const confirmationCode = `del_${payload.user_id}`;
  return c.json({
    url: `https://shatteredsaga.com/data-deletion.html?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
});

async function currentEnergy(env: Env, userId: string): Promise<number> {
  const row = await env.DATABASE.prepare("SELECT energy_balance FROM users WHERE id = ?")
    .bind(userId)
    .first<{ energy_balance: number }>();
  return row?.energy_balance ?? 0;
}

export default app;
