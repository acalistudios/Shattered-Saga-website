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

export function isShatteredSagaStripeObject(metadata: Record<string, string> | null | undefined) {
  return metadata?.app === APP_TAG;
}

export function isShatteredSagaPrice(price: {
  active?: boolean;
  metadata?: Record<string, string> | null;
} | null | undefined) {
  return !!price?.active && isShatteredSagaStripeObject(price.metadata);
}

/** What each purchasable thing grants. Prices live in Stripe; this maps intent. */
type PlanKey = "supporter" | "adventurer" | "legend";
type PackKey = "turns_200" | "turns_1500" | "gems_15";

const PACK_GRANTS: Record<PackKey, { energy?: number; gems?: number }> = {
  turns_200: { energy: 200 },
  turns_1500: { energy: 1500 },
  gems_15: { gems: 15 },
};

/**
 * Canonical lookup key for a purchasable item. Stripe lets you attach a stable
 * `lookup_key` to a price, so the Worker resolves prices by name at runtime
 * instead of storing nine price-id secrets that have to be re-copied by hand
 * whenever prices are rebuilt (and which are easy to mis-paste).
 */
function lookupKeyFor(kind: string, cycle?: string): string {
  return cycle ? `ss_${kind}_${cycle}`.toLowerCase() : `ss_${kind}`.toLowerCase();
}

/**
 * Resolve a price id. An explicit STRIPE_PRICE_* secret still wins if present
 * (useful for pinning a specific price), otherwise we look it up by lookup_key.
 */
async function resolvePriceId(env: Env, kind: string, cycle?: string): Promise<string | undefined> {
  const envKey = (cycle ? `STRIPE_PRICE_${kind}_${cycle}` : `STRIPE_PRICE_${kind}`).toUpperCase();
  const pinned = (env as any)[envKey];
  const lk = lookupKeyFor(kind, cycle);
  try {
    let price = pinned
      ? await stripe(env, `/prices/${encodeURIComponent(pinned)}`)
      : (await stripe(env, `/prices?lookup_keys[]=${encodeURIComponent(lk)}&active=true&limit=1`)).data?.[0];
    if (!price?.active) return undefined;
    if (price.metadata?.app && price.metadata.app !== APP_TAG) return undefined;
    if (price.metadata?.app !== APP_TAG) {
      // Exact ss_* lookup keys are unique account-wide and were assigned by our
      // catalogue sync before app tagging existed. Promote only that evidenced
      // legacy path; an arbitrary pinned untagged price is never trusted.
      if (pinned || price.lookup_key !== lk) return undefined;
      price = await stripe(env, `/prices/${price.id}`, {
        metadata: { ...price.metadata, app: APP_TAG },
      });
    }
    if (!isShatteredSagaPrice(price)) return undefined;
    return price.id;
  } catch {
    return undefined;
  }
}

