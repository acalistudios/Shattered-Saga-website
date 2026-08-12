import type { Hono } from "hono";
import type { Env } from "./auth";

// A single slot payload is a JSON blob of the game's per-slot storage keys.
// Cap it so a client can't push unbounded data into D1.
const MAX_SLOT_BYTES = 512 * 1024; // 512 KB
const MAX_SLOT_INDEX = 8;

// Slot pricing must match the client's display. Server is authoritative.
const SLOT_UNLOCK_COST = 5;
const DEFAULT_SLOTS = [1, 2];

type SessionUser = { id: string };

function parseUnlockedSlots(raw?: string | null): number[] {
  try {
    const parsed = JSON.parse(raw ?? "");
    if (Array.isArray(parsed)) {
      return parsed.map(Number).filter((slot) => Number.isInteger(slot));
    }
  } catch {
    /* fall back to defaults */
  }
  return DEFAULT_SLOTS;
}

async function isSlotUnlocked(env: Env, userId: string, slot: number): Promise<boolean> {
  const row = await env.DATABASE.prepare("SELECT unlocked_slots FROM users WHERE id = ?")
    .bind(userId)
    .first<{ unlocked_slots: string }>();
  return parseUnlockedSlots(row?.unlocked_slots).includes(slot);
}

export function registerSaveRoutes(
  app: Hono<{ Bindings: Env }>,
  getUser: (c: any) => Promise<SessionUser | null>
) {
  /** List slot metadata (not the payloads — keeps the response small). */
  app.get("/api/saves", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);
    const account = await c.env.DATABASE.prepare("SELECT unlocked_slots FROM users WHERE id = ?")
      .bind(user.id)
      .first<{ unlocked_slots: string }>();
    const unlocked = new Set(parseUnlockedSlots(account?.unlocked_slots));

    const { results } = await c.env.DATABASE.prepare(
      "SELECT slot_index, char_name, updated_at, length(data) AS size FROM save_slots WHERE user_id = ? ORDER BY slot_index"
    )
      .bind(user.id)
      .all<{ slot_index: number; char_name: string | null; updated_at: number; size: number }>();

    return c.json({ slots: (results ?? []).filter((slot) => unlocked.has(Number(slot.slot_index))) });
  });

  /** Fetch one slot's full payload. */
  app.get("/api/saves/:slot", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const slot = Number(c.req.param("slot"));
    if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOT_INDEX) {
      return c.json({ error: "bad_slot" }, 400);
    }
    if (!(await isSlotUnlocked(c.env, user.id, slot))) {
      return c.json({ error: "slot_locked" }, 403);
    }

    const row = await c.env.DATABASE.prepare(
      "SELECT data, char_name, updated_at FROM save_slots WHERE user_id = ? AND slot_index = ?"
    )
      .bind(user.id, slot)
      .first<{ data: string; char_name: string | null; updated_at: number }>();

    if (!row) return c.json({ error: "not_found" }, 404);

    let data: unknown = null;
    try {
      data = JSON.parse(row.data);
    } catch {
      return c.json({ error: "corrupt_save" }, 500);
    }
    return c.json({ slot, data, charName: row.char_name, updatedAt: row.updated_at });
  });

  /** Upload/overwrite one slot. Last write wins — the client decides when to push. */
  app.put("/api/saves/:slot", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const slot = Number(c.req.param("slot"));
    if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOT_INDEX) {
      return c.json({ error: "bad_slot" }, 400);
    }
    if (!(await isSlotUnlocked(c.env, user.id, slot))) {
      return c.json({ error: "slot_locked" }, 403);
    }

    let body: { data?: unknown; charName?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "bad_request" }, 400);
    }
    if (body.data == null) return c.json({ error: "bad_request", message: "Missing data." }, 400);

    const serialized = JSON.stringify(body.data);
    if (serialized.length > MAX_SLOT_BYTES) {
      return c.json(
        { error: "payload_too_large", message: "Save is too large to sync. Older history is trimmed automatically." },
        413
      );
    }

    const now = Date.now();
    await c.env.DATABASE.prepare(
      `INSERT INTO save_slots (user_id, slot_index, data, char_name, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, slot_index)
       DO UPDATE SET data = excluded.data, char_name = excluded.char_name, updated_at = excluded.updated_at`
    )
      .bind(user.id, slot, serialized, String(body.charName ?? "").slice(0, 80) || null, now)
      .run();

    return c.json({ ok: true, slot, updatedAt: now });
  });

  /** Delete a slot (wipe character). */
  app.delete("/api/saves/:slot", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const slot = Number(c.req.param("slot"));
    if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOT_INDEX) {
      return c.json({ error: "bad_slot" }, 400);
    }

    await c.env.DATABASE.prepare("DELETE FROM save_slots WHERE user_id = ? AND slot_index = ?")
      .bind(user.id, slot)
      .run();
    return c.json({ ok: true });
  });

  /**
   * Spend gems to unlock a save slot. Done in one conditional UPDATE so the
   * balance check and the debit cannot race — the same pattern used for energy.
   */
  app.post("/api/slots/unlock", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    let body: { slot?: number };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "bad_request" }, 400);
    }
    const slot = Number(body.slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOT_INDEX) {
      return c.json({ error: "bad_slot" }, 400);
    }

    const row = await c.env.DATABASE.prepare(
      "SELECT gems, unlocked_slots FROM users WHERE id = ?"
    )
      .bind(user.id)
      .first<{ gems: number; unlocked_slots: string }>();
    if (!row) return c.json({ error: "not_found" }, 404);

    let unlocked = parseUnlockedSlots(row.unlocked_slots);

    if (unlocked.includes(slot)) {
      return c.json({ ok: true, alreadyUnlocked: true, gems: row.gems, unlockedSlots: unlocked });
    }

    const next = [...unlocked, slot].sort((a, b) => a - b);
    const res = await c.env.DATABASE.prepare(
      "UPDATE users SET gems = gems - ?, unlocked_slots = ? WHERE id = ? AND gems >= ?"
    )
      .bind(SLOT_UNLOCK_COST, JSON.stringify(next), user.id, SLOT_UNLOCK_COST)
      .run();

    if (res.meta.changes === 0) {
      return c.json({ error: "insufficient_gems", message: `Unlocking a slot costs ${SLOT_UNLOCK_COST} gems.` }, 402);
    }

    return c.json({ ok: true, gems: row.gems - SLOT_UNLOCK_COST, unlockedSlots: next });
  });

  /** Spend gems on anything else (marketplace hook). Atomic. */
  app.post("/api/gems/spend", async (c) => {
    const user = await getUser(c);
    if (!user) return c.json({ error: "unauthorized" }, 401);

    let body: { amount?: number; reason?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "bad_request" }, 400);
    }
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
      return c.json({ error: "bad_amount" }, 400);
    }

    const res = await c.env.DATABASE.prepare(
      "UPDATE users SET gems = gems - ? WHERE id = ? AND gems >= ?"
    )
      .bind(amount, user.id, amount)
      .run();

    if (res.meta.changes === 0) {
      return c.json({ error: "insufficient_gems" }, 402);
    }

    const row = await c.env.DATABASE.prepare("SELECT gems FROM users WHERE id = ?")
      .bind(user.id)
      .first<{ gems: number }>();
    return c.json({ ok: true, gems: row?.gems ?? 0 });
  });
}

export async function readGemState(env: Env, userId: string) {
  const row = await env.DATABASE.prepare(
    "SELECT gems, unlocked_slots FROM users WHERE id = ?"
  )
    .bind(userId)
    .first<{ gems: number; unlocked_slots: string }>();

  let unlocked = parseUnlockedSlots(row?.unlocked_slots);
  return { gems: row?.gems ?? 0, unlockedSlots: unlocked };
}
