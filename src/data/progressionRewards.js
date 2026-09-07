import { coinValue } from './economy';

export const SKILL_RANK_CAP = 5;
export const NORMAL_ATTRIBUTE_CAP = 5;
export const MONSTROUS_ATTRIBUTE_SCORE = 6;

export const skillRankCost = (currentRank = 0) => {
  const rank = Math.max(0, Math.min(SKILL_RANK_CAP, Number(currentRank) || 0));
  return rank >= SKILL_RANK_CAP ? Infinity : rank + 1;
};

export const skillPointsForWave = (wave) => {
  const numericWave = Number.parseInt(String(wave), 10) || 1;
  if (numericWave >= 5) return 4;
  if (numericWave >= 3) return 3;
  return 2;
};

export const levelHpGain = (nextLevel, vigorScore = 1) => {
  const vigor = Number(vigorScore) || 1;
  let gain = 1;

  if (nextLevel % 2 === 0) {
    if (vigor >= 6) gain += 3;
    else if (vigor >= 4) gain += 2;
    else if (vigor >= 3) gain += 1;
  }

  return gain;
};

export const currencyFromCp = (currencyCp = 0) => ({
  valueCp: Math.max(0, Math.round(currencyCp || 0)),
  value: coinValue(currencyCp),
});

const guaranteed = (wave, trainingSlots, baseCurrencyCp) => ({
  levelUps: 1,
  skillPoints: skillPointsForWave(wave),
  trainingSlots,
  baseCurrencyCp,
});

const reward = ({
  id,
  name,
  type,
  requires,
  itemIds = [],
  attributeOptions = [],
  cap = NORMAL_ATTRIBUTE_CAP,
  affinity = null,
  baseEffect = '',
  affinityEffect = '',
  availability = 'completion',
  notes = '',
}) => ({
  id,
  name,
  type,
  requires,
  itemIds,
  attributeOptions,
  cap,
  affinity,
  baseEffect,
  affinityEffect,
  availability,
  notes,
});

