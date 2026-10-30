// Iron Colosseum Arena (design: 260904 handoff; built per Hans 2026-10-28,
// A16). The second repeatable after Road Patrol. Pure functions;
// useGameState wires them to play, the same way it runs patrols.
//
// - Opens once "Chains of the Iron Colosseum" is completed.
// - Escalating brackets: winning one opens the next. Each has an entry fee
//   (paid on entry, never refunded) and a purse paid only on a win, so
//   rewards scale with difficulty.
// - A bout is a short GM-run fight on the play screen against a fixed
//   champion. Bouts are to yield, not to the death: dropping to 0 HP loses
//   the bout and leaves you at 1 HP. Yielding (leaving) also loses.
// - Rate-limited like patrols: a between-adventure allowance that does not
//   bank, fatigue on entry, and at least ARENA_HOURS on the clock.
// The GM never pays anything: it signals [arena_end: victory|defeat] and the
// engine decides what that is worth.
import { consumeRationFromInventory } from './restEngine';
import { getMapReadiness } from './mapReadiness';

export const ARENA_UNLOCK_ADVENTURE = 'iron_colosseum';
export const ARENA_ID_PREFIX = 'arena:';
export const ARENA_HOURS = 2;
export const ARENA_FATIGUE = 3;
export const ARENA_BOUTS_AFTER_ADVENTURE = 2;

const champion = ({ name, desc, HP, power, coordination, vigor, attack, damage, armor }) => ({
  name,
  desc,
  stats: {
    HP,
    attributes: { Power: power, Coordination: coordination, Vigor: vigor, Willpower: 3, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 1 },
    defenses: { dodge: `Coordination d${coordination * 2} + Vigor d4`, block: `Power d${power * 2} + Coordination d4` },
    armor,
    attacks: [{ name: attack, skill: 'Martial Weapons', damage }],
  },
});

// Provisional numbers pending Hans's A8 economy formulas.
export const ARENA_BRACKETS = [
  {
    id: 'initiate',
    name: 'Pit Initiates',
    feeGp: 5,
    purseGp: 15,
    opponent: champion({ name: 'Sevrin the Chain-Breaker', desc: 'A freed pit slave fighting for coin now, all elbows and grudge.', HP: 22, power: 3, coordination: 3, vigor: 3, attack: 'Weighted Chain', damage: '1d6 blunt', armor: 'Light armor soak 1d3' }),
  },
  {
    id: 'blooded',
    name: 'The Blooded',
    feeGp: 10,
    purseGp: 30,
    opponent: champion({ name: 'Marra Two-Spears', desc: 'A Redvein veteran who fights at reach and punishes anyone who closes carelessly.', HP: 30, power: 4, coordination: 4, vigor: 3, attack: 'Barbed Spear', damage: '1d8 piercing', armor: 'Medium armor soak 1d4' }),
  },
  {
    id: 'champions',
    name: "Champions' Circle",
    feeGp: 20,
    purseGp: 60,
    opponent: champion({ name: 'Old Torvald Ironhide', desc: 'Twenty years undefeated in his circle. Slow, patient, and almost impossible to hurt.', HP: 40, power: 5, coordination: 3, vigor: 5, attack: 'Tower Maul', damage: '1d10 blunt', armor: 'Heavy armor soak 1d6' }),
  },
  {
    id: 'grand',
    name: 'Grand Champion',
    feeGp: 40,
    purseGp: 120,
    opponent: champion({ name: 'The Crimson Lion', desc: 'The reigning Grand Champion of the Iron Colosseum, fast and theatrical and lethal with twin blades.', HP: 52, power: 5, coordination: 6, vigor: 4, attack: 'Twin Sabres', damage: '2d6 slashing', armor: 'Medium armor soak 1d4' }),
  },
];

export const isArenaId = (id) => typeof id === 'string' && id.startsWith(ARENA_ID_PREFIX);
export const arenaBracketIdOf = (id) => (isArenaId(id) ? id.slice(ARENA_ID_PREFIX.length) : null);
export const arenaIdFor = (bracketId) => `${ARENA_ID_PREFIX}${bracketId}`;
const bracketIndex = (bracketId) => ARENA_BRACKETS.findIndex(b => b.id === bracketId);

