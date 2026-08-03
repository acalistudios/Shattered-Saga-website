import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth, type Env } from "./auth";

const app = new Hono<{ Bindings: Env }>();

// Allow the static frontend to call the API with credentials (cookies).
app.use("*", async (c, next) => {
  const origin = c.env.FRONTEND_URL || "http://localhost:5185";
  return cors({
    origin,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  })(c, next);
});

// Health check.
app.get("/api/health", (c) => c.json({ ok: true, service: "shattered-saga-api" }));

// Better Auth — handles /api/auth/sign-up, /sign-in, /verify-email, /reset-password, etc.
app.all("/api/auth/*", (c) => {
  const baseURL = new URL(c.req.url).origin;
  const auth = createAuth(c.env, c.req.raw.cf as any, baseURL);
  return auth.handler(c.req.raw);
});

// Phase 3: metered AI proxy for Free/Premium tiers. Verifies the session,
// checks/decrements energy in D1, then calls the provider with the server key.
// BYOK is NOT handled here — it stays browser-direct.
app.post("/api/complete", (c) =>
  c.json({ error: "not_implemented", message: "Metered proxy lands in Phase 3." }, 501)
);

export default app;
