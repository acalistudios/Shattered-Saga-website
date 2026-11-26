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
import { patrolCoinCapCp as nextAdventurePatrolCapCp, formatCoin } from '../data/payouts';
import { isGearTrailCold } from './resurrectionEngine';
import { SKILLS_LIST } from '../data/gms';
import artManifest from '../data/artManifest.json';
import { applyPeoplePatrolOutcome } from '../data/peoples';

const ROAD_APPROACHES = [
  { skill: 'athletics', text: 'Reach defensible ground before the ambushers surround me', difficulty: 'professional' },
  { skill: 'stealth', text: 'Slip out of sight and approach from cover', difficulty: 'novice' },
  { skill: 'perception', text: 'Look for an opening in the ambushers\' formation', difficulty: 'novice' },
  { skill: 'insight', text: 'Read the leader\'s intentions before committing to an approach', difficulty: 'novice' },
  { skill: 'survival', text: 'Use the terrain to find a safer route past the ambush', difficulty: 'professional' },
  { skill: 'tracking', text: 'Trace the ambushers\' route to identify their escape path', difficulty: 'professional' },
];

/** Sample three distinct relevant skills, without mutating authored encounters. */
export function selectPatrolChoices(encounterId, rng = Math.random) {
  const encounter = TRAVEL_ENCOUNTERS.find(e => e.id === encounterId);
  if (!encounter) return [];
  const validSkills = new Set(SKILLS_LIST.map(skill => skill.id));
  const pool = [...encounter.approaches.map(a => ({
    skill: a.skill, text: a.actionDesc, difficulty: a.difficulty,
  })), ...ROAD_APPROACHES];
  const distinct = [...new Map(pool.filter(c => validSkills.has(c.skill)).map(c => [c.skill, c])).values()];
  const choices = [];
  while (choices.length < 3 && distinct.length) {
    const index = Math.min(distinct.length - 1, Math.floor(rng() * distinct.length));
    choices.push(distinct.splice(index, 1)[0]);
  }
  return choices;
}

/** Old in-progress saves get a stable fallback, never random draws during render. */
export function getPatrolChoices(character) {
  const active = character?.progression?.activePatrol;
  if (!active) return [];
  return active.choices ?? selectPatrolChoices(active.encounterId, () => 0.5);
}

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

// Poor roadside bands cannot pay adventure-sized rewards, even on later roads:
// at most a tenth of the next adventure's completion payout (A8). A character's
// level is the campaign position of their next adventure (one level per
// completion), so the cap follows it. In copper.
export const patrolCoinCapCp = (level = 1) => nextAdventurePatrolCapCp(level);
// Abandoning a patrol mid-fight: they run you down for this share of max HP
// (never lethal) before you get clear.
export const FLEE_PURSUIT_FRACTION = 0.25;

export const PATROL_ID_PREFIX = 'patrol:';
export const isPatrolId = (id) => typeof id === 'string' && id.startsWith(PATROL_ID_PREFIX);
// A scaled road threat carries the character's level in its id
// ("patrol:flagellant_zealots@4"), so the foe is the same every time the
// adventure is rebuilt (reloads, the GM prompt) without storing extra state.
export const patrolEncounterIdOf = (id) => (isPatrolId(id) ? id.slice(PATROL_ID_PREFIX.length).split('@')[0] : null);
export const patrolLevelOf = (id) => {
  const m = isPatrolId(id) ? id.match(/@(\d+)$/) : null;
  return m ? Number(m[1]) : null;
};