export const isArenaUnlocked = (character) =>
  (character?.completed_adventures || []).includes(ARENA_UNLOCK_ADVENTURE);

/** Wins/losses and the highest bracket won (-1 = none yet). */
export function getArenaRecord(character) {
  const saved = character?.progression?.arena || {};
  return { highestWon: saved.highestWon ?? -1, wins: saved.wins || 0, losses: saved.losses || 0 };
}

/** Bracket 0 is always open; each win opens the next. */
export const isBracketOpen = (character, bracketId) =>
  bracketIndex(bracketId) !== -1 && bracketIndex(bracketId) <= getArenaRecord(character).highestWon + 1;

/** Same shape as patrols: completing an adventure replaces the allowance. */
export function getArenaAllowance(character) {
  const completions = new Set(character?.completed_adventures || []).size;
  const limit = ARENA_BOUTS_AFTER_ADVENTURE;
  const saved = character?.progression?.arenaAllowance;
  const used = saved?.completions === completions ? Math.max(0, saved.used || 0) : 0;
  return { completions, limit, used, remaining: Math.max(0, limit - used) };
}

const goldOf = (character) => character?.currency?.gp ?? character?.currency?.gold ?? 0;
const withGold = (character, gp) => ({ ...character, currency: { ...(character.currency || {}), gp, gold: gp } });
const hourStamp = (stats = {}) => ((stats.day || 1) - 1) * 24 + (stats.hour || 0);

/** Why a bracket cannot be entered right now, or '' if it can. */
export function arenaBlockReason(character, bracketId) {
  const bracket = ARENA_BRACKETS[bracketIndex(bracketId)];
  if (!isArenaUnlocked(character)) return 'Complete Chains of the Iron Colosseum to open the Arena.';
  if (!bracket) return 'Unknown bracket.';
  if (!isBracketOpen(character, bracketId)) return 'Win the previous bracket first.';
  if (character?.progression?.activeArena || character?.progression?.activePatrol) return 'Finish what you are doing first.';
  if (getArenaAllowance(character).remaining === 0) return 'No bouts left. Complete an adventure to reset.';
  if (!getMapReadiness(character).canPatrol) return 'Rest in town to recover HP and fatigue first.';
  if (goldOf(character) < bracket.feeGp) return `The entry fee is ${bracket.feeGp} gp.`;
  return '';
}

export const canEnterArena = (character, bracketId) => arenaBlockReason(character, bracketId) === '';

/** Enter a bout: pay the fee and the fatigue, use one bout of the allowance. */
export function beginArenaBout(character, bracketId) {
  if (!canEnterArena(character, bracketId)) return character;
  const bracket = ARENA_BRACKETS[bracketIndex(bracketId)];
  const allowance = getArenaAllowance(character);
  const paid = withGold(character, goldOf(character) - bracket.feeGp);
  return {
    ...paid,
    is_free_roaming: false,
    stats: { ...paid.stats, fatigue: (paid.stats?.fatigue ?? paid.stats?.maxFatigue ?? 15) - ARENA_FATIGUE },
    progression: {
      ...(paid.progression || {}),
      arenaAllowance: { completions: allowance.completions, used: allowance.used + 1 },
      activeArena: { bracketId, startedAtHours: hourStamp(character.stats), fought: false },
      lastArenaResult: null,
    },
  };
}

export function markArenaFought(character) {
  const active = character?.progression?.activeArena;
  if (!active || active.fought) return character;
  return { ...character, progression: { ...character.progression, activeArena: { ...active, fought: true } } };
}

/** The GM's claim checked against what the engine saw: no fight, no win. */
export function normalizeArenaOutcome(claimed, { fought }) {
  return String(claimed || '').trim().toLowerCase() === 'victory' && fought ? 'victory' : 'defeat';
}

/**
 * End a bout: the purse on a win, the record, the clock topped up to
 * ARENA_HOURS (eating a ration at midnight), and never below 1 HP: bouts are
 * to yield.
 */
