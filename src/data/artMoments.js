// Standard artwork moments: fixed paintings every player sees at the same
// story beat, once per character. What and when: ARTWORK_MOMENTS.md in the
// private coordination repo; the trigger logic is utils/artMoments.js.
//
// Images are only shown once their file exists (artManifest.json, rewritten
// by the art ingest script), so a moment can be declared before it is painted.

// NPC portraits are declared in the adventure data, never spotted in the GM's
// narration (Hans, 2026-11-25):
// - Vendors: `portrait` on the merchant in data/adventureEconomy.js. Shown in
//   the room panel whenever the player stands in that merchant's room.
// - Story NPCs: `portrait: { id, room }` on the NPC in data/adventures.js.
//   Shown once, as a story card, the first time the player is in that room.

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
