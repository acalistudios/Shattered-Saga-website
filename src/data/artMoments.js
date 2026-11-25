// Standard artwork moments: fixed paintings every player sees at the same
// story beat, once per character. What and when: ARTWORK_MOMENTS.md in the
// private coordination repo; the trigger logic is utils/artMoments.js.
//
// Images are only shown once their file exists (artManifest.json, rewritten
// by the art ingest script), so a moment can be declared before it is painted.

// Named NPCs per adventure. `match` is tested (case-sensitive, whole word)
// against the GM's narration while that adventure is active; the first
// mention shows the portrait.
export const NPC_PORTRAITS = {
  ashveil_keep: [
    { id: 'vance', name: 'Vance', match: 'Vance' },
    { id: 'martha', name: 'Martha', match: 'Martha' },
    { id: 'skritt', name: 'Skritt', match: 'Skritt' },
    { id: 'aldric_voss', name: 'Aldric Voss', match: 'Aldric' },
    { id: 'malachar', name: 'Malachar', match: 'Malachar' }
  ],
  saltblood_mines: [
    { id: 'sera', name: 'Sera', match: 'Sera' },
    { id: 'old_bram', name: 'Old Bram', match: 'Bram' },
    { id: 'kael', name: 'Kael', match: 'Kael' },
    { id: 'mirra', name: 'Mirra', match: 'Mirra' },
    { id: 'kaelen_iron_breaker', name: 'Kaelen Iron-Breaker', match: 'Kaelen' },
    { id: 'threx', name: 'Threx', match: 'Threx' },
    { id: 'redvein_possessed_prisoner', name: 'Redvein-Possessed Prisoner', match: 'possessed prisoner|Possessed Prisoner' }
  ],
  blackroot_hollow: [
    { id: 'old_mara', name: 'Old Mara', match: 'Mara' },
    { id: 'mother_silken', name: 'Mother Silken', match: 'Mother Silken|Silken' },
    { id: 'deep_molt_horror', name: 'Deep Molt Horror', match: 'Molt Horror|Deep Molt' },
    { id: 'silas', name: 'Silas the Timber-Hound', match: 'Silas' }
  ],
  thorn_treaty: [
    { id: 'reeve_hollis', name: 'Reeve Hollis', match: 'Hollis' },
    { id: 'warden_sella', name: 'Warden Sella', match: 'Sella' },
    { id: 'briar_eyed_leth', name: 'Briar-Eyed Leth', match: 'Leth' }
  ],
  glass_orchard_masquerade: [
    { id: 'lady_istra_vale', name: 'Lady Istra Vale', match: 'Istra' },
    { id: 'the_vesper_knife', name: 'The Vesper Knife', match: 'Vesper Knife' },
    { id: 'orchard_seneschal_pell', name: 'Seneschal Pell', match: 'Pell' }
  ],
  elemental_crucible: [
    { id: 'ilyra_of_the_fivefold_font', name: 'Ilyra of the Fivefold Font', match: 'Ilyra' },
    { id: 'the_cinder_stag', name: 'The Cinder Stag', match: 'Cinder Stag' },
    { id: 'the_granite_matron', name: 'The Granite Matron', match: 'Granite Matron' },
    { id: 'the_mirror_of_affinity', name: 'The Mirror of Affinity', match: 'Mirror of Affinity' }
  ],
  greywash_bandit_crown: [
    { id: 'tamsin_crowe', name: 'Tamsin Crowe', match: 'Tamsin' },
    { id: 'rusk_fen', name: 'Rusk Fen', match: 'Rusk' },
    { id: 'elsbet_vale', name: 'Elsbet Vale', match: 'Elsbet' }
  ],
  sunken_spire: [
    { id: 'vaelin_deep_eye', name: 'Vaelin Deep-Eye', match: 'Vaelin' },
    { id: 'naelia_the_diver', name: 'Naelia the Diver', match: 'Naelia' },
    { id: 'drowned_guardian', name: 'Drowned Guardian', match: 'Drowned Guardian' }
  ],
  merrin_abbey_plague_bells: [
    { id: 'sister_hale', name: 'Sister Hale', match: 'Hale' },
    { id: 'the_bell_grief', name: 'The Bell Grief', match: 'Bell Grief' },
    { id: 'prior_malrec', name: 'Prior Malrec', match: 'Malrec' },
    { id: 'sister_maren', name: 'Sister Maren', match: 'Maren' }
  ],
  drowned_market: [
    { id: 'nera_saltveil', name: 'Nera Saltveil', match: 'Nera' },
    { id: 'harbormaster_quill', name: 'Harbormaster Quill', match: 'Quill' },
    { id: 'tide_bailiff', name: 'Tide Bailiff', match: 'Tide Bailiff' }
  ],
  clockwork_conservatory: [
    { id: 'baron_von_rictor', name: 'Baron von Rictor', match: 'Rictor' },
    { id: 'unit_7', name: 'Unit-7', match: 'Unit-7' },
    { id: 'pip', name: 'Pip', match: 'Pip' },
    { id: 'eleanor_s_hologram', name: "Eleanor's Hologram", match: 'Eleanor' },
    { id: 'cog_tail', name: 'Cog-Tail', match: 'Cog-Tail' }
  ],
  obsidian_vault: [
    { id: 'lothar_the_smelter', name: 'Lothar the Smelter', match: 'Lothar' },
    { id: 'aria_the_flame_speaker', name: 'Aria the Flame-Speaker', match: 'Aria' },
    { id: 'volcanic_warden', name: 'Volcanic Warden', match: 'Volcanic Warden' },
    { id: 'ember_maw', name: 'Ember Maw', match: 'Ember Maw' }
  ],
  iron_colosseum: [
    { id: 'cassia_redhand', name: 'Cassia Redhand', match: 'Cassia' },
    { id: 'varro_cindergold', name: 'Varro Cindergold', match: 'Varro' },
    { id: 'durn_ashjaw', name: 'Durn Ashjaw', match: 'Durn' },
    { id: 'mira_of_the_underworks', name: 'Mira of the Underworks', match: 'Mira' }
  ],
  brass_plague_tinkertown: [
    { id: 'jannik_gearwise', name: 'Jannik Gearwise', match: 'Jannik' },
    { id: 'matron_12', name: 'Matron 12', match: 'Matron 12|Matron-12' },
    { id: 'baker_omel', name: 'Baker Omel', match: 'Omel' }
  ],
  mirror_war_saint_orra: [
    { id: 'father_elian', name: 'Father Elian', match: 'Elian' },
    { id: 'mara_twice', name: 'Mara-Twice', match: 'Mara-Twice' },
    { id: 'the_silver_contrary', name: 'The Silver Contrary', match: 'Silver Contrary' }
  ],
  astral_sky: [
    { id: 'zephyr_gale_rider', name: 'Zephyr Gale-Rider', match: 'Zephyr' },
    { id: 'elder_oron', name: 'Elder Oron', match: 'Oron' },
    { id: 'vortex_elemental', name: 'Vortex Elemental', match: 'Vortex Elemental' },
    { id: 'astral_sky_guardian', name: 'Gravity-Warped Guardian', match: 'Gravity-Warped Guardian' }
  ],
  frostfire_crypt: [
    { id: 'theron_the_scribe', name: 'Theron the Scribe', match: 'Theron' },
    { id: 'kaelen_ghar', name: 'Kaelen-Ghar', match: 'Kaelen-Ghar' },
    { id: 'frostbite_spiders', name: 'Frostbite Spiders', match: 'Frostbite Spider' },
    { id: 'the_guardian_golem', name: 'The Guardian Golem', match: 'Guardian Golem' }
  ],
  harvest_hill_hunger: [
    { id: 'elder_rowan', name: 'Elder Rowan', match: 'Rowan' },
    { id: 'the_hill_hunger', name: 'The Hill Hunger', match: 'Hill Hunger' },
    { id: 'nell_of_the_empty_chair', name: 'Nell of the Empty Chair', match: 'Nell' }
  ]
};

