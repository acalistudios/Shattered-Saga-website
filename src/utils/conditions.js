// Combat conditions with fixed effects (Hans 2026-11-19).
//
// Before this, [status: ...] from the GM was a label with a countdown on the
// player and was thrown away on an enemy. Each condition below now changes
// the dice. Durations count rounds: the player's conditions tick down on each
// player action, an enemy's on each of the player's combat maneuvers.
//
// Effects are kept small (the fighting-style edges are +-2 too) so a condition
// tilts a fight without deciding it.

import { rollDiceExpression } from './dice';

export const CONDITIONS = {
  stunned: { label: 'Stunned', icon: '💫', attack: -2, defence: -2, resist: -2, desc: '-2 to attacks, dodges, blocks and Resist.' },
  blinded: { label: 'Blinded', icon: '🙈', attack: -3, defence: -2, resist: 0, desc: '-3 to attacks, -2 to dodges and blocks.' },
  prone: { label: 'Prone', icon: '⬇️', attack: -1, defence: -2, resist: 0, desc: '-1 to attacks, -2 to dodges and blocks.' },
  frightened: { label: 'Frightened', icon: '😱', attack: -2, defence: 0, resist: -2, desc: '-2 to attacks and Resist.' },
  burning: { label: 'Burning', icon: '🔥', attack: 0, defence: 0, resist: 0, burn: '1d4', desc: 'Takes 1d4 fire damage each round; armour does not help.' },
  stone_mantle: { label: 'Stone Mantle', icon: '⛰️', attack: 0, defence: 0, resist: 0, soak: '1d6', desc: '+1d6 soak against physical blows (not curses or terror).' },
};

const ALIASES = {
  stun: 'stunned', dazed: 'stunned', daze: 'stunned', disoriented: 'stunned', staggered: 'stunned', reeling: 'stunned',
  blind: 'blinded', blindness: 'blinded', dazzled: 'blinded',
  knocked_down: 'prone', knockdown: 'prone', tripped: 'prone', downed: 'prone', floored: 'prone',
  afraid: 'frightened', fear: 'frightened', feared: 'frightened', scared: 'frightened', terrified: 'frightened', shaken: 'frightened', panicked: 'frightened',
  burn: 'burning', burned: 'burning', burnt: 'burning', on_fire: 'burning', aflame: 'burning', ignited: 'burning', alight: 'burning',
  stonemantle: 'stone_mantle', stone_skin: 'stone_mantle', stoneskin: 'stone_mantle',
};

/** The GM may not pin anyone down for long: one tag lasts at most this many rounds. */
export const MAX_GM_DURATION = 3;

