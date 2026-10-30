import type { Hono } from "hono";
import type { Env } from "./auth";

// Gem store (Hans, 2026-10-28, A4). The SERVER owns the price: the client
// names an item, never an amount, so a modified client cannot buy a Rite for
// one gem. The client copy in src/data/gemStore.js is display-only and a test
// keeps the two tables identical.
export const STORE_ITEMS: Record<string, { item: string; gems: number }> = {
  rite_of_quiet_return: { item: "Rite of Quiet Return", gems: 10 },
  breath_of_the_creator: { item: "Breath of the Creator", gems: 8 },
  thread_of_returning: { item: "Thread of Returning", gems: 5 },
};

type SessionUser = { id: string };

export function registerStoreRoutes(
  app: Hono<{ Bindings: Env }>,
  getUser: (c: any) => Promise<SessionUser | null>
) {
  /**
   * Buy one item for gems. The debit is a single conditional UPDATE, so two
   * concurrent purchases can never take the balance below zero. The response
   * names the item to grant; the save that holds it is client-owned.
   */
  app.post("/api/store/buy", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    let body: { itemId?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "bad_request" }, 400);
    }
    const entry = typeof body.itemId === "string" ? STORE_ITEMS[body.itemId] : undefined;
    if (!entry) return c.json({ error: "unknown_item" }, 400);

    const res = await c.env.DATABASE.prepare(
      "UPDATE users SET gems = gems - ? WHERE id = ? AND gems >= ?"
    )
      .bind(entry.gems, user.id, entry.gems)
      .run();
    if (res.meta.changes === 0) {
      return c.json({ error: "insufficient_gems", message: `${entry.item} costs ${entry.gems} gems.` }, 402);
    }

    const row = await c.env.DATABASE.prepare("SELECT gems FROM users WHERE id = ?")
      .bind(user.id)
      .first<{ gems: number }>();
    return c.json({ ok: true, itemId: body.itemId, item: entry.item, gems: row?.gems ?? 0 });
  });
}
