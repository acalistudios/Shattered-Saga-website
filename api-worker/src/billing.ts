import type { Hono } from "hono";
import type { Env } from "./auth";

// ---------------------------------------------------------------------------
// Stripe billing.
//
// Uses Stripe Checkout (hosted): the browser is redirected to Stripe, card data
// never touches our origin, and we stay out of PCI scope. Entitlements are ONLY
// ever granted from a signature-verified webhook — never from the browser
// returning to a success URL, which a user could simply navigate to directly.
// ---------------------------------------------------------------------------

const STRIPE_API = "https://api.stripe.com/v1";

// Stamped on every object we create in Stripe. The account is shared with other
// ACALI products and webhooks are account-wide, so this is how we tell our
// events apart from theirs.
const APP_TAG = "shattered-saga";

/** What each purchasable thing grants. Prices live in Stripe; this maps intent. */
type PlanKey = "supporter" | "adventurer" | "legend";
type PackKey = "turns_200" | "turns_1500" | "gems_15";

const PACK_GRANTS: Record<PackKey, { energy?: number; gems?: number }> = {
  turns_200: { energy: 200 },
  turns_1500: { energy: 1500 },
  gems_15: { gems: 15 },
};

/**
 * Price IDs come from Worker secrets so they can differ between test and live
 * mode without a code change. Naming: STRIPE_PRICE_<PLAN>_<CYCLE> / _<PACK>.
 */
function priceIdFor(env: Env, kind: string, cycle?: string): string | undefined {
  const key = cycle ? `STRIPE_PRICE_${kind}_${cycle}` : `STRIPE_PRICE_${kind}`;
  return (env as any)[key.toUpperCase()];
}

/** Stripe wants form-encoded bodies, including for nested params. */
function formEncode(obj: Record<string, any>, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) {
      parts.push(formEncode(v, key));
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object") parts.push(formEncode(item, `${key}[${i}]`));
        else parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

async function stripe(env: Env, path: string, body?: Record<string, any>) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? formEncode(body) : undefined,
  });
  const data = await res.json<any>();
  if (!res.ok) throw new Error(data?.error?.message || `stripe_${res.status}`);
  return data;
}

// --- webhook signature verification ---------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify Stripe's `Stripe-Signature` header: v1 = HMAC-SHA256 of
 * "<timestamp>.<raw body>" keyed by the webhook secret. Rejects signatures
 * older than the tolerance to blunt replay attempts.
 */