const humanStats = (HP, attack, damage) => ({
  HP,
  attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 2, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 },
  defenses: { dodge: 'Coordination d8 + Vigor d4', block: 'Power d8 + Coordination d4' },
  armor: 'Light armor soak 1d3',
  attacks: [{ name: attack, skill: 'One-Handed Weapons', damage }],
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

  // Goblins (data/peoples.js): small, quick, lightly armed.
  goblin_traders: { name: 'Nettle Snagtooth', type: 'goblin', stats: { ...humanStats(12, 'Hooked Knife', '1d4 edged'), attributes: { Power: 2, Coordination: 4, Vigor: 2, Willpower: 2, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 2 } } },
  goblin_toll: { name: 'Rattle, Goblin Toll-Chief', type: 'goblin', stats: { ...humanStats(12, 'Short Spear', '1d6 piercing'), attributes: { Power: 2, Coordination: 4, Vigor: 2, Willpower: 2, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 } } },
  goblin_raiders: { name: 'Gash Ironear, Goblin War-Boss', type: 'goblin', stats: { ...humanStats(16, 'Jagged Blade', '1d6 edged'), attributes: { Power: 3, Coordination: 4, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 } } },

  // Dwarves (data/peoples.js): heavily armoured, slow to break.
  dwarf_caravan: { name: 'Hulda Ashbraid', type: 'dwarf', stats: { ...humanStats(20, 'Forge Hammer', '1d8 blunt'), armor: 'Mail coat, medium armor soak 1d4', attributes: { Power: 4, Coordination: 2, Vigor: 4, Willpower: 3, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 2 } } },
  dwarf_hold_patrol: { name: 'Warden Torvald Blackgrit', type: 'dwarf', stats: { ...humanStats(20, 'Bearded Axe', '1d6 edged'), armor: 'Heavy mail and round shield, medium armor soak 1d4', attributes: { Power: 4, Coordination: 2, Vigor: 4, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 } } },
  dwarf_war_party: { name: 'Thane Ragna Coalfist', type: 'dwarf', stats: { ...humanStats(24, 'Great Hammer', '1d8 blunt'), armor: 'Blackened plate, heavy armor soak 1d6', attributes: { Power: 5, Coordination: 2, Vigor: 4, Willpower: 4, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 1 } } },

  // Elves (data/peoples.js): a living scholar, or the elven dead.
  elf_wayfarers: { name: 'Ithiel Moonwake', type: 'elf', stats: { ...humanStats(14, 'Moonsteel Knife', '1d4 edged'), attributes: { Power: 2, Coordination: 4, Vigor: 2, Willpower: 4, Intellect: 5, Charisma: 3, Attunement: 4, Empathy: 3 } } },
  elf_ghost_procession: { name: 'The Mourning Herald', type: 'spirit', stats: { ...humanStats(16, 'Grave-Cold Touch', '1d4 + 1 Fatigue'), armor: 'Spectral: mundane blows strike at -2; Holy Water and blessed weapons strike fully, light armor soak 1d3', attributes: { Power: 2, Coordination: 3, Vigor: 3, Willpower: 5, Intellect: 3, Charisma: 3, Attunement: 4, Empathy: 2 } } },
  elf_ghost_wardens: { name: 'Ser Calathir the Drowned Knight', type: 'spirit', stats: { ...humanStats(22, 'Spectral Longsword', '1d8 edged'), armor: 'Spectral: mundane blows strike at -2; Holy Water and blessed weapons strike fully, light armor soak 1d3', attributes: { Power: 4, Coordination: 4, Vigor: 3, Willpower: 5, Intellect: 3, Charisma: 3, Attunement: 4, Empathy: 1 } } },

  // Tide-folk (data/peoples.js): quick in the water, nets and tridents.
  tidefolk_traders: { name: 'Coral Venn', type: 'tidefolk', stats: { ...humanStats(14, 'Salvage Knife', '1d4 edged'), attributes: { Power: 3, Coordination: 4, Vigor: 3, Willpower: 2, Intellect: 3, Charisma: 4, Attunement: 2, Empathy: 2 } } },
  tidefolk_reef_toll: { name: 'Warden Kailo Deepcurrent', type: 'tidefolk', stats: { ...humanStats(18, 'Coral Trident', '1d6 piercing'), armor: 'Shell scale, light armor soak 1d3', attributes: { Power: 3, Coordination: 4, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 2, Empathy: 1 } } },
  tidefolk_raiders: { name: 'Skarra the Drowner', type: 'tidefolk', stats: { ...humanStats(20, 'Barbed Trident', '1d8 piercing'), armor: 'Shell scale, light armor soak 1d3', attributes: { Power: 3, Coordination: 5, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 2, Empathy: 1 } } },

  // Road threats (Hans 2026-11-18): several accurate, modest attacks a round,
  // so armour that soaks every hit beats dodging (src/sim playtest). These
  // stats are the level 2 shape; scaleRoadThreat() sizes them to the
  // character's level (one weak foe at level 1, more and better ones later).
  flagellant_zealots: {
    name: 'Scourge Procession', type: 'human', attacksPerRound: 3,
    scaling: { maxAttackers: 3, hpPerAttacker: 6, dodge: 'Coordination d6 + Vigor d4', skillKey: 'OneHandedWeapons', damage: ['1d4 edged', '1d4+1 edged'], group: ['zealot', 'zealots'] },
    stats: {
      HP: 26,
      attributes: { Power: 2, Coordination: 3, Vigor: 3, Willpower: 4, Intellect: 1, Charisma: 2, Attunement: 1, Empathy: 1 },
      skills: { OneHandedWeapons: 3 },
      defenses: { dodge: 'Coordination d6 + Vigor d4' },
      armor: 'Rags and hair shirts, light armor soak 1d3',
      attacks: [{ name: 'Hooked Scourges', skill: 'One-Handed Weapons', damage: '1d4 edged', note: 'A mob of zealots: makes 3 attacks every round (one [enemy_attack] per zealot), each weak on its own. HP is the whole procession; it breaks when HP runs out.' }],
      equipment: ['Hooked Scourge'],
    },
  },
  tollroad_crossbowmen: {
    name: 'Toll-Warden Sergeant', type: 'human', attacksPerRound: 2,
    scaling: { maxAttackers: 2, hpPerAttacker: 7, dodge: 'Coordination d8 + Vigor d4', skillKey: 'Marksmanship', damage: ['1d4 piercing', '1d6 piercing'], group: ['crossbowman', 'crossbowmen'] },
    stats: {
      HP: 20,
      // Coordination 3, not 4: at 4 they were the one road threat that could
      // genuinely kill a mid-level character (road-threat playtest).
      attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 2, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 },
      skills: { Marksmanship: 3 },
      defenses: { dodge: 'Coordination d10 + Vigor d4' },
      armor: 'Padded gambeson, medium armor soak 1d4',
      attacks: [{ name: 'Crossbow Volley', skill: 'Marksmanship', damage: '1d8 piercing', note: 'The sergeant and a second crossbowman: 2 attacks every round (one [enemy_attack] each), with crossbows.' }],
      equipment: ['Crossbow'],
    },
  },
  anarchist_street_gang: {
    name: 'Ashen Banner Ringleader', type: 'human', attacksPerRound: 2,
    scaling: { maxAttackers: 3, hpPerAttacker: 7, dodge: 'Coordination d8 + Vigor d4', skillKey: 'OneHandedWeapons', damage: ['1d4 piercing', '1d6 piercing'], group: ['agitator', 'agitators'] },
    stats: {
      HP: 22,
      attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 1 },
      skills: { OneHandedWeapons: 2 },
      defenses: { dodge: 'Coordination d8 + Vigor d4' },
      armor: 'Street leathers, light armor soak 1d3',
      attacks: [{ name: 'Twin Knives', skill: 'One-Handed Weapons', damage: '1d6 piercing', note: 'The ringleader and a crony: 2 attacks every round (one [enemy_attack] each). They fight with a knife in each hand.' }],
      equipment: ['Knife', 'Knife'],
    },
  },
  inquisition_enforcers: {
    name: 'Inquisitor-Captain', type: 'human', attacksPerRound: 2,
    // From level 7 the Inquisition sends its plate-armoured knights; beating
    // them can win a Steel Plate (ROAD_SALVAGE below).
    scaling: { maxAttackers: 2, hpPerAttacker: 8, dodge: 'Coordination d8 + Vigor d4', block: 'Power d6 + Coordination d4', skillKey: 'OneHandedWeapons', damage: ['1d4 edged', '1d4+1 edged'], group: ['enforcer', 'enforcers'], plate: { fromLevel: 7, armor: 'Black plate harness, heavy armor soak 1d6', damage: '1d4 edged' } },
    stats: {
      HP: 24,
      attributes: { Power: 3, Coordination: 4, Vigor: 3, Willpower: 4, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 },
      skills: { OneHandedWeapons: 4, Blocking: 3 },
      defenses: { dodge: 'Coordination d10 + Vigor d4', block: 'Power d8 + Coordination d4 + 3d2' },
      armor: 'Black chain mantle, medium armor soak 1d4',
      attacks: [{ name: 'Arming Sword', skill: 'One-Handed Weapons', damage: '1d6 edged', note: 'The captain and an enforcer: 2 well-drilled attacks every round (one [enemy_attack] each).' }],
      equipment: ['Arming Sword', 'Iron Shield'],
    },
  },

  // Sky-folk (data/peoples.js): light and quick, archers and javelins.
  skyfolk_skiff_traders: { name: 'Talon Ashwing', type: 'skyfolk', stats: { ...humanStats(14, 'Sky-Knife', '1d4 edged'), attributes: { Power: 2, Coordination: 5, Vigor: 2, Willpower: 3, Intellect: 3, Charisma: 4, Attunement: 3, Empathy: 2 } } },
  skyfolk_wind_wardens: { name: 'Warden Aeris Stormcrest', type: 'skyfolk', stats: { ...humanStats(16, 'Wind-Spear', '1d6 piercing'), attributes: { Power: 2, Coordination: 5, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 3, Empathy: 1 } } },
  skyfolk_storm_raiders: { name: 'Storm-Captain Harrow', type: 'skyfolk', stats: { ...humanStats(18, 'Storm Javelins', '1d6 piercing'), attributes: { Power: 3, Coordination: 5, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 3, Attunement: 3, Empathy: 1 }, attacks: [{ name: 'Storm Javelin', skill: 'Thrown Weapons', damage: '1d6 piercing', note: 'Harrow throws; her gliding archers are narrative cover fire.' }] } },

  // Magic bandits (Hans 2026-11-25): a fighter plus a caster. The caster's
  // spell is the second attack; it goes "vs Ward" (Resist), so armour does
  // not soak it. Gated by the encounter's minLevel, so always a pair.
  hedge_mage_brigands: {
    name: 'Brigand and Hedge-Mage', type: 'human', attacksPerRound: 2,
    scaling: { maxAttackers: 2, hpPerAttacker: 6, dodge: 'Coordination d8 + Vigor d4', skillKey: 'OneHandedWeapons', damage: ['1d4 edged', '1d4+1 edged'], group: ['brigand', 'brigands'], spell: { damage: ['1d3 arcane', '1d3 arcane'] } },
    stats: {
      HP: 24,
      attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 3, Intellect: 3, Charisma: 2, Attunement: 2, Empathy: 1 },
      skills: { OneHandedWeapons: 2, ArcaneShaping: 3 },
      defenses: { dodge: 'Coordination d8 + Vigor d4' },
      armor: 'Patched leather, light armor soak 1d3',
      attacks: [
        { name: 'Brigand Blade', skill: 'One-Handed Weapons', damage: '1d6 edged', note: 'The brigand: a blade strike, defended with Dodge or Block.' },
        { name: 'Arcane Bolt', skill: 'Arcane Shaping', damage: '1d4 arcane', vs: 'Ward', note: 'The hedge-mage: a spell every OTHER round (she spends the round between drawing the sigil, when a hit, feint or ward stops it), emitted "vs Ward" so the player resists with Willpower; armour does not help. A hit, a feint or a ward that breaks her concentration stops it.' },
      ],
      equipment: ['Notched Sword', 'Sigil Chalk'],
    },
  },
  hooked_eye_cultists: {
    name: 'Hooked Eye Blade-Adept and Priest', type: 'human', attacksPerRound: 2,
    scaling: { maxAttackers: 2, hpPerAttacker: 7, dodge: 'Coordination d8 + Vigor d4', skillKey: 'OneHandedWeapons', damage: ['1d4 edged', '1d4+1 edged'], group: ['cultist', 'cultists'], spell: { damage: ['1d3 necrotic', '1d4 necrotic'] } },
    stats: {
      HP: 26,
      attributes: { Power: 3, Coordination: 4, Vigor: 3, Willpower: 4, Intellect: 3, Charisma: 3, Attunement: 2, Empathy: 1 },
      skills: { OneHandedWeapons: 3, Intimidation: 3 },
      defenses: { dodge: 'Coordination d8 + Vigor d4' },
      armor: 'Red-lined robes over leather, light armor soak 1d3',
      attacks: [
        { name: 'Curved Knife', skill: 'One-Handed Weapons', damage: '1d6 edged', note: 'The blade-adept: a knife strike, defended with Dodge or Block.' },
        { name: 'Blood Curse', skill: 'Demonic Pact', damage: '1d6 necrotic', vs: 'Ward', note: 'The cult priest: a curse every OTHER round (he spends the round between chanting, when a hit or Holy Water stops it), emitted "vs Ward" so the player resists with Willpower; armour does not help. Holy Water on the priest or the blood bowl breaks the chant for 2 rounds.' },
      ],
      equipment: ['Curved Knife', 'Hooked-Eye Amulet', 'Blood Bowl'],
    },
  },
};