export const npcPortraitPath = (adventureId, npcId) => `/images/npcs/${adventureId}/${npcId}.webp`;

// Companions: the recruit moment shows the companion's portrait.
export const COMPANION_PORTRAITS = {
  skritt_goblin: { adventureId: 'ashveil_keep', npcId: 'skritt', caption: 'Skritt joins you' },
  kaelen_miner: { adventureId: 'saltblood_mines', npcId: 'kaelen_iron_breaker', caption: 'Kaelen Iron-Breaker joins you' },
  silas_hound: { adventureId: 'blackroot_hollow', npcId: 'silas', caption: 'Silas the Timber-Hound joins you' },
  sister_maren: { adventureId: 'merrin_abbey_plague_bells', npcId: 'sister_maren', caption: 'Sister Maren joins you' },
  cogtail_familiar: { adventureId: 'clockwork_conservatory', npcId: 'cog_tail', caption: 'Cog-Tail joins you' }
};

// Campaign-wide moments, keyed by id; images live in /images/moments/.
export const CAMPAIGN_MOMENTS = {
  first_rest: { caption: 'Your first night on the road' },
  level_up: { caption: 'You grow stronger' },
  awaken_fire: { caption: 'Fire awakens within you' },
  awaken_earth: { caption: 'Earth awakens within you' },
  awaken_air: { caption: 'Air awakens within you' },
  awaken_water: { caption: 'Water awakens within you' },
  awaken_aether: { caption: 'Aether awakens within you' },
  resurrection: { caption: 'You return from death' },
  keystone: { caption: 'A Keystone Shard answers you' },
  heavy_armour: { caption: 'Clad in heavy armour' },
  first_patrol: { caption: 'Your first road patrol' },
  first_arena: { caption: 'Your first arena bout' }
};

