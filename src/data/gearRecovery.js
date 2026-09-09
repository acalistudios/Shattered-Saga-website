// Where a dead character's carried gear ends up, per adventure.
//
// Resurrection strips carried gear rather than destroying it. Recovery follows
// one rule, split by what killed you:
//
//   - Intelligent, acquisitive killers (people, thinking constructs, merchants)
//     CARRY the gear. Kill them or loot their quarters to get it back.
//   - Beasts, mindless undead, elementals and spirits leave it at a MARKED SITE
//     where you fell or where the creature nests.
//
// Either way the trail decays: carriers move between locations and caches get
// scavenged, so waiting too long loses the gear permanently. The engine owns
// this — the GM narrates the recovery, it does not decide whether gear is there.

// Hours of in-game time before a trail is considered cold. Carriers move sooner
// than caches because they are actively going somewhere.
export const CARRIER_MOVE_HOURS = 12;
export const CACHE_SCATTER_HOURS = 24;
export const TRAIL_COLD_HOURS = 72;

// Killer archetypes and whether they take your things with them.
export const KILLER_TYPES = {
  human: { carries: true },
  construct: { carries: true },
  merchant_spirit: { carries: true },
  beast: { carries: false },
  undead: { carries: false },
  spirit: { carries: false },
  elemental: { carries: false },
};

const killer = (name, type, recoveredAt) => ({ name, type, carries: KILLER_TYPES[type].carries, recoveredAt });

export const ADVENTURE_GEAR_RECOVERY = {
  ashveil_keep: {
    defaultCacheSite: 'Great Hall',
    killers: [
      killer('Skritt', 'human', 'Prison Sub-Level'),
      killer('Aldric Voss', 'spirit', "Lord's Study"),
      killer('Malachar', 'spirit', 'Chapel'),
    ],
  },
  saltblood_mines: {
    // This adventure already confiscates equipment on entry, so the Supply Depot
    // is where the game's fiction already says your things are kept.
    defaultCacheSite: 'Supply Depot',
    killers: [
      killer('Threx', 'human', "Threx's Office"),
      killer('Saltblood Guard', 'human', 'Supply Depot'),
      killer('Redvein-Possessed Prisoner', 'undead', 'Deep Redvein Vein'),
    ],
  },
  blackroot_hollow: {
    defaultCacheSite: 'Webbed Root Gallery',
    killers: [
      killer('Mother Silken', 'beast', 'Egg Nursery'),
      killer('Deep Molt Horror', 'beast', 'Lower Molt Rift'),
    ],
  },
  thorn_treaty: {
    defaultCacheSite: 'Oath Stone Circle',
    killers: [killer('Briar-Eyed Leth', 'spirit', 'Thornwold Deep Path')],
  },
  glass_orchard_masquerade: {
    defaultCacheSite: 'Servant Passage',
    killers: [
      killer('The Vesper Knife', 'human', 'Mirror Hedge'),
      killer('Orchard Seneschal Pell', 'human', 'Glass Orchard Ballroom'),
    ],
  },
  elemental_crucible: {
    defaultCacheSite: 'Fivefold Gate',
    killers: [
      killer('The Cinder Stag', 'elemental', 'Cinder Trial Grove'),
      killer('The Granite Matron', 'elemental', 'Granite Burden Hall'),
      killer('The Mirror of Affinity', 'spirit', 'Mirror of Affinity'),
    ],
  },
  greywash_bandit_crown: {
    defaultCacheSite: 'Crown Hollow',
    killers: [
      killer('Tamsin Crowe', 'human', 'Crown Hollow'),
      killer('Rusk Fen', 'human', 'Deserter Ridge Camp'),
    ],
  },
  sunken_spire: {
    defaultCacheSite: 'Tidal Siphon Junction',
    killers: [
      killer('Drowned Guardian', 'undead', 'Hall of Forgotten Runes'),
      // A scavenger by trade: she will have it, and will want paying for it.
      killer('Naelia the Diver', 'merchant_spirit', 'Flooded Library Entrance'),
    ],
  },
  merrin_abbey_plague_bells: {
    defaultCacheSite: 'Reliquary Library',
    killers: [
      killer('The Bell Grief', 'spirit', 'Bell Tower'),
      killer('Prior Malrec', 'human', 'Infirmary Cloister'),
    ],
  },
  drowned_market: {
    defaultCacheSite: 'Memory Stall',
    killers: [
      killer('Tide Bailiff', 'human', 'Returning Tide Gate'),
      killer('Harbormaster Quill', 'human', 'Sunken Council Vault'),
      killer('Nera Saltveil', 'merchant_spirit', 'Ghost Bazaar Aisles'),
    ],
  },
  clockwork_conservatory: {
    defaultCacheSite: 'The Chronos Vault',
    killers: [
      // Unit-7 tidies things away; it will have shelved your gear somewhere.
      killer('Unit-7 (Nanny)', 'construct', 'The Clockwork Arboretum'),
      killer('Baron von Rictor', 'human', 'The Alchemical Lab'),
    ],
  },
  obsidian_vault: {
    defaultCacheSite: 'Sulfuric Vents Chamber',
    killers: [
      killer('Volcanic Warden', 'elemental', 'Altar of Ember'),
      killer('Ember Maw', 'elemental', 'Molten Lava Tube'),
      killer('Lothar the Smelter', 'human', 'Basalt Ridge Gatehouse'),
    ],
  },
  mirror_war_saint_orra: {
    defaultCacheSite: 'Hall of Reflections',
    killers: [
      killer('Mara-Twice', 'human', 'Hall of Reflections'),
      killer('The Silver Contrary', 'human', 'Dawn Mirror Threshold'),
    ],
  },
  iron_colosseum: {
    // Arena rules: the house takes your kit before you ever reach the sand.
    defaultCacheSite: 'Beast Gate Underworks',
    killers: [
      killer('Durn Ashjaw', 'human', 'Champion Dais'),
      killer('Varro Cindergold', 'human', 'Noble Gallery'),
    ],
  },
  brass_plague_tinkertown: {
    defaultCacheSite: 'Central Logic Foundry',
    killers: [
      killer('Matron 12', 'construct', 'Servant Registry Hall'),
      killer('Jannik Gearwise', 'human', 'Gearwise Workshop'),
    ],
  },
  astral_sky: {
    defaultCacheSite: 'Floating Leyline Isles',
    killers: [
      killer('Vortex Elemental', 'elemental', 'Gravity Siphon Spires'),
      killer('Gravity-Warped Guardian', 'construct', 'Windrunner Sky-Bridges'),
      killer('Zephyr Gale-Rider', 'human', 'Windrunner Sky-Bridges'),
    ],
  },
  frostfire_crypt: {
    defaultCacheSite: 'The Glyphed Catacombs',
    killers: [
      killer('Kaelen-Ghar (Wraith)', 'undead', 'The Sarcophagus Chamber'),
      killer('Frostbite Spiders', 'beast', 'The Glacial Reach'),
      killer('The Guardian Golem', 'construct', 'The Core Vault'),
    ],
  },
  harvest_hill_hunger: {
    defaultCacheSite: 'Hill Shrine',
    killers: [
      killer('The Hill Hunger', 'spirit', 'Root-Heart Chamber'),
      killer('Nell of the Empty Chair', 'human', 'Choosing Feast Hall'),
    ],
  },
};