// How road threats grow with the character (Hans 2026-11-18): never too hard,
// just wearing. Tuned with src/sim/roadThreats.playtest.test.js against a
// character who levels normally, aiming for near-certain wins that still cost
// a real share of HP before the next adventure.
export const ROAD_CURVE = {
  // A third attacker made every later level a coin flip (playtest), so groups
  // stop at two; later levels grow through skill, damage and HP instead.
  attackersAt: [0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // index = level (capped), then by maxAttackers
  skillRanks: (level) => Math.min(3, 1 + Math.floor((level - 1) / 3)), // rank 3 from level 7 on
  hpBonusPerLevel: 1,
  strongDamageFromLevel: 7, // switch to the second damage die from this level
};

const clampLevel = (level) => Math.max(1, Math.min(12, Number(level) || 1));

/**
 * A road threat sized to a character level: number of attackers, their skill,
 * the group's HP and damage. Returns a PATROL_FOES-shaped foe; non-scaling
 * foes come back unchanged.
 */
export function scaleRoadThreat(foe, level) {
  if (!foe?.scaling) return foe;
  const L = clampLevel(level);
  const sc = foe.scaling;
  const attackers = Math.min(sc.maxAttackers, ROAD_CURVE.attackersAt[Math.min(L, ROAD_CURVE.attackersAt.length - 1)]);
  const ranks = ROAD_CURVE.skillRanks(L);
  const plated = sc.plate && L >= sc.plate.fromLevel;
  // Plate knights trade the late damage step for their armour (road sim:
  // with both they took nearly half a winner's HP at level 7).
  const damage = plated && sc.plate.damage ? sc.plate.damage
    : L >= ROAD_CURVE.strongDamageFromLevel ? sc.damage[1] : sc.damage[0];
  const hp = sc.hpPerAttacker * attackers + ROAD_CURVE.hpBonusPerLevel * (L - 1);
  const [one, many] = sc.group;
  const base = foe.stats;
  const attack = base.attacks[0];
  const who = attackers === 1 ? `A lone ${one}` : `${attackers} ${many}`;
  return {
    ...foe,
    attacksPerRound: attackers,
    stats: {
      ...base,
      HP: hp,
      ...(plated ? { armor: sc.plate.armor } : {}),
      skills: { ...(base.skills || {}), [sc.skillKey]: ranks },
      defenses: {
        dodge: `${sc.dodge}${ranks > 1 ? ` + ${ranks - 1}d2` : ''}`,
        ...(sc.block ? { block: `${sc.block} + ${ranks}d2` } : {}),
      },
      attacks: [{
        ...attack,
        damage,
        note: sc.spell
          ? `Two foes: the ${one} strikes every round with ${attack.skill} ${ranks}; the caster casts the spell below only every other round (one round to prepare it, one to cast). One [enemy_attack] per strike or spell. HP is the whole group; it breaks when HP runs out. A road skirmish, not a death trap: they flee or yield once badly hurt.`
          : `${who}: make${attackers === 1 ? 's' : ''} ${attackers} attack${attackers === 1 ? '' : 's'} every round (one [enemy_attack] each, ${attack.skill} ${ranks}). HP is the whole group; it breaks when HP runs out. A road skirmish, not a death trap: they flee or yield once badly hurt.`,
      },
      // A caster's spell keeps its own line, sized like the blade.
      ...(sc.spell && base.attacks[1] ? [{ ...base.attacks[1], damage: L >= ROAD_CURVE.strongDamageFromLevel ? sc.spell.damage[1] : sc.spell.damage[0] }] : [])],
    },
  };
}

// Talking, bribing or cowing the band off: these approaches pay a "parley" result.
const PARLEY_APPROACHES = new Set([
  'diplomatic_parley', 'corsair_bribe', 'mountain_intimidation', 'ration_bargain',
  'gladiator_code', 'pack_negotiate', 'medical_triage_parley', 'planar_bargain',
  'zealot_sermon', 'zealot_read', 'toll_pay', 'toll_expose', 'anarchist_cause', 'anarchist_cow',
  'inquisition_papers', 'inquisition_faith',
  'goblin_trade_haggle', 'goblin_trade_news', 'goblin_trade_heal', 'goblin_trade_ward',
  'goblin_toll_rations', 'goblin_toll_cow', 'goblin_toll_bless', 'goblin_toll_spark', 'goblin_raid_amends',
  'dwarf_trade_haggle', 'dwarf_trade_smith', 'dwarf_trade_bless', 'dwarf_trade_rune',
  'dwarf_patrol_tithe', 'dwarf_patrol_honest', 'dwarf_patrol_strength', 'dwarf_patrol_ward', 'dwarf_war_restitution',
  'elf_wayfarer_lore', 'elf_wayfarer_trade', 'elf_wayfarer_bless', 'elf_wayfarer_light',
  'elf_procession_kneel', 'elf_procession_elvish', 'elf_procession_pray', 'elf_procession_ward', 'elf_wardens_amends', 'elf_wardens_ward',
  'tide_trade_haggle', 'tide_trade_sea', 'tide_trade_heal', 'tide_trade_bless',
  'tide_toll_pay', 'tide_toll_swim', 'tide_toll_respect', 'tide_toll_trick', 'tide_raid_amends',
  'hedge_bargain',
  'sky_trade_haggle', 'sky_trade_winds', 'sky_trade_mend', 'sky_trade_bless',
  'sky_warden_toll', 'sky_warden_walk', 'sky_warden_respect', 'sky_warden_ward', 'sky_raid_amends',
]);
export const isParleyApproach = (approach) => PARLEY_APPROACHES.has(approach?.id);

const adventureCache = new Map();
const PAINTED = new Set(artManifest);

/**
 * The ambush painting that matches the band actually fighting: scaled road
 * threats have a lone-foe picture (one attacker), a group picture, and the
 * Inquisition a plate-knight picture from level 7 (public/images/encounters).
 * Null until painted.
 */
export function encounterImage(encounterId, foe) {
  const size = foe?.scaling && foe.attacksPerRound === 1 ? '_lone' : '';
  const plated = foe?.scaling?.plate && /plate/i.test(foe.stats?.armor || '') ? '_plate' : '';
  const src = `/images/encounters/${encounterId}${plated || size}.webp`;
  if (PAINTED.has(src)) return src;
  // A band never met alone (its minLevel is past the lone-foe levels) has only the group painting.
  const group = `/images/encounters/${encounterId}.webp`;
  return PAINTED.has(group) ? group : null;
}

/**
 * The synthetic "adventure" a patrol is played as, in the shape the GM prompt
 * and combat code already read. Authored approaches become hints, not menus.
 */
export function buildPatrolAdventure(patrolId) {
  if (adventureCache.has(patrolId)) return adventureCache.get(patrolId);
  const encounter = TRAVEL_ENCOUNTERS.find(e => e.id === patrolEncounterIdOf(patrolId));
  if (!encounter) return null;
  const baseFoe = PATROL_FOES[encounter.id] || { name: 'Road Ambusher', type: 'human', stats: humanStats(16, 'Blade', '1d6 slashing') };
  // Scaled road threats are sized to the level in the id; the general
  // difficulty bands then leave them alone (threatRole 'road').
  const foe = baseFoe.scaling ? scaleRoadThreat(baseFoe, patrolLevelOf(patrolId) || 1) : baseFoe;
  const setting = encounter.setting || 'The Ambush Site';
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
    objectives: [encounter.peaceful
      ? 'Meet the travellers on the road: trade, talk, or move on.'
      : 'Survive the ambush: defeat or rout the band, talk or buy your way past, or escape.'],
    ...(encounter.people ? { people: encounter.people } : {}),
    ...(encounter.gmNote ? { patrolGmNote: encounter.gmNote } : {}),
    ...(encounter.peaceful ? { patrolPeaceful: true } : {}),
    settings: [setting],
    settingDescriptions: { [setting]: encounter.intro },
    settingImages: (() => { const img = encounterImage(encounter.id, foe); return img ? { [setting]: img } : {}; })(),
    npcs: [{
      name: foe.name,
      role: foe.type === 'beast' ? 'Pack Leader' : encounter.peaceful ? 'Trader' : foe.type === 'spirit' ? 'Restless Dead' : 'Ambush Leader',
      desc: `Leads the ambush. ${foe.type === 'beast' ? 'A beast: it cannot be reasoned with, only driven off or calmed.' : 'Can be fought, threatened, bargained with, or escaped.'}`,
      stats: foe.stats,
      ...(foe.scaling ? { threatRole: 'road' } : {}),
    }],
    items: [],
    itemsDetail: [],
    playabilityGuidance: [
      'This is a short roadside encounter, not an adventure: one scene, resolved in about six exchanges.',
      ...(encounter.gmNote ? [encounter.gmNote] : []),
      'Approaches that suit this ambush (let the player find their own; these are hints, not a menu):',
      ...encounter.approaches.map(a => `- ${a.name} (${a.skill.replace(/_/g, ' ')}): ${a.actionDesc}`),
    ].join('\n'),
  };
  adventureCache.set(patrolId, adventure);
  return adventure;
}

