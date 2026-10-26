// Road Patrol rules (design: Hans 2026-09-08, see memory
// project_shattered_saga_death_resurrection; played as a GM-run encounter per
// Hans 2026-10-24). Pure functions; useGameState wires them to play.
//
// A patrol is a short scene the GM runs on the play screen like any adventure
// encounter: the player acts turn by turn, the engine resolves checks and
// combat. It is NOT an adventure start: nothing is refilled. A non-bankable
// between-adventure allowance limits repeat attempts; fatigue is spent on
// setting out, at least PATROL_HOURS pass, and crossing midnight eats a ration.
// Rewards are predefined (the GM never grants them): currency, consumables and
// only a CHANCE of better gear. Death uses the normal resurrection flow, and a
// foe that kills you keeps your gear until you meet them on that road again.
import { consumeRationFromInventory } from './restEngine';
import { TRAVEL_ENCOUNTERS } from '../data/travelEncounters';
import { getMapReadiness } from './mapReadiness';
import { isGearTrailCold } from './resurrectionEngine';

export const PATROL_HOURS = 4;
export const PATROL_FATIGUE = 3;
export const PATROL_GEAR_CHANCE = 0.25;
export const INITIAL_PATROL_ALLOWANCE = 1;
export const PATROLS_AFTER_ADVENTURE = 2;

/** A completed adventure replaces the allowance; unused patrols never accumulate. */
export function getPatrolAllowance(character) {
  const completions = new Set(character?.completed_adventures || []).size;
  const limit = completions ? PATROLS_AFTER_ADVENTURE : INITIAL_PATROL_ALLOWANCE;
  const saved = character?.progression?.patrolAllowance;
  const used = saved?.completions === completions ? Math.max(0, saved.used || 0) : 0;
  return { completions, limit, used, remaining: Math.max(0, limit - used) };
}

export function canBeginPatrol(character) {
  return getMapReadiness(character).canPatrol && getPatrolAllowance(character).remaining > 0
    && !character?.progression?.activePatrol;
}

// Poor roadside bands cannot pay adventure-sized rewards, even on later roads.
export const patrolGoldCap = (level = 1) => Math.min(20, Math.max(1, Math.floor(level)) * 2);
// Abandoning a patrol mid-fight: they run you down for this share of max HP
// (never lethal) before you get clear.
export const FLEE_PURSUIT_FRACTION = 0.25;

export const PATROL_ID_PREFIX = 'patrol:';
export const isPatrolId = (id) => typeof id === 'string' && id.startsWith(PATROL_ID_PREFIX);
export const patrolEncounterIdOf = (id) => (isPatrolId(id) ? id.slice(PATROL_ID_PREFIX.length) : null);

const humanStats = (HP, attack, damage) => ({
  HP,
  attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 2, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 },
  defenses: { dodge: 'Coordination d8 + Vigor d4', block: 'Power d8 + Coordination d4' },
  armor: 'Light armor soak 1d3',
  attacks: [{ name: attack, skill: 'Light Weapons', damage }],
});

// Who leads each ambush. Type decides gear recovery on death: people carry
// your gear off, beasts leave it where you fell (gearRecovery.js rules). The
// engine tracks the leader in combat; the rest of the band is narrative.
export const PATROL_FOES = {
  highway_bandit_ambush: { name: 'Highwayman Captain', type: 'human', stats: humanStats(16, 'Notched Sabre', '1d6 slashing') },
  harvest_vale_scavengers: { name: 'Blighted Scavenger Chief', type: 'human', stats: humanStats(14, 'Rusted Scythe', '1d6 slashing') },
  ashveil_ridge_raiders: { name: 'Mist Pass Brigand Chief', type: 'human', stats: humanStats(18, 'Brigand Axe', '1d8 slashing') },
  redvein_gladiator_runaways: { name: 'Renegade Pit Gladiator', type: 'human', stats: humanStats(20, 'Pit Trident', '1d8 piercing') },
  frostfire_glacier_ambush: {
    name: 'White-Fur Pack',
    type: 'beast',
    stats: {
      HP: 18,
      attributes: { Power: 4, Coordination: 4, Vigor: 3, Willpower: 2, Intellect: 1, Charisma: 1, Attunement: 1, Empathy: 1 },
      defenses: { dodge: 'Coordination d8 + Vigor d4' },
      armor: 'Thick fur, light armor soak 1d3',
      attacks: [{ name: 'Savaging Bite', skill: 'Brawling', damage: '1d6 piercing' }],
    },
  },
  merrin_plague_carrion: { name: 'Plague Marauder', type: 'human', stats: humanStats(16, 'Hooked Cleaver', '1d6 slashing') },
  cinder_coast_corsairs: { name: 'Corsair Captain', type: 'human', stats: humanStats(18, 'Corsair Cutlass', '1d8 slashing') },
  astral_rift_void_stalkers: { name: 'Phase-Raider Captain', type: 'human', stats: humanStats(20, 'Phase Blade', '1d8 slashing') },
};

