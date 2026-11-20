// Recovering spent ammunition after a fight (Hans 2026-11-20).
//
// Every arrow or bolt loosed in combat is remembered as a hit or a miss. Once
// the fight is over the player can search for them: a Perception check, after
// which each one comes back with the chance below. A failed search halves the
// chances. Thrown weapons (daggers, hatchets, javelins) don't break and always
// come back. Arrows snap in bodies or are lost in grass; bolts are shorter and
// sturdier, so more of them survive.

import { getWeaponType } from '../data/gearStats';

export const RECOVERY_CHANCE = {
  arrow: { hit: 0.5, miss: 0.33 },
  bolt: { hit: 0.6, miss: 0.4 },
  thrown: { hit: 1, miss: 1 },
};

export const RECOVERY_SEARCH_DIFFICULTY = 'easy';

// --- Throwing (Hans 2026-11-20) ---------------------------------------------
// Only spares are thrown: a weapon held or worn stays put, so a character with
// one dagger in hand has nothing to throw, while one with three throwing
// knives in the pack has three.

/** What a thrown item does: { name, dice, hit, pierce, made, damageType } or null. */
export function getThrownProfile(itemName) {
  const t = getWeaponType(itemName);
  if (!t?.thrown) return null;
  return { name: ammoBaseName(itemName), label: t.label, damageType: t.damageType, pierce: 0, made: false, ...t.thrown };
}

/** Each throwable spare in the pack: [{ index, name, profile, count }]. */
export function listThrowables(inventory, equipment = {}) {
  const reserved = {};
  for (const name of Object.values(equipment || {})) {
    if (typeof name === 'string' && name) reserved[name.toLowerCase()] = (reserved[name.toLowerCase()] || 0) + 1;
  }
  const out = [];
  (inventory || []).forEach((item, index) => {
    if (typeof item !== 'string') return;
    const profile = getThrownProfile(item);
    if (!profile) return;
    const key = item.toLowerCase();
    const baseKey = ammoBaseName(item).toLowerCase();
    let count = stackCount(item);
    for (const k of [key, baseKey]) {
      const r = Math.min(count, reserved[k] || 0);
      count -= r;
      if (reserved[k]) reserved[k] -= r;
    }
    if (count > 0) out.push({ index, name: ammoBaseName(item), profile, count });
  });
  // Weapons made for throwing come first, then the better throw.
  return out.sort((a, b) => (Number(b.profile.made) - Number(a.profile.made)) || (b.profile.hit - a.profile.hit) || (a.index - b.index));
}

export function countThrowables(inventory, equipment) {
  return listThrowables(inventory, equipment).reduce((n, t) => n + t.count, 0);
}

/** Remove one item at an index (one from a "(N)" stack). */
export function takeItemAt(inventory, index) {
  const inv = [...(inventory || [])];
  const item = inv[index];
  if (item === undefined) return inv;
  const qty = stackCount(item);
  if (qty > 1 && /\(\d+\)\s*$/.test(item)) inv[index] = `${ammoBaseName(item)} (${qty - 1})`;
  else inv.splice(index, 1);
  return inv;
}

/** Give back n weapons: onto a "(N)" stack if one exists, else as single items. */
export function returnItems(inventory, name, n) {
  const inv = [...(inventory || [])];
  if (!(n > 0)) return inv;
  const idx = inv.findIndex(item => typeof item === 'string' && /\(\d+\)\s*$/.test(item) && ammoBaseName(item).toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    inv[idx] = `${ammoBaseName(inv[idx])} (${stackCount(inv[idx]) + n})`;
    return inv;
  }
  for (let i = 0; i < n; i++) inv.push(name);
  return inv;
}

/** Put recovered things back: ammunition onto its stack, thrown weapons as items. */
export function returnRecovered(inventory, spent, recovered) {
  let inv = inventory || [];
  for (const [name, n] of Object.entries(recovered || {})) {
    inv = spent?.[name]?.kind === 'thrown' ? returnItems(inv, name, n) : addAmmo(inv, name, n);
  }
  return inv;
}

/** Thrown weapons left in spentAmmo (always recoverable), as { [name]: n }. */
export function thrownSpent(spent) {
  const out = {};
  for (const [name, s] of Object.entries(spent || {})) {
    if (s.kind === 'thrown') out[name] = (s.hit || 0) + (s.miss || 0);
  }
  return out;
}

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