async function verifyStripeSignature(
  raw: string,
  header: string,
  secret: string,
  toleranceSec = 300
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      header.split(",").map((p) => {
        const [k, ...rest] = p.trim().split("=");
        return [k, rest.join("=")];
      })
    );
    const t = Number(parts.t);
    const v1 = parts.v1;
    if (!t || !v1) return false;
    if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${raw}`));
    const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return timingSafeEqual(expected, v1);
  } catch {
    return false;
  }
}

// --- routes ----------------------------------------------------------------

export function registerBillingRoutes(
  app: Hono<{ Bindings: Env }>,
  getUser: (c: any) => Promise<{ id: string; email: string } | null>
) {
  /** Create a Checkout Session and hand the browser its URL. */
  app.post("/api/billing/checkout", async (c) => {
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: "not_configured", message: "Payments are not enabled yet." }, 503);
    }
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    let body: { plan?: PlanKey; cycle?: "monthly" | "yearly"; pack?: PackKey };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "bad_request" }, 400);
    }

    const site = c.env.FRONTEND_URL || "https://shatteredsaga.com";
    const isSub = !!body.plan;

    // The client names the INTENT; the server resolves the actual price. A
    // client-supplied price id would let anyone buy Legend for a penny.
    const priceId = isSub
      ? priceIdFor(c.env, body.plan!, body.cycle === "yearly" ? "YEARLY" : "MONTHLY")
      : priceIdFor(c.env, body.pack!);

    if (!priceId) {
      return c.json({ error: "unknown_item", message: "That item isn't available." }, 400);
    }

    try {
      const session = await stripe(c.env, "/checkout/sessions", {
        mode: isSub ? "subscription" : "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        // Ties the payment back to our user in the webhook.
        client_reference_id: user.id,
        customer_email: user.email,
        success_url: `${site}/?billing=success`,
        cancel_url: `${site}/?billing=cancelled`,
        metadata: {
          // The Stripe account is shared with other ACALI products, and webhooks
          // are delivered account-wide. This marker lets our handler ignore
          // events that belong to a different app.
          app: APP_TAG,
          user_id: user.id,
          kind: isSub ? "subscription" : "pack",
          item: isSub ? body.plan : body.pack,
        },
        // Propagate the marker onto the subscription itself, so subscription
        // lifecycle events (which don't carry the session's metadata) are
        // identifiable too.
        ...(isSub ? { subscription_data: { metadata: { app: APP_TAG, user_id: user.id } } } : {}),
      });
      return c.json({ url: session.url });
    } catch (e: any) {
      console.error("[billing] checkout failed:", e?.message);
      return c.json({ error: "checkout_failed", message: "Could not start checkout." }, 502);
    }
  });

  /** Stripe webhook — the ONLY place entitlements are granted. */
  app.post("/api/billing/webhook", async (c) => {
    const secret = c.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return c.json({ error: "not_configured" }, 503);

    const raw = await c.req.text();
    const sigHeader = c.req.header("stripe-signature") || "";
    if (!(await verifyStripeSignature(raw, sigHeader, secret))) {
      return c.json({ error: "invalid_signature" }, 400);
    }

    let event: any;
    try {
      event = JSON.parse(raw);
    } catch {
      return c.json({ error: "bad_payload" }, 400);
    }

    // Idempotency: Stripe retries, and a replay must not credit twice.
    const seen = await c.env.DATABASE.prepare("SELECT event_id FROM billing_events WHERE event_id = ?")
      .bind(event.id)
      .first();
    if (seen) return c.json({ received: true, duplicate: true });

    const obj = event.data?.object ?? {};
    const userId = obj.client_reference_id || obj.metadata?.user_id || null;

    // This Stripe account serves several ACALI products and delivers events
    // account-wide. Anything not stamped as ours belongs to another app —
    // record it as seen and do nothing, rather than acting on someone else's
    // purchase or cancellation.
    if (obj.metadata?.app && obj.metadata.app !== APP_TAG) {
      await c.env.DATABASE.prepare(
        "INSERT OR IGNORE INTO billing_events (event_id, type, user_id, processed_at) VALUES (?, ?, ?, ?)"
      ).bind(event.id, `${event.type}:foreign`, null, Date.now()).run();
      return c.json({ received: true, ignored: "other_app" });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          if (!userId) break;
          const kind = obj.metadata?.kind;
          const item = obj.metadata?.item;

          if (kind === "pack" && item in PACK_GRANTS) {
            const grant = PACK_GRANTS[item as PackKey];
            if (grant.energy) {
              await c.env.DATABASE.prepare(
                "UPDATE users SET energy_balance = energy_balance + ? WHERE id = ?"
              ).bind(grant.energy, userId).run();
            }
            if (grant.gems) {
              await c.env.DATABASE.prepare("UPDATE users SET gems = gems + ? WHERE id = ?")
                .bind(grant.gems, userId).run();
            }
          } else if (kind === "subscription") {
            // Record the subscription id so lifecycle events can be matched to
            // exactly this subscription rather than to the customer, who may
            // also hold subscriptions to other products on this Stripe account.
            await c.env.DATABASE.prepare(
              `UPDATE users
               SET subscription_tier = ?, subscription_status = 'active',
                   stripe_customer_id = ?, stripe_subscription_id = ?
               WHERE id = ?`
            ).bind(item, obj.customer ?? null, obj.subscription ?? null, userId).run();
          }
          break;
        }

        // Renewal, plan change, cancellation, payment failure.
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const active = obj.status === "active" || obj.status === "trialing";
          const periodEnd = obj.current_period_end ? obj.current_period_end * 1000 : null;

          // Match on the subscription id we stored at checkout. Matching on
          // customer alone would let a cancellation on another ACALI product
          // downgrade this user's Shattered Saga tier.
          const res = await c.env.DATABASE.prepare(
            `UPDATE users
             SET subscription_status = ?,
                 subscription_period_end = ?,
                 subscription_tier = CASE WHEN ? THEN subscription_tier ELSE 'free' END
             WHERE stripe_subscription_id = ?`
          ).bind(obj.status ?? "none", periodEnd, active ? 1 : 0, obj.id).run();

          if (res.meta.changes === 0) {
            console.log(`[billing] ${event.type} for unknown subscription ${obj.id} — ignored`);
          }
          break;
        }
      }

      await c.env.DATABASE.prepare(
        "INSERT INTO billing_events (event_id, type, user_id, processed_at) VALUES (?, ?, ?, ?)"
      ).bind(event.id, event.type, userId, Date.now()).run();
    } catch (e: any) {
      console.error("[billing] webhook handling failed:", event.type, e?.message);
      // 500 so Stripe retries rather than silently dropping the entitlement.
      return c.json({ error: "processing_failed" }, 500);
    }

    return c.json({ received: true });
  });

  /** Whether payments are live, so the UI can hide buttons that can't work. */
  app.get("/api/billing/status", (c) =>
    c.json({ enabled: !!c.env.STRIPE_SECRET_KEY })
  );
}