/** The full catalogue, used both for price sync and for verification. */
export const CATALOG = [
  { kind: "supporter", cycle: "MONTHLY", product: "BYOK Supporter", amount: 100, interval: "month" },
  { kind: "supporter", cycle: "YEARLY", product: "BYOK Supporter", amount: 999, interval: "year" },
  { kind: "adventurer", cycle: "MONTHLY", product: "Heroic Adventurer", amount: 499, interval: "month" },
  { kind: "adventurer", cycle: "YEARLY", product: "Heroic Adventurer", amount: 3999, interval: "year" },
  { kind: "legend", cycle: "MONTHLY", product: "Legendary Hero", amount: 1500, interval: "month" },
  { kind: "legend", cycle: "YEARLY", product: "Legendary Hero", amount: 11999, interval: "year" },
  { kind: "turns_200", cycle: undefined, product: "200 Priority Turns", amount: 100, interval: null },
  { kind: "turns_1500", cycle: undefined, product: "1,500 Priority Turns", amount: 500, interval: null },
  { kind: "gems_15", cycle: undefined, product: "15 Chronicle Gems", amount: 300, interval: null },
] as const;

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
export async function verifyStripeSignature(
  raw: string,
  header: string,
  secret: string,
  toleranceSec = 300
): Promise<boolean> {
  try {
    const parts = header.split(",").map((p) => {
      const [key, ...rest] = p.trim().split("=");
      return { key, value: rest.join("=") };
    });
    const t = Number(parts.find((part) => part.key === "t")?.value);
    const signatures = parts.filter((part) => part.key === "v1").map((part) => part.value);
    if (!t || signatures.length === 0) return false;
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
    // Stripe can include more than one v1 during webhook-secret rotation.
    return signatures.some((signature) => timingSafeEqual(expected, signature));
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

    // A Customer belongs to exactly one ACALI product. Never search or reuse by
    // email across the shared Stripe account.
    const billingUser = await c.env.DATABASE.prepare(
      "SELECT stripe_customer_id FROM users WHERE id = ?"
    ).bind(user.id).first<{ stripe_customer_id: string | null }>();
    let customerId = billingUser?.stripe_customer_id ?? null;
    if (customerId) {
      const customer = await stripe(c.env, `/customers/${customerId}`);
      if (customer.metadata?.app && customer.metadata.app !== APP_TAG) {
        return c.json({ error: "customer_scope_mismatch" }, 409);
      }
      if (customer.metadata?.app !== APP_TAG) {
        await stripe(c.env, `/customers/${customerId}`, {
          metadata: { ...customer.metadata, app: APP_TAG, user_id: user.id },
        });
      }
    } else {
      const customer = await stripe(c.env, "/customers", {
        email: user.email,
        metadata: { app: APP_TAG, user_id: user.id },
      });
      customerId = customer.id;
      await c.env.DATABASE.prepare(
        "UPDATE users SET stripe_customer_id = ? WHERE id = ?"
      ).bind(customerId, user.id).run();
    }

    // The client names the INTENT; the server resolves the actual price. A
    // client-supplied price id would let anyone buy Legend for a penny.
    const priceId = isSub
      ? await resolvePriceId(c.env, body.plan!, body.cycle === "yearly" ? "YEARLY" : "MONTHLY")
      : await resolvePriceId(c.env, body.pack!);

    if (!priceId) {
      return c.json({ error: "unknown_item", message: "That item isn't available." }, 400);
    }

    try {
      const session = await stripe(c.env, "/checkout/sessions", {
        mode: isSub ? "subscription" : "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        // Ties the payment back to our user in the webhook.
        client_reference_id: user.id,
        customer: customerId,
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

    const obj = event.data?.object ?? {};
    const userId = obj.client_reference_id || obj.metadata?.user_id || null;

    // This Stripe account serves several ACALI products and delivers events
    // account-wide. We require our own tag rather than merely rejecting other
    // apps' tags: an untagged event is, by definition, not one we created, and
    // acting on it could credit or downgrade the wrong person. Safe to be strict
    // because every session and subscription we create is stamped at creation
    // and there are no pre-existing Shattered Saga subscriptions to grandfather.
    if (!isShatteredSagaStripeObject(obj.metadata)) {
      await c.env.DATABASE.prepare(
        "INSERT OR IGNORE INTO billing_events (event_id, type, user_id, processed_at, status) VALUES (?, ?, ?, ?, 'processed')"
      ).bind(event.id, `${event.type}:foreign`, null, Date.now()).run();
      return c.json({ received: true, ignored: "other_app" });
    }

    try {
      const claimToken = crypto.randomUUID();
      const statements: D1PreparedStatement[] = [
        c.env.DATABASE.prepare(
          "INSERT OR IGNORE INTO billing_events (event_id, type, user_id, processed_at, claim_token, status) VALUES (?, ?, ?, ?, ?, 'processing')"
        ).bind(event.id, event.type, userId, Date.now(), claimToken),
      ];

      switch (event.type) {
        case "checkout.session.completed": {
          if (!userId) break;
          const kind = obj.metadata?.kind;
          const item = obj.metadata?.item;

          if (kind === "pack" && item in PACK_GRANTS) {
            const grant = PACK_GRANTS[item as PackKey];
            if (grant.energy) {
              statements.push(c.env.DATABASE.prepare(
                "UPDATE users SET energy_balance = energy_balance + ? WHERE id = ? AND EXISTS (SELECT 1 FROM billing_events WHERE event_id = ? AND claim_token = ?)"
              ).bind(grant.energy, userId, event.id, claimToken));
            }
            if (grant.gems) {
              statements.push(c.env.DATABASE.prepare(
                "UPDATE users SET gems = gems + ? WHERE id = ? AND EXISTS (SELECT 1 FROM billing_events WHERE event_id = ? AND claim_token = ?)"
              ).bind(grant.gems, userId, event.id, claimToken));
            }
          } else if (kind === "subscription") {
            // Record the subscription id so lifecycle events can be matched to
            // exactly this subscription rather than to the customer, who may
            // also hold subscriptions to other products on this Stripe account.
            statements.push(c.env.DATABASE.prepare(
              `UPDATE users SET subscription_tier = ?, subscription_status = 'active',
                 stripe_customer_id = ?, stripe_subscription_id = ?
               WHERE id = ? AND EXISTS (SELECT 1 FROM billing_events WHERE event_id = ? AND claim_token = ?)`
            ).bind(item, obj.customer ?? null, obj.subscription ?? null, userId, event.id, claimToken));
          }
          break;
        }

        // Renewal, plan change, cancellation, payment failure.
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const active = obj.status === "active" || obj.status === "trialing";
          // Stripe moved current_period_end off the subscription and onto its
          // items in the 2025-03-31 (basil) API version. The webhook's payload
          // shape follows the endpoint's configured API version, so read both
          // locations rather than assuming either.
          const periodEndSec =
            obj.current_period_end ?? obj.items?.data?.[0]?.current_period_end ?? null;
          const periodEnd = periodEndSec ? periodEndSec * 1000 : null;

          // Match on the subscription id we stored at checkout. Matching on
          // customer alone would let a cancellation on another ACALI product
          // downgrade this user's Shattered Saga tier.
          statements.push(c.env.DATABASE.prepare(
            `UPDATE users SET subscription_status = ?, subscription_period_end = ?,
               subscription_tier = CASE WHEN ? THEN subscription_tier ELSE 'free' END
             WHERE stripe_subscription_id = ? AND EXISTS (SELECT 1 FROM billing_events WHERE event_id = ? AND claim_token = ?)`
          ).bind(obj.status ?? "none", periodEnd, active ? 1 : 0, obj.id, event.id, claimToken));

          break;
        }
      }

      statements.push(c.env.DATABASE.prepare(
        "UPDATE billing_events SET status = 'processed' WHERE event_id = ? AND claim_token = ?"
      ).bind(event.id, claimToken));
      const results = await c.env.DATABASE.batch(statements);
      if ((results[0].meta.changes ?? 0) === 0) {
        return c.json({ received: true, duplicate: true });
      }
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

  /**
   * One-time setup + audit: attach canonical lookup_keys to the prices already
   * created in Stripe, and report every price's amount and interval so a
   * mis-configured plan (e.g. a "yearly" price actually billing monthly) is
   * caught before anyone is charged.
   *
   * Read-mostly and idempotent — it only ever sets lookup_key on prices under
   * our own products. Gated behind BILLING_ADMIN_TOKEN so it isn't publicly
   * callable; without that secret set, it is disabled entirely.
   */
  app.post("/api/billing/admin/sync-prices", async (c) => {
    const adminToken = c.env.BILLING_ADMIN_TOKEN;
    if (!adminToken) return c.json({ error: "disabled" }, 404);
    if (c.req.header("x-admin-token") !== adminToken) {
      return c.json({ error: "unauthorized" }, 401);
    }
    if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: "not_configured" }, 503);

    const report: any[] = [];
    try {
      const products = await stripe(c.env, "/products?limit=100&active=true");

      for (const item of CATALOG) {
        const product = products.data.find((p: any) => p.name === item.product);
        if (!product) {
          report.push({ item: lookupKeyFor(item.kind, item.cycle), status: "PRODUCT_MISSING", expected: item.product });
          continue;
        }

        const prices = await stripe(c.env, `/prices?product=${product.id}&limit=100&active=true`);
        const match = prices.data.find(
          (p: any) =>
            p.unit_amount === item.amount &&
            ((item.interval && p.recurring?.interval === item.interval) ||
              (!item.interval && !p.recurring))
        );

        const lk = lookupKeyFor(item.kind, item.cycle);
        if (!match) {
          report.push({
            item: lk,
            status: "PRICE_MISSING",
            expected: `${(item.amount / 100).toFixed(2)} ${item.interval ?? "one-time"}`,
            found: prices.data.map((p: any) => ({
              id: p.id,
              amount: (p.unit_amount / 100).toFixed(2),
              interval: p.recurring?.interval ?? "one-time",
            })),
          });
          continue;
        }

        if (product.metadata?.app && product.metadata.app !== APP_TAG) {
          report.push({ item: lk, status: "PRODUCT_SCOPE_MISMATCH", product: product.name });
          continue;
        }

        // Idempotent: tag both catalogue layers and set the canonical key. A
        // checkout accepts only prices explicitly tagged for this application.
        if (product.metadata?.app !== APP_TAG) {
          await stripe(c.env, `/products/${product.id}`, {
            metadata: { ...product.metadata, app: APP_TAG },
          });
        }
        if (match.metadata?.app && match.metadata.app !== APP_TAG) {
          report.push({ item: lk, status: "PRICE_SCOPE_MISMATCH", priceId: match.id });
          continue;
        }
        if (match.lookup_key !== lk || match.metadata?.app !== APP_TAG) {
          await stripe(c.env, `/prices/${match.id}`, {
            lookup_key: lk,
            transfer_lookup_key: "true",
            metadata: { ...match.metadata, app: APP_TAG },
          });
        }

        report.push({
          item: lk,
          status: "OK",
          priceId: match.id,
          product: product.name,
          amount: `$${(match.unit_amount / 100).toFixed(2)}`,
          interval: match.recurring?.interval ?? "one-time",
          currency: match.currency,
        });
      }
    } catch (e: any) {
      return c.json({ error: "sync_failed", message: e?.message }, 502);
    }

    const problems = report.filter((r) => r.status !== "OK");
    return c.json({ ok: problems.length === 0, count: report.length, problems: problems.length, report });
  });
}
