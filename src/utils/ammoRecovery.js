// Recovering spent ammunition after a fight (Hans 2026-11-20).
//
// Every arrow or bolt loosed in combat is remembered as a hit or a miss. Once
// the fight is over the player can search for them: a Perception check, after
// which each one comes back with the chance below. A failed search halves the
// chances. Thrown weapons (daggers, hatchets, javelins) don't break and always
// come back. Arrows snap in bodies or are lost in grass; bolts are shorter and
// sturdier, so more of them survive.

export const RECOVERY_CHANCE = {
  arrow: { hit: 0.5, miss: 0.33 },
  bolt: { hit: 0.6, miss: 0.4 },
  thrown: { hit: 1, miss: 1 },
};

export const RECOVERY_SEARCH_DIFFICULTY = 'easy';

/** 'bolt' or 'arrow' for an ammunition item, 'thrown' for a thrown weapon, else null. */
export function ammoKindOf(itemName) {
  const t = String(itemName || '').toLowerCase();
  if (/\bbolts?\b/.test(t)) return 'bolt';
  if (/\barrows?\b/.test(t)) return 'arrow';
  if (/\b(throwing|javelin|dart)/.test(t)) return 'thrown';
  return null;
}

/** A crossbow shoots bolts, every other bow shoots arrows. */
export function ammoKindForWeapon(weaponName) {
  return /crossbow/i.test(String(weaponName || '')) ? 'bolt' : 'arrow';
}

/** "Arrows (20)" -> "Arrows" */
export function ammoBaseName(itemName) {
  return String(itemName || '').replace(/\s*\(\d+\)\s*$/, '').trim();
}

/** Quantity of an inventory stack: "Arrows (20)" -> 20, "Arrow" -> 1. */
export function stackCount(itemName) {
  const m = String(itemName || '').match(/\((\d+)\)\s*$/);
  return m ? parseInt(m[1], 10) : 1;
}

/** Index of the first stack of this kind in the inventory, or -1. */
export function findAmmoIndex(inventory, kind) {
  return (inventory || []).findIndex(item => typeof item === 'string' && ammoKindOf(item) === kind);
}

/** Total count of ammunition of this kind carried. */
export function countAmmo(inventory, kind) {
  return (inventory || []).reduce((n, item) => (ammoKindOf(item) === kind ? n + stackCount(item) : n), 0);
}

/** Take one piece of ammunition of this kind; returns { inventory, name } (name null if none). */
export function takeOneAmmo(inventory, kind) {
  const inv = [...(inventory || [])];
  const idx = findAmmoIndex(inv, kind);
  if (idx === -1) return { inventory: inv, name: null };
  const item = inv[idx];
  const qty = stackCount(item);
  if (qty > 1) inv[idx] = `${ammoBaseName(item)} (${qty - 1})`;
  else inv.splice(idx, 1);
  return { inventory: inv, name: ammoBaseName(item) };
}

/** Put n pieces back, merging into an existing stack of the same name. */
export function addAmmo(inventory, baseName, n) {
  const inv = [...(inventory || [])];
  if (!(n > 0)) return inv;
  const idx = inv.findIndex(item => typeof item === 'string' && ammoBaseName(item).toLowerCase() === baseName.toLowerCase());
  if (idx === -1) inv.push(`${baseName} (${n})`);
  else inv[idx] = `${ammoBaseName(inv[idx])} (${stackCount(inv[idx]) + n})`;
  return inv;
}

/** Remember one shot: spent is { [baseName]: { kind, hit, miss } }. */
export function recordSpent(spent, baseName, kind, hit) {
  const out = { ...(spent || {}) };
  const cur = out[baseName] || { kind, hit: 0, miss: 0 };
  out[baseName] = { ...cur, kind: cur.kind || kind, [hit ? 'hit' : 'miss']: (cur[hit ? 'hit' : 'miss'] || 0) + 1 };
  return out;
}

export function spentTotal(spent) {
  return Object.values(spent || {}).reduce((n, s) => n + (s.hit || 0) + (s.miss || 0), 0);
}

/**
 * Roll recovery for everything spent. Returns { recovered: { [name]: n },
 * lost: { [name]: n }, found, total }. Thrown weapons always come back.
 */
export function rollRecovery(spent, searchSucceeded, rand = Math.random) {
  const recovered = {};
  const lost = {};
  let found = 0;
  let total = 0;
  for (const [name, s] of Object.entries(spent || {})) {
    const chance = RECOVERY_CHANCE[s.kind] || RECOVERY_CHANCE.arrow;
    const factor = s.kind === 'thrown' || searchSucceeded ? 1 : 0.5;
    let got = 0;
    for (const [outcome, n] of [['hit', s.hit || 0], ['miss', s.miss || 0]]) {
      for (let i = 0; i < n; i++) if (rand() < chance[outcome] * factor) got++;
    }
    const count = (s.hit || 0) + (s.miss || 0);
    total += count;
    found += got;
    if (got) recovered[name] = got;
    if (count - got) lost[name] = count - got;
  }
  return { recovered, lost, found, total };
}
