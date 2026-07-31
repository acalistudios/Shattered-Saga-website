export const WORLD_REGIONS = [
  {
    id: 'region1',
    name: 'Region 1: Aethelgard',
    x: 38,
    y: 48,
    desc: 'Central-west kingdom of forests, farms, rivers, gothic keeps, roads, wetlands, mines, and old ruins.'
  },
  {
    id: 'region2',
    name: 'Region 2: Ignis Ridge',
    x: 73,
    y: 28,
    desc: 'Northeastern volcanic range of black mountains, lava flows, calderas, ash roads, forges, and brass industry.'
  },
  {
    id: 'region3',
    name: 'Region 3: Frostfire Glacier',
    x: 66,
    y: 73,
    desc: 'Southeastern/southern frozen region of glaciers, ice cliffs, blackroot caves, plague roads, crypts, and frozen coast.'
  },
  {
    id: 'region4',
    name: 'Region 4: The Sapphire Deep',
    x: 20,
    y: 61,
    desc: 'Western/southwestern ocean region of deep sea, drowned ruins, ghost quays, glass islands, and floating astral isles.'
  }
];

export const MAP_NODES = {
  elemental_crucible: { region: 'region1', x: 51, y: 52, labelOffset: 'bottom' },
  ashveil_keep: { region: 'region1', x: 36, y: 25, labelOffset: 'bottom' },
  saltblood_mines: { region: 'region1', x: 24, y: 51, labelOffset: 'right' },
  clockwork_conservatory: { region: 'region1', x: 78, y: 25, labelOffset: 'bottom' },
  sunken_spire: { region: 'region1', x: 17, y: 74, labelOffset: 'right' },
  greywash_bandit_crown: { region: 'region1', x: 50, y: 43, labelOffset: 'bottom' },
  thorn_treaty: { region: 'region1', x: 69, y: 47, labelOffset: 'right' },
  harvest_hill_hunger: { region: 'region1', x: 48, y: 68, labelOffset: 'bottom' },
  mirror_war_saint_orra: { region: 'region1', x: 55, y: 88, labelOffset: 'top' },

  obsidian_vault: { region: 'region2', x: 24, y: 32, labelOffset: 'bottom' },
  iron_colosseum: { region: 'region2', x: 49, y: 55, labelOffset: 'top' },
  brass_plague_tinkertown: { region: 'region2', x: 73, y: 73, labelOffset: 'top' },

  frostfire_crypt: { region: 'region3', x: 55, y: 28, labelOffset: 'bottom' },
  blackroot_hollow: { region: 'region3', x: 24, y: 48, labelOffset: 'right' },
  merrin_abbey_plague_bells: { region: 'region3', x: 65, y: 67, labelOffset: 'top' },

  astral_sky: { region: 'region4', x: 31, y: 20, labelOffset: 'bottom' },
  drowned_market: { region: 'region4', x: 70, y: 48, labelOffset: 'left' },
  glass_orchard_masquerade: { region: 'region4', x: 46, y: 52, labelOffset: 'bottom' }
};

export const MAP_CONNECTIONS = {
  region1: [
    { from: 'ashveil_keep', to: 'greywash_bandit_crown' },
    { from: 'greywash_bandit_crown', to: 'clockwork_conservatory' },
    { from: 'clockwork_conservatory', to: 'thorn_treaty' },
    { from: 'thorn_treaty', to: 'elemental_crucible' },
    { from: 'elemental_crucible', to: 'sunken_spire' },
    { from: 'ashveil_keep', to: 'harvest_hill_hunger' },
    { from: 'harvest_hill_hunger', to: 'saltblood_mines' },
    { from: 'saltblood_mines', to: 'mirror_war_saint_orra' },
    { from: 'mirror_war_saint_orra', to: 'elemental_crucible' }
  ],
  region2: [
    { from: 'obsidian_vault', to: 'iron_colosseum' },
    { from: 'iron_colosseum', to: 'brass_plague_tinkertown' }
  ],
  region3: [
    { from: 'blackroot_hollow', to: 'frostfire_crypt' },
    { from: 'frostfire_crypt', to: 'merrin_abbey_plague_bells' },
    { from: 'blackroot_hollow', to: 'merrin_abbey_plague_bells' }
  ],
  region4: [
    { from: 'astral_sky', to: 'glass_orchard_masquerade' },
    { from: 'glass_orchard_masquerade', to: 'drowned_market' },
    { from: 'astral_sky', to: 'drowned_market' }
  ]
};

export const MAP_IMAGES = {
  world: '/images/maps/v2/world_map_parchment.png',
  region1: '/images/maps/v2/region1_aethelgard.png',
  region2: '/images/maps/v2/region2_ignis_ridge.png',
  region3: '/images/maps/v2/region3_frostfire_glacier.png',
  region4: '/images/maps/v2/region4_sapphire_deep.png'
};