// Permanent rewards are engine-authored here. The GM can narrate these outcomes,
// but should not invent unlisted currency, items, skill points, attribute points,
// gems, premium turns, or other permanent power.
export const ADVENTURE_REWARD_MODELS = {
  ashveil_keep: {
    wave: '1a',
    tier: 1,
    recommendedLevelRange: [1, 2],
    maxCurrencyBudgetCp: 90,
    maxGearQuality: '+1 situational',
    guaranteedRewards: guaranteed(1, 2, 30),
    recommendedSpecialRewards: [
      reward({
        id: 'voss_crest_armament',
        name: 'Voss Crest armament',
        type: 'useful_gear',
        requires: ['heroic', 'vanquish'],
        itemIds: ['+1 Dagger (Voss Crest)', '+1 Shield (Voss Crest)'],
        baseEffect: '+1 Fire-aspected dagger and +1 Aether-aspected shield.',
        affinityEffect: 'Fire affinity can light a normal flame with the dagger once per rest/day. Aether affinity can reveal alignment, curse, undead taint, or possession with the shield once per rest/day.',
        notes: 'Both Voss crest items can be earned in the opening adventure.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'items_above_plus_1'],
  },
  saltblood_mines: {
    wave: '1b',
    tier: 1,
    recommendedLevelRange: [1, 3],
    maxCurrencyBudgetCp: 120,
    maxGearQuality: 'mundane',
    guaranteedRewards: guaranteed(1, 2, 30),
    recommendedSpecialRewards: [
      reward({
        id: 'liberator_of_redvein',
        name: 'Liberator of Redvein',
        type: 'rare_attribute_point',
        requires: ['free_prisoners'],
        attributeOptions: ['empathy'],
        notes: 'Award only if the player meaningfully organizes or protects the prisoner escape.',
      }),
      reward({
        id: 'hardened_miner',
        name: 'Hardened Miner',
        type: 'rare_attribute_point',
        requires: ['survive_forced_labor'],
        attributeOptions: ['power', 'vigor'],
        notes: 'Award only if the player survives and overcomes the labor ordeal without abandoning others.',
      }),
    ],
    disallowedRewards: ['magical_weapons', 'magical_armor', 'attribute_above_5'],
  },
  blackroot_hollow: {
    wave: '2a',
    tier: 1,
    recommendedLevelRange: [2, 3],
    maxCurrencyBudgetCp: 90,
    maxGearQuality: 'crafted',
    guaranteedRewards: guaranteed(2, 1, 25),
    recommendedSpecialRewards: [
      reward({
        id: 'spider_silk_lining',
        name: 'Spider-Silk Lining',
        type: 'armor_upgrade',
        requires: ['harvest_silk'],
        itemIds: ['Spider-Silk Bundle'],
        notes: 'Body armor gains +1 soak against piercing when crafted during downtime.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'plus_1_weapons'],
  },
  thorn_treaty: {
    wave: '2b',
    tier: 1,
    recommendedLevelRange: [2, 3],
    maxCurrencyBudgetCp: 100,
    maxGearQuality: 'minor_charm',
    guaranteedRewards: guaranteed(2, 2, 30),
    recommendedSpecialRewards: [
      reward({
        id: 'living_thorn_charm',
        name: 'Living Thorn Charm',
        type: 'unique_relic',
        requires: ['peaceful_resolution'],
        itemIds: ['Living Thorn Charm'],
        notes: '+1 to appropriate forest Survival or tracking checks.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'plus_1_weapons'],
  },
  glass_orchard_masquerade: {
    wave: '2c',
    tier: 1,
    recommendedLevelRange: [3, 4],
    maxCurrencyBudgetCp: 150,
    maxGearQuality: 'utility_gear',
    guaranteedRewards: guaranteed(2, 2, 50),
    recommendedSpecialRewards: [
      reward({
        id: 'glass_thorn_dagger',
        name: 'Glass Thorn Dagger',
        type: 'useful_gear',
        requires: ['join_plot'],
        itemIds: ['Glass Thorn Dagger'],
        affinity: 'water',
        baseEffect: '+1 Light Weapon. On hit, 50% poison chance; poisoned enemy has a 25% chance to miss its next attack.',
        affinityEffect: 'Water affinity increases the poison chance to 75%.',
        notes: 'Uses poison/missed attacks rather than tracking NPC Fatigue.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'heavy_plate', 'spell_scrolls'],
  },
  elemental_crucible: {
    wave: '2d',
    tier: 2,
    recommendedLevelRange: [3, 4],
    maxCurrencyBudgetCp: 75,
    maxGearQuality: 'relic_ability',
    guaranteedRewards: guaranteed(2, 1, 0),
    recommendedSpecialRewards: [
      reward({
        id: 'awakened_font',
        name: 'Primal elemental rest ability',
        type: 'elemental_ability',
        requires: ['awakened_font'],
        itemIds: ['Elemental Awakening Mark'],
        notes: 'Unlocks the affinity-matched once-between-rests elemental ability.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'plus_1_weapons'],
  },
  greywash_bandit_crown: {
    wave: '3a',
    tier: 2,
    recommendedLevelRange: [4, 5],
    maxCurrencyBudgetCp: 300,
    maxGearQuality: '+1 weapon',
    guaranteedRewards: guaranteed(3, 2, 100),
    recommendedSpecialRewards: [
      reward({
        id: 'black_crown_longbow',
        name: 'Black-Crown Longbow',
        type: 'useful_gear',
        requires: ['redeem_tamsin'],
        itemIds: ['Black-Crown Longbow'],
        affinity: 'fire',
        baseEffect: '+1 ranged combat and +1 damage when earned cleanly.',
        affinityEffect: 'Fire affinity adds +2 fire damage once per 8 hours.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'relics_above_plus_1'],
  },
  merrin_abbey_plague_bells: {
    wave: '3b',
    tier: 2,
    recommendedLevelRange: [4, 5],
    maxCurrencyBudgetCp: 150,
    maxGearQuality: 'divine_charm',
    guaranteedRewards: guaranteed(3, 2, 20),
    recommendedSpecialRewards: [
      reward({
        id: 'blessed_bell_clapper',
        name: 'Blessed Bell Clapper',
        type: 'unique_relic',
        requires: ['purify_bell'],
        itemIds: ['Blessed Bell Clapper'],
        affinity: 'aether',
        baseEffect: 'Once per rest, restore full Divine SP or stabilize all dying allies in the scene.',
        affinityEffect: 'Aether affinity repels undead for one round when used.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'dark_relics'],
  },
  sunken_spire: {
    wave: '4a',
    tier: 2,
    recommendedLevelRange: [5, 7],
    maxCurrencyBudgetCp: 200,
    maxGearQuality: 'minor_relic',
    guaranteedRewards: guaranteed(4, 2, 50),
    recommendedSpecialRewards: [
      reward({
        id: 'amulet_of_tide_taming',
        name: 'Amulet of Tide-Taming',
        type: 'unique_relic',
        requires: ['tame_tides'],
        itemIds: ['Amulet of Tide-Taming'],
        affinity: 'water',
        baseEffect: 'Breathe underwater for one scene once per rest; +1 Survival or Sailing in water hazards.',
        affinityEffect: 'Water affinity extends underwater breathing to close allies in the same scene.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'plus_1_weapons'],
  },
  drowned_market: {
    wave: '4b',
    tier: 2,
    recommendedLevelRange: [5, 7],
    maxCurrencyBudgetCp: 250,
    maxGearQuality: 'minor_relic',
    guaranteedRewards: guaranteed(4, 2, 50),
    recommendedSpecialRewards: [
      reward({
        id: 'pearl_memory_scale',
        name: 'Pearl Memory Scale',
        type: 'unique_relic',
        requires: ['evacuation_justice'],
        itemIds: ['Pearl Memory Scale'],
        affinity: 'aether',
        baseEffect: 'Once per rest, reroll a failed Lore, Insight, Perception, Negotiation, or Deception check. Cost: -1 to that skill until next rest or surrender one journal memory scene.',
        affinityEffect: 'Aether affinity may reject the reroll after seeing it and pay no cost.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'plus_1_weapons'],
  },
  clockwork_conservatory: {
    wave: '4c',
    tier: 3,
    recommendedLevelRange: [6, 8],
    maxCurrencyBudgetCp: 350,
    maxGearQuality: 'utility_core',
    guaranteedRewards: guaranteed(4, 2, 100),
    recommendedSpecialRewards: [
      reward({
        id: 'chrono_scholar',
        name: 'Chrono-Scholar',
        type: 'rare_attribute_point',
        requires: ['solve_chrono_dials'],
        attributeOptions: ['intellect'],
        notes: 'Permanent Intellect increase, capped at 5.',
      }),
    ],
    disallowedRewards: ['weapons_above_plus_1', 'spell_scrolls'],
  },
  obsidian_vault: {
    wave: '4d',
    tier: 3,
    recommendedLevelRange: [6, 8],
    maxCurrencyBudgetCp: 400,
    maxGearQuality: '+2 relic weapon or shield',
    guaranteedRewards: guaranteed(4, 1, 100),
    recommendedSpecialRewards: [
      reward({
        id: 'forge_heart_armament',
        name: 'Forged fire-core armament',
        type: 'useful_gear',
        requires: ['forge_heart'],
        itemIds: ['Basalt Warhammer +2', 'Flame-ward Shield +2'],
        affinity: 'fire',
        baseEffect: 'Award one appropriate +2 fire-core item, not both by default.',
        affinityEffect: 'Fire affinity improves the item rest power to an 8-hour recharge.',
        notes: 'Adventure order 12 is late enough for a first +2 weapon/shield, but not +3.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'water_magic_gear'],
  },
  mirror_war_saint_orra: {
    wave: '4e',
    tier: 3,
    recommendedLevelRange: [7, 8],
    maxCurrencyBudgetCp: 300,
    maxGearQuality: '+1 relic or light weapon',
    guaranteedRewards: guaranteed(4, 1, 50),
    recommendedSpecialRewards: [
      reward({
        id: 'saintly_conviction',
        name: 'Saintly Conviction',
        type: 'rare_attribute_point',
        requires: ['reconciled_mirror'],
        attributeOptions: ['charisma', 'willpower'],
        notes: 'Permanent Charisma or Willpower increase, capped at 5.',
      }),
      reward({
        id: 'saint_orras_veil_plus_3',
        name: "Saint Orra's Veil +3",
        type: 'major_relic',
        requires: ['reconciled_mirror'],
        itemIds: ["Saint Orra's Veil +3"],
        affinity: 'aether',
        baseEffect: '+3 Insight or Divine Communion when judging truth, possession, doubles, or reflected identities.',
        affinityEffect: 'Aether affinity sees through one illusion, possession, or false double once per rest.',
        notes: 'Late-stage non-weapon +3 relic so non-martial characters also feel power growth.',
      }),
    ],
    disallowedRewards: ['weapons_above_plus_1'],
  },
  iron_colosseum: {
    wave: '5a',
    tier: 3,
    recommendedLevelRange: [8, 10],
    maxCurrencyBudgetCp: 400,
    maxGearQuality: '+2 weapon',
    guaranteedRewards: guaranteed(5, 3, 120),
    recommendedSpecialRewards: [
      reward({
        id: 'champion_maul_plus_2',
        name: 'Champion Maul +2',
        type: 'useful_gear',
        requires: ['grand_championship'],
        itemIds: ['Champion Maul +2'],
        notes: '+2 hit, 1d10+1 blunt heavy weapon. Requires an item table entry before final reward grant.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'spellbooks'],
  },
  brass_plague_tinkertown: {
    wave: '5b',
    tier: 3,
    recommendedLevelRange: [8, 10],
    maxCurrencyBudgetCp: 500,
    maxGearQuality: '+2 tool',
    guaranteedRewards: guaranteed(5, 3, 150),
    recommendedSpecialRewards: [
      reward({
        id: 'masterwork_tool_kit_plus_2',
        name: 'Masterwork Tool Kit +2',
        type: 'useful_gear',
        requires: ['reprogram_network'],
        itemIds: ['Masterwork Tool Kit +2'],
        notes: '+2 Crafting and Smithing checks. Requires an item table entry before final reward grant.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'plus_2_weapons'],
  },
  astral_sky: {
    wave: '5c',
    tier: 4,
    recommendedLevelRange: [9, 10],
    maxCurrencyBudgetCp: 600,
    maxGearQuality: '+2 bow',
    guaranteedRewards: guaranteed(5, 2, 150),
    recommendedSpecialRewards: [
      reward({
        id: 'sky_stalker_composite_bow_plus_2',
        name: 'Sky-Stalker Composite Bow +2',
        type: 'useful_gear',
        requires: ['tether_sky'],
        itemIds: ['Sky-Stalker Composite Bow +2'],
        affinity: 'air',
        baseEffect: '+2 ranged combat, 1d8+1 piercing.',
        affinityEffect: 'Air affinity ignores wind, height, and unstable footing penalties.',
      }),
      reward({
        id: 'starfall_bowstring_plus_3',
        name: 'Starfall Bowstring +3',
        type: 'weapon_upgrade',
        requires: ['tether_sky'],
        itemIds: ['Starfall Bowstring +3'],
        affinity: 'air',
        baseEffect: 'Upgrade one bow to +3. Once per rest, an arrow strikes an incorporeal, flying, or astral target normally.',
        affinityEffect: 'Air affinity also ignores cover on the once-rest astral shot.',
        notes: 'Late-stage +3 upgrade that can be used in Frostfire Crypt and Harvest Hill.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'earth_magic_gear'],
  },
  frostfire_crypt: {
    wave: '5d',
    tier: 4,
    recommendedLevelRange: [9, 10],
    maxCurrencyBudgetCp: 700,
    maxGearQuality: 'major_relic',
    guaranteedRewards: guaranteed(5, 3, 200),
    recommendedSpecialRewards: [
      reward({
        id: 'frostfire_heart',
        name: 'Frostfire Heart',
        type: 'major_relic',
        requires: ['awaken_crypt'],
        itemIds: ['Frostfire Heart'],
        affinity: 'water',
        baseEffect: 'Once per rest, choose Flame Stance or Frost Stance for one scene.',
        affinityEffect: 'Water affinity grants party cold ward during Frost Stance.',
      }),
      reward({
        id: 'frostfire_glaive_plus_3',
        name: 'Frostfire Glaive +3',
        type: 'useful_gear',
        requires: ['awaken_crypt'],
        itemIds: ['Frostfire Glaive +3'],
        affinity: 'water',
        baseEffect: '+3 Heavy Weapons, 1d10 edged or piercing. Once per rest, add +3 elemental damage.',
        affinityEffect: 'Water affinity may slow instead of dealing the extra damage.',
        notes: 'Late +3 weapon reward usable in Harvest Hill and future expansions.',
      }),
    ],
    disallowedRewards: ['permanent_attribute_boost', 'non_elemental_gear_above_plus_1'],
  },
  harvest_hill_hunger: {
    wave: '6a',
    tier: 4,
    recommendedLevelRange: [10, 12],
    maxCurrencyBudgetCp: 500,
    maxGearQuality: '+2 or rare +3 pact relic',
    guaranteedRewards: guaranteed(6, 1, 50),
    openingRewards: [
      reward({
        id: 'dawnbound_sickle_plus_3',
        name: 'Dawnbound Sickle +3',
        type: 'opening_weapon',
        requires: ['begin_harvest_hill'],
        itemIds: ['Dawnbound Sickle +3'],
        affinity: 'earth',
        availability: 'opening',
        baseEffect: '+3 Light Weapons, 1d6 edged. Especially effective against roots, vines, famine spirits, and pact-bound growth.',
        affinityEffect: 'Earth affinity: once per rest, root yourself until your next action to gain high resistance to forced movement and physical damage.',
        notes: 'Placed in the opening scene so the capstone weapon matters during the final adventure.',
      }),
    ],
    recommendedSpecialRewards: [
      reward({
        id: 'unending_harvest',
        name: 'Unending Harvest',
        type: 'rare_capstone_attribute_boon',
        requires: ['broken_pact'],
        attributeOptions: ['vigor'],
        cap: MONSTROUS_ATTRIBUTE_SCORE,
        notes: 'The only current campaign reward allowed to raise a PC attribute to 6.',
      }),
    ],
    disallowedRewards: ['uncapped_attribute_boost', 'unlisted_major_relic'],
  },
};

export const getAdventureRewardModel = (adventureId) => (
  ADVENTURE_REWARD_MODELS[adventureId] || null
);