/** A patrol id; scaled road threats also carry the character's level. */
export const patrolIdFor = (encounterId, level = null) =>
  `${PATROL_ID_PREFIX}${encounterId}${level && PATROL_FOES[encounterId]?.scaling ? `@${clampLevel(level)}` : ''}`;

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
  return { coinCp: Math.max(0, rewards.gold || 0) * 100, items, morality: rewards.morality || 0 };
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
export function beginPatrol(character, encounterId, choices = selectPatrolChoices(encounterId), regionId = null) {
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
        // The road actually travelled: 'any'-region bands meet you where you are.
        regionId: regionId || (encounter?.region !== 'any' ? encounter?.region : null) || null,
        startedAtHours: hourStamp(character.stats),
        fought: false,
        choices,
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
  if (!encounter || outcome === 'escaped') return { coinCp: 0, items: [], morality: 0 };
  const pool = encounter.approaches.filter(a => (outcome === 'parley') === isParleyApproach(a));
  if (pool.length === 0) return { coinCp: 0, items: [], morality: 0 };
  const approach = pool[Math.floor(rng() * pool.length) % pool.length];
  const loot = rollPatrolLoot(approach.rewards, rng);
  const salvage = outcome === 'victory' ? rollRoadSalvage(encounterId, level, rng) : [];
  return { ...loot, items: [...loot.items, ...salvage], coinCp: Math.min(loot.coinCp, patrolCoinCapCp(level)) };
}

