import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import {
  isShatteredSagaPrice,
  isShatteredSagaStripeObject,
  registerBillingRoutes,
} from "./billing";

type Statement = { sql: string; args: unknown[] };

class FakeStatement {
  args: unknown[] = [];
  constructor(private db: FakeD1, readonly sql: string) {}
  bind(...args: unknown[]) { this.args = args; return this; }
  async run() { return this.db.apply({ sql: this.sql, args: this.args }); }
  async first<T>() { return null as T | null; }
}

class FakeD1 {
  events = new Set<string>();
  users = new Map<string, { energy: number; tier: string; status: string; subscriptionId: string | null }>();
  failNextBatch = false;
  prepare(sql: string) { return new FakeStatement(this, sql); }
  apply(statement: Statement) {
    if (statement.sql.includes("INSERT OR IGNORE INTO billing_events")) {
      const id = String(statement.args[0]);
      if (this.events.has(id)) return { meta: { changes: 0 } };
      this.events.add(id);
      return { meta: { changes: 1 } };
    }
    return { meta: { changes: 0 } };
  }
  async batch(statements: FakeStatement[]) {
    if (this.failNextBatch) { this.failNextBatch = false; throw new Error("simulated D1 failure"); }
    const nextEvents = new Set(this.events);
    const nextUsers = new Map([...this.users].map(([id, user]) => [id, { ...user }]));
    const results: Array<{ meta: { changes: number } }> = [];
    const claim = statements[0];
    const eventId = String(claim.args[0]);
    const duplicate = nextEvents.has(eventId);
    if (!duplicate) nextEvents.add(eventId);
    results.push({ meta: { changes: duplicate ? 0 : 1 } });

    for (const statement of statements.slice(1)) {
      let changes = 0;
      if (!duplicate && statement.sql.includes("energy_balance = energy_balance +")) {
        const [amount, userId] = statement.args as [number, string];
        const user = nextUsers.get(userId);
        if (user) { user.energy += amount; changes = 1; }
      } else if (!duplicate && statement.sql.includes("WHERE stripe_subscription_id =")) {
        const [status, , active, subscriptionId] = statement.args as [string, number | null, number, string];
        for (const user of nextUsers.values()) {
          if (user.subscriptionId === subscriptionId) {
            user.status = status;
            if (!active) user.tier = "free";
            changes++;
          }
        }
      }
      results.push({ meta: { changes } });
    }
    this.events = nextEvents;
    this.users = nextUsers;
    return results;
  }
}

async function signedRequest(event: unknown, secret = "whsec_test") {
  const raw = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${raw}`));
  const signature = [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return new Request("http://test/api/billing/webhook", {
    method: "POST", body: raw,
    headers: { "content-type": "application/json", "stripe-signature": `t=${timestamp},v1=${signature}` },
  });
}

function testApp(db: FakeD1) {
  const app = new Hono();
  registerBillingRoutes(app as never, async () => null);
  return { app, env: { DATABASE: db, STRIPE_WEBHOOK_SECRET: "whsec_test" } };
}

describe("Stripe application scoping", () => {
  it("accepts only the Shattered Saga tag", () => {
    expect(isShatteredSagaStripeObject({ app: "shattered-saga" })).toBe(true);
    expect(isShatteredSagaStripeObject({ app: "viastellis" })).toBe(false);
    expect(isShatteredSagaStripeObject({})).toBe(false);
    expect(isShatteredSagaStripeObject(null)).toBe(false);
  });

  it("accepts only active, explicitly tagged prices", () => {
    expect(isShatteredSagaPrice({ active: true, metadata: { app: "shattered-saga" } })).toBe(true);
    expect(isShatteredSagaPrice({ active: false, metadata: { app: "shattered-saga" } })).toBe(false);
    expect(isShatteredSagaPrice({ active: true, metadata: { app: "viastellis" } })).toBe(false);
    expect(isShatteredSagaPrice({ active: true, metadata: {} })).toBe(false);
  });

  it("grants a pack exactly once across duplicate deliveries", async () => {
    const db = new FakeD1();
    db.users.set("user-1", { energy: 0, tier: "free", status: "none", subscriptionId: null });
    const { app, env } = testApp(db);
    const event = { id: "evt_pack", type: "checkout.session.completed", data: { object: {
      client_reference_id: "user-1", metadata: { app: "shattered-saga", kind: "pack", item: "turns_200" },
    } } };
    expect((await app.fetch(await signedRequest(event), env)).status).toBe(200);
    const duplicate = await app.fetch(await signedRequest(event), env);
    expect(await duplicate.json()).toMatchObject({ duplicate: true });
    expect(db.users.get("user-1")?.energy).toBe(200);
  });

  it("rolls back a failed batch so Stripe can retry safely", async () => {
    const db = new FakeD1();
    db.users.set("user-1", { energy: 0, tier: "free", status: "none", subscriptionId: null });
    db.failNextBatch = true;
    const { app, env } = testApp(db);
    const event = { id: "evt_retry", type: "checkout.session.completed", data: { object: {
      client_reference_id: "user-1", metadata: { app: "shattered-saga", kind: "pack", item: "turns_200" },
    } } };
    expect((await app.fetch(await signedRequest(event), env)).status).toBe(500);
    expect(db.events.has("evt_retry")).toBe(false);
    expect((await app.fetch(await signedRequest(event), env)).status).toBe(200);
    expect(db.users.get("user-1")?.energy).toBe(200);
  });

  it("ignores untagged and foreign events without changing users", async () => {
    const db = new FakeD1();
    db.users.set("user-1", { energy: 0, tier: "legend", status: "active", subscriptionId: "sub_ss" });
    const { app, env } = testApp(db);
    for (const [id, metadata] of [["evt_none", {}], ["evt_via", { app: "viastellis" }]] as const) {
      const event = { id, type: "customer.subscription.deleted", data: { object: {
        id: "sub_ss", customer: "cus_shared", status: "canceled", metadata,
      } } };
      const response = await app.fetch(await signedRequest(event), env);
      expect(await response.json()).toMatchObject({ ignored: "other_app" });
    }
    expect(db.users.get("user-1")?.tier).toBe("legend");
  });

  it("matches lifecycle changes on subscription id, never customer id", async () => {
    const db = new FakeD1();
    db.users.set("user-1", { energy: 0, tier: "legend", status: "active", subscriptionId: "sub_ss" });
    const { app, env } = testApp(db);
    const wrongSub = { id: "evt_wrong_sub", type: "customer.subscription.deleted", data: { object: {
      id: "sub_via", customer: "cus_shared", status: "canceled", metadata: { app: "shattered-saga" },
    } } };
    expect((await app.fetch(await signedRequest(wrongSub), env)).status).toBe(200);
    expect(db.users.get("user-1")?.tier).toBe("legend");
  });

  it("rejects an invalid signature before touching D1", async () => {
    const db = new FakeD1();
    const { app, env } = testApp(db);
    const response = await app.fetch(new Request("http://test/api/billing/webhook", {
      method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=bad" },
    }), env);
    expect(response.status).toBe(400);
    expect(db.events.size).toBe(0);
  });

  it("accepts any valid v1 signature during secret rotation", async () => {
    const db = new FakeD1();
    const { app, env } = testApp(db);
    const request = await signedRequest({ id: "evt_rotation", type: "ignored", data: { object: {
      metadata: { app: "shattered-saga" },
    } } });
    request.headers.set("stripe-signature", `${request.headers.get("stripe-signature")},v1=invalid`);
    expect((await app.fetch(request, env)).status).toBe(200);
  });
});