/** Map a status name from the GM to a condition id, or null if it has no effect. */
export function normalizeCondition(name) {
  const key = String(name || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (CONDITIONS[key]) return key;
  return ALIASES[key] || null;
}

/** Sum the effects of a list of { id | name, duration } conditions. */
export function conditionMods(list) {
  const mods = { attack: 0, defence: 0, resist: 0, soak: [], burn: [], labels: [] };
  const seen = new Set();
  for (const c of list || []) {
    const id = normalizeCondition(c?.id || c?.name);
    if (!id || seen.has(id) || !(c.duration > 0)) continue;
    seen.add(id);
    const def = CONDITIONS[id];
    mods.attack += def.attack;
    mods.defence += def.defence;
    mods.resist += def.resist;
    if (def.soak) mods.soak.push(def.soak);
    if (def.burn) mods.burn.push(def.burn);
    mods.labels.push(def.label);
  }
  return mods;
}

/** Short "Stunned -2" text for roll logs; '' when nothing applies. */
export function conditionText(list, field) {
  const parts = [];
  const seen = new Set();
  for (const c of list || []) {
    const id = normalizeCondition(c?.id || c?.name);
    if (!id || seen.has(id) || !(c.duration > 0)) continue;
    seen.add(id);
    const v = CONDITIONS[id][field];
    if (v) parts.push(`${CONDITIONS[id].label.toLowerCase()} ${v}`);
  }
  return parts.join(', ');
}

/**
 * Add or refresh a condition. A refresh keeps the longer duration rather than
 * stacking. `fresh` marks one applied during this action so the tick at the
 * start of the next round does not eat it before it has done anything.
 */
export function addCondition(list, name, duration, { fresh = false, cap = null } = {}) {
  const id = normalizeCondition(name);
  if (!id) return list || [];
  const d = Math.max(1, Math.min(cap || Infinity, Math.floor(Number(duration) || 1)));
  const out = (list || []).map(c => ({ ...c }));
  const existing = out.find(c => normalizeCondition(c.id || c.name) === id);
  if (existing) {
    existing.id = id;
    existing.duration = Math.max(existing.duration || 0, d);
    if (fresh) existing.fresh = true;
  } else {
    out.push({ id, name: id, duration: d, ...(fresh ? { fresh: true } : {}) });
  }
  return out;
}

/**
 * Start-of-round tick for an enemy: burning deals its damage, then every
 * condition loses a round. Conditions marked fresh only lose the mark.
 * Pure: returns { enemy, damage, notes, changed }.
 */
export function tickEnemyConditions(enemy, roll = rollDiceExpression) {
  const list = enemy?.conditions || [];
  if (!list.length) return { enemy, damage: 0, notes: [], changed: false };
  let damage = 0;
  const notes = [];
  const next = [];
  for (const c of list) {
    const id = normalizeCondition(c.id || c.name);
    if (c.fresh) { next.push({ ...c, fresh: false }); continue; }
    const def = id ? CONDITIONS[id] : null;
    if (def?.burn) {
      const dmg = roll(def.burn);
      damage += dmg;
      notes.push(`${enemy.name} burns for ${dmg} damage`);
    }
    const duration = (c.duration || 0) - 1;
    if (duration > 0) next.push({ ...c, duration });
    else if (def) notes.push(`${enemy.name} is no longer ${def.label.toLowerCase()}`);
  }
  const hp = Math.max(0, (enemy.hp || 0) - damage);
  return { enemy: { ...enemy, hp, conditions: next }, damage, notes, changed: true };
}

// --- Cinderbreath: the Fire elemental power, resolved by the engine ---------

/** Damage dice grow with level: 2d6 to level 4, 3d6 to level 8, 4d6 after. */
export function cinderbreathDice(level = 1) {
  if (level >= 9) return '4d6';
  if (level >= 5) return '3d6';
  return '2d6';
}

export const CINDERBREATH_BURN_ROUNDS = 2;

/** 'immune' for creatures of fire, 'vulnerable' for creatures of ice, else 'normal'. */
export function fireAffinityOf(enemy) {
  const t = [enemy?.name, enemy?.role, enemy?.desc, enemy?.special, enemy?.armorText].filter(Boolean).join(' ').toLowerCase();
  if (/\b(fire|flame|ember|magma|lava|cinder|salamander|molten|volcanic|inferno)/.test(t.replace(/frostfire/g, ''))) return 'immune';
  if (/\b(frost|ice|icy|glacial|snow|rime|frozen)/.test(t.replace(/frostfire/g, ''))) return 'vulnerable';
  return 'normal';
}

/**
 * Resolve Cinderbreath (Hans 2026-11-19): a cone of flame cannot be dodged,
 * so it always hits. Only a shield can stop it. When the foe's block wins,
 * the shield takes the brunt (its block die comes off the damage) and the
 * foe is not set alight. Otherwise it takes the full fire dice and Burns.
 * Fire slips past armour either way: only half the foe's soak counts.
 * `shieldBlock` is the rolled shield die when the block succeeded, else 0.
 */
export function resolveCinderbreath({ level, enemy, blocked = false, shieldBlock = 0, roll = rollDiceExpression }) {
  const dice = cinderbreathDice(level);
  const affinity = fireAffinityOf(enemy);
  const raw = roll(dice);
  const soak = Math.floor(roll(enemy?.armorSoak || '1d3') / 2);
  let net = blocked ? Math.max(0, raw - soak - shieldBlock) : Math.max(1, raw - soak);
  if (affinity === 'vulnerable') net = Math.floor(net * 1.5);
  if (affinity === 'immune') net = 0;
  const burns = !blocked && affinity !== 'immune';
  return { dice, raw, soak, net, burns, affinity, blocked, shieldBlock };
}