// Heavy armour material from late road fights (Hans 2026-11-20): a beaten
// plate-armoured Inquisition knight can be stripped of a Steel Plate, and any
// late road band may carry an Iron Ingot. Victories only, from level 7.
export const ROAD_SALVAGE = { fromLevel: 7, ingotChance: 0.15, plateChance: { inquisition_enforcers: 0.5 } };

export function rollRoadSalvage(encounterId, level, rng = Math.random) {
  if (clampLevel(level) < ROAD_SALVAGE.fromLevel) return [];
  const plateChance = ROAD_SALVAGE.plateChance[encounterId] || 0;
  if (plateChance && rng() < plateChance) return ['Steel Plate'];
  if (rng() < ROAD_SALVAGE.ingotChance) return ['Iron Ingot'];
  return [];
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

  const coinCp = loot?.coinCp || 0;
  let currency = next.currency;
  if (coinCp > 0) {
    const c = currency || {};
    const total = (c.gp ?? c.gold ?? 0) * 100 + (c.sp || 0) * 10 + (c.cp || 0) + coinCp;
    const gp = Math.floor(total / 100);
    currency = { ...c, gp, sp: Math.floor((total % 100) / 10), cp: total % 10, gold: gp };
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

  // Standing with a people, and places they show you (data/peoples.js).
  next = applyPeoplePatrolOutcome(next, TRAVEL_ENCOUNTERS.find(e => e.id === active.encounterId), outcome);

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
  // People (humans, goblins...) carry your gear off; beasts and spirits leave it where you fell.
  const carries = !['beast', 'spirit'].includes(foe.type);
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
  if (loot?.coinCp > 0) parts.push(`+${formatCoin(loot.coinCp)}`);
  if (loot?.items?.length) parts.push(loot.items.join(', '));
  if (loot?.morality) parts.push(`Morality ${loot.morality > 0 ? '+' : ''}${loot.morality}`);
  const spoils = parts.length ? ` Spoils: ${parts.join(' · ')}.` : '';
  const gear = recovered.length ? ` Recovered your lost gear: ${recovered.join(', ')}.` : '';
  const hurt = pursuitDamage > 0 ? ` They ran you down as you fled: -${pursuitDamage} HP.` : '';
  return `[${head}${spoils}${gear}${hurt} At least ${PATROL_HOURS} hours passed on the road.]`;
}
