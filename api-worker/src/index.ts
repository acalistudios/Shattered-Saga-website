import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth";
import { callGemini, type HistoryMsg } from "./provider";

const app = new Hono<{ Bindings: Env }>();

// Allow the static frontend to call the API with credentials (cookies + bearer).
app.use("*", async (c, next) => {
  const origin = c.env.FRONTEND_URL || "http://localhost:5185";
  return cors({
    origin,
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
  const systemPrompt = body.systemPrompt || "";
  const premiumTurn = body.premiumTurn === true;
  const model = body.model || (premiumTurn ? "gemini-1.5-pro" : "gemini-1.5-flash");

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
    const { text, totalTokens } = await callGemini(c.env, model, systemPrompt, history);
    const remaining = await currentEnergy(c.env, userId);
    return c.json({ text, totalTokens, energy_remaining: remaining, error: null });
  } catch (e: any) {
    // Refund the energy we speculatively debited if the provider call failed.
    if (consumesEnergy) {
      await c.env.DATABASE.prepare(
        "UPDATE users SET energy_balance = energy_balance + 1 WHERE id = ?"
      )
        .bind(userId)
        .run();
    }
    const msg = e?.message === "server_key_missing"
      ? "The server AI key is not configured."
      : (e?.message || "Upstream provider error.");
    return c.json({ error: "provider_error", message: msg }, 502);
  }
});

async function currentEnergy(env: Env, userId: string): Promise<number> {
  const row = await env.DATABASE.prepare("SELECT energy_balance FROM users WHERE id = ?")
    .bind(userId)
    .first<{ energy_balance: number }>();
  return row?.energy_balance ?? 0;
}

export default app;