export const momentPath = (id) => `/images/moments/${id}.webp`;

// Per adventure: the climax painting is shown alongside these endings only
// (the ones where the climax actually happens); every ending has its own image.
export const ADVENTURE_CLIMAX_ENDINGS = {
  ashveil_keep: ['heroic', 'vanquish'],
  saltblood_mines: ['heroic', 'evidenceonly', 'destroyoperation'],
  blackroot_hollow: ['purge', 'relocate'],
  thorn_treaty: ['peace', 'sideforest'],
  glass_orchard_masquerade: ['prevent', 'expose', 'fakedeath'],
  elemental_crucible: ['awakened', 'sharedpower', 'boundpower', 'stolenpower'],
  greywash_bandit_crown: ['sweep', 'reform', 'expose'],
  sunken_spire: ['preserve', 'freevaelin'],
  merrin_abbey_plague_bells: ['cure', 'exorcise'],
  drowned_market: ['breakcurse', 'preservemarket'],
  clockwork_conservatory: ['savebaron', 'mercifulend'],
  obsidian_vault: ['stabilize', 'destroy', 'forge'],
  iron_colosseum: ['winfreedom', 'revolt'],
  brass_plague_tinkertown: ['disable', 'repair'],
  mirror_war_saint_orra: ['shatter', 'judge', 'seal'],
  astral_sky: ['stabilize', 'claim', 'release'],
  frostfire_crypt: ['contain', 'destroy', 'claim'],
  harvest_hill_hunger: ['slay', 'breakpact']
};

export const climaxPath = (adventureId) => `/images/moments/${adventureId}/boss_defeated.webp`;
export const endingPath = (adventureId, endingId) => `/images/moments/${adventureId}/ending_${endingId}.webp`;
