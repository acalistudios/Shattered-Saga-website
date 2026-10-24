// Road Patrol rules (design: Hans 2026-09-08, see memory
// project_shattered_saga_death_resurrection). Pure functions; the modal owns UI.
//
// Patrol is the repeatable leveling path. It must self-limit through the
// existing survival systems rather than a cooldown: every patrol costs hours
// and fatigue, and crossing midnight eats a ration (or starves you). Rewards
// are currency, consumables and only a CHANCE of better gear. Lethality is
// slightly lower than adventures: only a bad failure can kill. A retreat
// exists but can fail, and a failed retreat means pursuit.
import { consumeRationFromInventory } from './restEngine';

export const PATROL_HOURS = 4;
export const PATROL_FATIGUE = 3;
export const PATROL_GEAR_CHANCE = 0.25;
// A failure only kills when it misses by at least this much.
export const LETHAL_FAIL_MARGIN = 5;
// A failed retreat costs this share of the encounter's failure damage.
export const RETREAT_DAMAGE_FACTOR = 0.5;

// Who you face on each road. Type decides gear recovery on death: people carry
// your gear off, beasts leave it where you fell (gearRecovery.js rules).
export const PATROL_FOES = {
  highway_bandit_ambush: { name: 'Highwayman Captain', type: 'human' },
  harvest_vale_scavengers: { name: 'Blighted Scavenger Chief', type: 'human' },
  ashveil_ridge_raiders: { name: 'Mist Pass Brigand Chief', type: 'human' },
  redvein_gladiator_runaways: { name: 'Renegade Pit Gladiator', type: 'human' },
  frostfire_glacier_ambush: { name: 'White-Fur Pack', type: 'beast' },
  merrin_plague_carrion: { name: 'Plague Marauder', type: 'human' },
  cinder_coast_corsairs: { name: 'Corsair Captain', type: 'human' },
  astral_rift_void_stalkers: { name: 'Phase-Raider Captain', type: 'human' },
};

const CONSUMABLE_RE = /ration|herb|draught|elixir|potion|flask|vial|wrap|bundle|shard|brimstone|crystal|token|pelt/i;
export const isConsumable = (item) => CONSUMABLE_RE.test(String(item || ''));

/** Advance the clock and fatigue for one patrol, applying midnight rations. */
export function applyPatrolCosts(character, hours = PATROL_HOURS) {
  const stats = { ...(character.stats || {}) };
  let hour = (stats.hour ?? 13) + hours;
  let day = stats.day ?? 1;
  let midnights = 0;
  while (hour >= 24) { hour -= 24; day += 1; midnights += 1; }

  let inventory = [...(character.inventory || [])];
  let daysWithoutFood = character.daysWithoutFood || 0;
  for (let i = 0; i < midnights; i++) {
    const { hasRations, updatedInventory } = consumeRationFromInventory(inventory);
    inventory = updatedInventory;
    daysWithoutFood = hasRations ? 0 : daysWithoutFood + 1;
  }

  stats.day = day;
  stats.hour = hour;
  stats.fatigue = (stats.fatigue ?? stats.maxFatigue ?? 15) - PATROL_FATIGUE;
  return { ...character, stats, inventory, daysWithoutFood };
}

/**
 * Loot for a won encounter: the authored gold and consumables always, plus a
 * PATROL_GEAR_CHANCE of ONE of the authored gear pieces (never all of them).
 */
export function rollPatrolLoot(rewards = {}, rng = Math.random) {
  const authored = Array.isArray(rewards.items) ? rewards.items : [];
  const consumables = authored.filter(isConsumable);
  const gear = authored.filter(i => !isConsumable(i));
  const items = [...consumables];
  if (gear.length > 0 && rng() < PATROL_GEAR_CHANCE) {
    items.push(gear[Math.floor(rng() * gear.length) % gear.length]);
  }
  return { gold: Math.max(0, rewards.gold || 0), items, morality: rewards.morality || 0 };
}

const QTY_RE = /^(.*?)\s*\((\d+)\)$/;

/** Add loot, folding counted items ("Rations (1)") into an existing stack of the same name. */
export function addLootToInventory(inventory = [], items = []) {
  const next = [...inventory];
  for (const item of items) {
    const m = String(item).match(QTY_RE);
    const idx = m ? next.findIndex(i => {
      const im = String(i).match(QTY_RE);
      return im && im[1].toLowerCase() === m[1].toLowerCase();
    }) : -1;
    if (idx === -1) { next.push(item); continue; }
    const [, name, qty] = next[idx].match(QTY_RE);
    next[idx] = `${name} (${Number(qty) + Number(m[2])})`;
  }
  return next;
}

/**
 * Resolve damage from a failed approach. Ordinary failures leave you on your
 * feet (min 1 HP). Only a bad failure (margin <= -LETHAL_FAIL_MARGIN) can take
 * you to 0 or below, which is death and the resurrection flow.
 */
export function resolvePatrolFailure({ hp, damage, margin }) {
  const raw = hp - damage;
  const lethal = margin <= -LETHAL_FAIL_MARGIN;
  if (raw <= 0 && lethal) return { hp: raw, died: true };
  return { hp: Math.max(1, raw), died: false };
}

/** Damage taken when a retreat fails and the foe gives chase. */
export const retreatPursuitDamage = (failDamage) => Math.max(1, Math.round(failDamage * RETREAT_DAMAGE_FACTOR));

/** Gear-recovery record for a patrol death: no authored map, so it is tied to the region's road. */
export function patrolGearRecovery({ encounterId, regionId, diedAtHours, coldAfterHours = 72 }) {
  const foe = PATROL_FOES[encounterId] || { name: 'Road Ambusher', type: 'human' };
  const carries = foe.type === 'human';
  return {
    mode: carries ? 'carrier' : 'cache',
    carries,
    killer: foe.name,
    killerType: foe.type,
    location: carries ? `the ${foe.name}'s hideout off the roads` : 'the patrol road where you fell',
    adventureId: null,
    patrolEncounterId: encounterId,
    patrolRegion: regionId,
    diedAtHours,
    coldAtHours: diedAtHours + coldAfterHours,
    movesAfterHours: carries ? 12 : 24,
    coldAfterHours,
  };
}

/** A pending patrol recovery in this region means the next patrol meets that foe again. */
export function pendingPatrolEncounterFor(character, regionId) {
  const p = character?.progression?.pendingGearRecovery;
  return p && p.patrolRegion === regionId ? p.patrolEncounterId : null;
}