// Talking, bribing or cowing the band off: these approaches pay a "parley" result.
const PARLEY_APPROACHES = new Set([
  'diplomatic_parley', 'corsair_bribe', 'mountain_intimidation', 'ration_bargain',
  'gladiator_code', 'pack_negotiate', 'medical_triage_parley', 'planar_bargain',
]);
export const isParleyApproach = (approach) => PARLEY_APPROACHES.has(approach?.id);

const adventureCache = new Map();

/**
 * The synthetic "adventure" a patrol is played as, in the shape the GM prompt
 * and combat code already read. Authored approaches become hints, not menus.
 */
export function buildPatrolAdventure(patrolId) {
  if (adventureCache.has(patrolId)) return adventureCache.get(patrolId);
  const encounter = TRAVEL_ENCOUNTERS.find(e => e.id === patrolEncounterIdOf(patrolId));
  if (!encounter) return null;
  const foe = PATROL_FOES[encounter.id] || { name: 'Road Ambusher', type: 'human', stats: humanStats(16, 'Blade', '1d6 slashing') };
  const setting = 'The Ambush Site';
  const adventure = {
    id: patrolId,
    isPatrol: true,
    patrolEncounterId: encounter.id,
    name: encounter.title,
    region: encounter.region,
    regionName: encounter.regionName,
    desc: encounter.intro,
    backstory: encounter.intro,
    suggestedGm: 'narrator',
    startingPrompt: encounter.intro,
    objectives: ['Survive the ambush: defeat or rout the band, talk or buy your way past, or escape.'],
    settings: [setting],
    settingDescriptions: { [setting]: encounter.intro },
    npcs: [{
      name: foe.name,
      role: foe.type === 'beast' ? 'Pack Leader' : 'Ambush Leader',
      desc: `Leads the ambush. ${foe.type === 'beast' ? 'A beast: it cannot be reasoned with, only driven off or calmed.' : 'Can be fought, threatened, bargained with, or escaped.'}`,
      stats: foe.stats,
    }],
    items: [],
    itemsDetail: [],
    playabilityGuidance: [
      'This is a short roadside encounter, not an adventure: one scene, resolved in about six exchanges.',
      'Approaches that suit this ambush (let the player find their own; these are hints, not a menu):',
      ...encounter.approaches.map(a => `- ${a.name} (${a.skill.replace(/_/g, ' ')}): ${a.actionDesc}`),
    ].join('\n'),
  };
  adventureCache.set(patrolId, adventure);
  return adventure;
}

export const patrolIdFor = (encounterId) => `${PATROL_ID_PREFIX}${encounterId}`;

const CONSUMABLE_RE = /ration|herb|draught|elixir|potion|flask|vial|wrap|bundle|shard|brimstone|crystal|token|pelt/i;
export const isConsumable = (item) => CONSUMABLE_RE.test(String(item || ''));

/**
 * Advance the clock by `hours` (eating a ration per midnight crossed) and spend
 * `fatigue`. Patrols spend fatigue on setting out and top the clock up to
 * PATROL_HOURS when they end.
 */