/**
 * Resolve where a character's gear went after dying.
 *
 * Matching is by substring so the GM naming "Threx, the mine boss" still
 * resolves. Unknown killers fall back to the adventure's cache site, which is
 * always a real location in that adventure.
 */
export const resolveGearRecovery = (adventureId, killerName = '') => {
  const entry = ADVENTURE_GEAR_RECOVERY[adventureId];
  if (!entry) return null;

  const nameLower = String(killerName || '').toLowerCase();
  const match = nameLower
    ? entry.killers.find(k => nameLower.includes(k.name.toLowerCase()) || k.name.toLowerCase().includes(nameLower))
    : null;

  if (!match) {
    return {
      mode: 'cache',
      carries: false,
      killer: killerName || null,
      location: entry.defaultCacheSite,
      coldAfterHours: TRAIL_COLD_HOURS,
      movesAfterHours: CACHE_SCATTER_HOURS,
    };
  }

  return {
    mode: match.carries ? 'carrier' : 'cache',
    carries: match.carries,
    killer: match.name,
    killerType: match.type,
    location: match.recoveredAt,
    coldAfterHours: TRAIL_COLD_HOURS,
    movesAfterHours: match.carries ? CARRIER_MOVE_HOURS : CACHE_SCATTER_HOURS,
  };
};

// Patrols have no authored map, so a patrol death is always a carrier hunt:
// the creature that killed you becomes a named, trackable target.
export const PATROL_RECOVERY_NOTE =
  'Patrol deaths have no fixed site. The killer becomes a named, trackable target carrying the gear; it moves between regions and the trail goes cold after ' +
  TRAIL_COLD_HOURS +
  ' hours.';