export function finishArenaBout(character, { outcome }) {
  const active = character?.progression?.activeArena;
  if (!active) return character;
  const bracket = ARENA_BRACKETS[bracketIndex(active.bracketId)];
  const index = bracketIndex(active.bracketId);

  const stats = { ...(character.stats || {}) };
  const elapsed = hourStamp(stats) - (active.startedAtHours ?? hourStamp(stats));
  let hour = (stats.hour ?? 13) + Math.max(0, ARENA_HOURS - elapsed);
  let day = stats.day ?? 1;
  let inventory = [...(character.inventory || [])];
  let daysWithoutFood = character.daysWithoutFood || 0;
  while (hour >= 24) {
    hour -= 24; day += 1;
    const { hasRations, updatedInventory } = consumeRationFromInventory(inventory);
    inventory = updatedInventory;
    daysWithoutFood = hasRations ? 0 : daysWithoutFood + 1;
  }
  stats.day = day;
  stats.hour = hour;
  stats.hp = Math.max(1, stats.hp ?? 1);
  // Yielding clears the bleeding and death clock: the arena surgeons see to it.
  if (outcome === 'defeat') {
    stats.bleedingTier = 0;
    stats.deathCountdown = null;
  }

  const won = outcome === 'victory';
  const record = getArenaRecord(character);
  const purse = won ? bracket?.purseGp || 0 : 0;
  let next = { ...character, stats, inventory, daysWithoutFood };
  if (purse) next = withGold(next, goldOf(next) + purse);

  return {
    ...next,
    progression: {
      ...next.progression,
      activeArena: null,
      arena: {
        highestWon: won ? Math.max(record.highestWon, index) : record.highestWon,
        wins: record.wins + (won ? 1 : 0),
        losses: record.losses + (won ? 0 : 1),
      },
      lastArenaResult: { bracketId: active.bracketId, outcome, purse },
    },
  };
}

/** One-line result for the play log. */
export function describeArenaResult(character, { bracketId, outcome, purse }) {
  const bracket = ARENA_BRACKETS[bracketIndex(bracketId)];
  const nextBracket = ARENA_BRACKETS[bracketIndex(bracketId) + 1];
  if (outcome !== 'victory') {
    return `[Bout over: you yield to ${bracket?.opponent.name}. The arena surgeons patch you up. The ${bracket?.feeGp} gp entry fee is gone.]`;
  }
  const opened = nextBracket && getArenaRecord(character).highestWon === bracketIndex(bracketId)
    ? ` ${nextBracket.name} is now open to you.` : '';
  return `[Bout over: you defeat ${bracket?.opponent.name}! The crowd roars. Purse: +${purse} gp.${opened}]`;
}

const adventureCache = new Map();

/** The synthetic "adventure" a bout is played as, in the shape the GM prompt and combat code read. */
export function buildArenaAdventure(arenaId) {
  if (adventureCache.has(arenaId)) return adventureCache.get(arenaId);
  const bracket = ARENA_BRACKETS[bracketIndex(arenaBracketIdOf(arenaId))];
  if (!bracket) return null;
  const setting = 'The Arena Sands';
  const intro = `The gate grinds up and the noise of the Iron Colosseum hits you like heat. Across the sand, ${bracket.opponent.name} raises a weapon to the crowd. ${bracket.opponent.desc} This is a ${bracket.name} bout, fought to yield.`;
  const adventure = {
    id: arenaId,
    isArena: true,
    arenaBracketId: bracket.id,
    name: `Arena: ${bracket.name}`,
    region: 'region2',
    desc: intro,
    backstory: intro,
    suggestedGm: 'narrator',
    startingPrompt: intro,
    objectives: [`Defeat ${bracket.opponent.name} in single combat, or yield.`],
    settings: [setting],
    settingDescriptions: { [setting]: 'Raked sand inside a ring of iron-banded stands. No cover, no exits but the two gates.' },
    // 'arena' is excluded from level scaling: brackets are fixed difficulties.
    npcs: [{ name: bracket.opponent.name, role: 'Arena Champion', threatRole: 'arena', desc: bracket.opponent.desc, stats: bracket.opponent.stats }],
    items: [],
    itemsDetail: [],
    playabilityGuidance: 'A single arena bout, resolved in about six exchanges. One opponent, no allies, no escape but yielding. Let the crowd react to big moments.',
  };
  adventureCache.set(arenaId, adventure);
  return adventure;
}