export function applyPatrolCosts(character, hours = PATROL_HOURS, fatigue = PATROL_FATIGUE) {
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
  stats.fatigue = (stats.fatigue ?? stats.maxFatigue ?? 15) - fatigue;
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

const hourStamp = (stats = {}) => ((stats.day || 1) - 1) * 24 + (stats.hour || 0);

/** Setting out on patrol: spend the fatigue and remember when and where it began. */
export function beginPatrol(character, encounterId) {
  const encounter = TRAVEL_ENCOUNTERS.find(e => e.id === encounterId);
  if (!encounter || !canBeginPatrol(character)) return character;
  const allowance = getPatrolAllowance(character);
  const spent = applyPatrolCosts(character, 0, PATROL_FATIGUE);
  return {
    ...spent,
    is_free_roaming: false,
    progression: {
      ...(spent.progression || {}),
      patrolAllowance: { completions: allowance.completions, used: allowance.used + 1 },
      activePatrol: {
        encounterId,
        regionId: encounter?.region || null,
        startedAtHours: hourStamp(character.stats),
        fought: false,
      },
      lastPatrolResult: null,
    },
  };
}

/** A fight broke out: only a fought patrol can end in "victory". */
export function markPatrolFought(character) {
  const active = character?.progression?.activePatrol;
  if (!active || active.fought) return character;
  return { ...character, progression: { ...character.progression, activePatrol: { ...active, fought: true } } };
}

export const PATROL_OUTCOMES = ['victory', 'parley', 'escaped'];

/**
 * The GM's claimed ending, checked against what the engine saw. Victory needs
 * a fight; a "victory" with no fight is a parley at best.
 */
export function normalizePatrolOutcome(claimed, { fought }) {
  const outcome = String(claimed || '').trim().toLowerCase();
  if (outcome === 'victory') return fought ? 'victory' : 'parley';
  return PATROL_OUTCOMES.includes(outcome) ? outcome : 'escaped';
}

/** Roll the predefined spoils for an outcome. Escaping pays nothing. */
export function rollPatrolOutcomeLoot(encounterId, outcome, rng = Math.random, level = 1) {
  const encounter = TRAVEL_ENCOUNTERS.find(e => e.id === encounterId);
  if (!encounter || outcome === 'escaped') return { gold: 0, items: [], morality: 0 };
  const pool = encounter.approaches.filter(a => (outcome === 'parley') === isParleyApproach(a));
  if (pool.length === 0) return { gold: 0, items: [], morality: 0 };
  const approach = pool[Math.floor(rng() * pool.length) % pool.length];
  const loot = rollPatrolLoot(approach.rewards, rng);
  return { ...loot, gold: Math.min(loot.gold, patrolGoldCap(level)) };
}

/**
 * Apply a patrol's ending: spoils, morality, gear won back from the foe that
 * took it, and the clock topped up to PATROL_HOURS since setting out.
 * `loot` is rolled by the caller so the announced and applied spoils match.
 */
export function finishPatrol(character, { outcome, loot, pursuitDamage = 0 }) {
  const active = character?.progression?.activePatrol;
  if (!active) return { character, recovered: [] };

  const elapsed = hourStamp(character.stats) - (active.startedAtHours ?? hourStamp(character.stats));
  let next = applyPatrolCosts(character, Math.max(0, PATROL_HOURS - elapsed), 0);

  if (pursuitDamage > 0) {
    next = { ...next, stats: { ...next.stats, hp: Math.max(1, (next.stats.hp ?? 1) - pursuitDamage) } };
  }

  const gold = loot?.gold || 0;
  let currency = next.currency;
  if (gold > 0) {
    const gp = currency?.gp ?? currency?.gold ?? 0;
    currency = { ...(currency || {}), gp: gp + gold, gold: gp + gold };
  }
  next = {
    ...next,
    currency,
    inventory: addLootToInventory(next.inventory, loot?.items || []),
    morality: Math.max(-100, Math.min(100, (next.morality || 0) + (loot?.morality || 0))),
  };

  // Beating the band that killed you on this road wins your gear back.
  const pending = next.progression?.pendingGearRecovery;
  let recovered = [];
  if (outcome === 'victory' && pending?.patrolEncounterId === active.encounterId
    && pending.patrolRegion === active.regionId && !isGearTrailCold(next, hourStamp(next.stats))) {
    recovered = pending.items || [];
    next = {
      ...next,
      inventory: [...next.inventory, ...recovered],
      progression: { ...next.progression, pendingGearRecovery: null },
    };
  }

  next = {
    ...next,
    progression: {
      ...next.progression,
      activePatrol: null,
      lastPatrolResult: { encounterId: active.encounterId, outcome, loot, recovered, pursuitDamage },
    },
  };
  return { character: next, recovered };
}

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

/** One-line summary of a finished patrol for the play log. */
export function describePatrolResult({ outcome, loot, recovered = [], pursuitDamage = 0 }) {
  const head = {
    victory: 'Patrol over: the band is beaten.',
    parley: 'Patrol over: you got past without a fight.',
    escaped: 'Patrol over: you got away.',
  }[outcome] || 'Patrol over.';
  const parts = [];
  if (loot?.gold > 0) parts.push(`+${loot.gold} gp`);
  if (loot?.items?.length) parts.push(loot.items.join(', '));
  if (loot?.morality) parts.push(`Morality ${loot.morality > 0 ? '+' : ''}${loot.morality}`);
  const spoils = parts.length ? ` Spoils: ${parts.join(' · ')}.` : '';
  const gear = recovered.length ? ` Recovered your lost gear: ${recovered.join(', ')}.` : '';
  const hurt = pursuitDamage > 0 ? ` They ran you down as you fled: -${pursuitDamage} HP.` : '';
  return `[${head}${spoils}${gear}${hurt} At least ${PATROL_HOURS} hours passed on the road.]`;
}
