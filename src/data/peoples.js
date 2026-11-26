// The non-human peoples of the Shattered world (Hans, 2026-11-25). Each people
// ships as one complete packet: lore, road encounters, named characters and
// their paintings, guarded by peoples.test.js so nothing half-built reaches
// players. Full lore lives in the private coordination repo (PEOPLES.md).
//
// Standing with a people is progression.peopleStanding[peopleId], -100..100,
// moved only by the engine (patrol outcomes), never by the GM.

export const STANDING_LIMIT = 100;
// Standing earned on the road outweighs the story either way.
const FRIENDLY_AT = 15;
const HOSTILE_AT = -15;

export const peopleStanding = (character, peopleId) =>
  character?.progression?.peopleStanding?.[peopleId] || 0;

export function adjustPeopleStanding(character, peopleId, delta) {
  if (!peopleId || !delta) return character;
  const prog = character?.progression || {};
  const now = peopleStanding(character, peopleId);
  const next = Math.max(-STANDING_LIMIT, Math.min(STANDING_LIMIT, now + delta));
  return { ...character, progression: { ...prog, peopleStanding: { ...(prog.peopleStanding || {}), [peopleId]: next } } };
}

/** Companions who ever joined the player, including those who have since parted. */
export const everAllied = (character, companionId) =>
  (character?.companions || []).some(c => (c?.id || c) === companionId)
  || (character?.progression?.partedCompanions || []).includes(companionId)
  // Saves from before partedCompanions existed: the "joins you" painting was shown.
  || (character?.progression?.artSeen || []).includes(`companion:${companionId}`);

const endingsOf = (character, adventureId) =>
  (character?.progression?.completedEndings?.[adventureId] || []).map(e => String(e).toLowerCase());

export const PEOPLES = {
  goblins: {
    name: 'Goblins',
    region: 'region1',
    summary: 'Hill clans of Aethelgard, scattered when the Shattering broke the old roads. Scavengers and sharp traders, not monsters: they remember who treated them well, and who did not.',
    // Skritt is their go-between.
    storyStance: (character) => {
      if (everAllied(character, 'skritt_goblin')) return 'friendly';
      if ((character?.completed_adventures || []).includes('ashveil_keep')) return 'hostile';
      return 'wary';
    },
    encounters: { friendly: 'goblin_traders', wary: 'goblin_toll', hostile: 'goblin_raiders' },
    hub: 'gutterstone_warren',
  },
  dwarves: {
    name: 'Dwarves',
    region: 'region2',
    summary: 'Stone-kin of the Ignis Ridge forge holds, who have worked the fire under the mountains since before the Shattering. Proud, exact and slow to trust, they judge outsiders by what they did with the Fire Core.',
    // The Obsidian Vault decides: saving the ridge earns their respect;
    // stealing the Fire Core makes the player a thief of the clans.
    storyStance: (character) => {
      const endings = endingsOf(character, 'obsidian_vault');
      if (endings.includes('steal')) return 'hostile';
      if (endings.some(e => ['stabilize', 'destroy', 'forge'].includes(e))) return 'friendly';
      return 'wary';
    },
    encounters: { friendly: 'dwarf_caravan', wary: 'dwarf_hold_patrol', hostile: 'dwarf_war_party' },
    hub: 'emberdeep_hold',
  },
  elves: {
    name: 'Elves',
    region: 'region4',
    summary: 'Keepers of what came before the Shattering. Few elves still live; their dead walk the drowned roads of the Sapphire Deep and guard what is left of their memory. They judge the living by what was done to the Sunken Spire archive.',
    storyStance: (character) => {
      const endings = endingsOf(character, 'sunken_spire');
      if (endings.some(e => ['sell', 'destroyed'].includes(e))) return 'hostile';
      if (endings.some(e => ['preserve', 'freevaelin'].includes(e))) return 'friendly';
      return 'wary';
    },
    encounters: { friendly: 'elf_wayfarers', wary: 'elf_ghost_procession', hostile: 'elf_ghost_wardens' },
    hub: 'silverlight_refuge',
  },
  tidefolk: {
    name: 'Tide-folk',
    region: 'region4',
    summary: 'Merfolk of the Sapphire Deep who can walk on land: scaled skin, gills and webbed hands. Salvagers, reef wardens and sharp traders who owe much to the drowned dead, and hate those who rob them.',
    storyStance: (character) => {
      const endings = endingsOf(character, 'drowned_market');
      if (endings.includes('robdead')) return 'hostile';
      if (endings.some(e => ['breakcurse', 'preservemarket', 'tradememory'].includes(e))) return 'friendly';
      return 'wary';
    },
    encounters: { friendly: 'tidefolk_traders', wary: 'tidefolk_reef_toll', hostile: 'tidefolk_raiders' },
    hub: 'pearlgate_grotto',
  },
  skyfolk: {
    name: 'Sky-folk',
    region: 'region4',
    summary: 'Light-boned, feather-crested people of the Astral Reach who sail cloud-skiffs between the floating isles and glide on wing-cloaks. Archers and wind-readers, proud of the sky and wary of groundlings. They judge outsiders by what they did with the Focal Core.',
    // Threads of the Astral Sky: keeping the sky whole earns their trust;
    // claiming its core for yourself makes you a thief of the sky.
    storyStance: (character) => {
      const endings = endingsOf(character, 'astral_sky');
      if (endings.includes('claim')) return 'hostile';
      if (endings.some(e => ['stabilize', 'release'].includes(e))) return 'friendly';
      return 'wary';
    },
    encounters: { friendly: 'skyfolk_skiff_traders', wary: 'skyfolk_wind_wardens', hostile: 'skyfolk_storm_raiders' },
    hub: 'hightether_aerie',
  },
};

// Hubs the player can visit in town (the Downtime market screen) that are
// not tied to a completed adventure. `discoveredBy` names the patrol
// encounter whose peaceful ending reveals the way there.
export const PEOPLE_HUBS = [
  {
    id: 'gutterstone_warren',
    name: 'Gutterstone Warren (goblin village)',
    people: 'goblins',
    region: 'region1',
    discoveredBy: 'goblin_traders',
  },
  {
    id: 'emberdeep_hold',
    name: 'Emberdeep Hold (dwarf forge hold)',
    people: 'dwarves',
    region: 'region2',
    discoveredBy: 'dwarf_caravan',
  },
  {
    id: 'silverlight_refuge',
    name: 'Silverlight Refuge (the last elven home)',
    people: 'elves',
    region: 'region4',
    discoveredBy: 'elf_wayfarers',
  },
  {
    id: 'pearlgate_grotto',
    name: 'Pearlgate Grotto (tide-folk town)',
    people: 'tidefolk',
    region: 'region4',
    discoveredBy: 'tidefolk_traders',
  },
  {
    id: 'hightether_aerie',
    name: 'Hightether Aerie (sky-folk town)',
    people: 'skyfolk',
    region: 'region4',
    discoveredBy: 'skyfolk_skiff_traders',
  },
];

/** How a people sees the player: 'friendly', 'wary' or 'hostile'. */
export function peopleStance(character, peopleId) {
  const people = PEOPLES[peopleId];
  if (!people) return 'wary';
  const standing = peopleStanding(character, peopleId);
  if (standing >= FRIENDLY_AT) return 'friendly';
  if (standing <= HOSTILE_AT) return 'hostile';
  return people.storyStance(character);
}

export const goblinStance = (character) => peopleStance(character, 'goblins');

/** A people's encounters only appear in the form that matches how they see the player. */
export function peopleEncounterAvailable(encounter, character) {
  const people = PEOPLES[encounter?.people];
  if (!people) return true;
  return people.encounters[peopleStance(character, encounter.people)] === encounter.id;
}

/** Hubs this character has found (Downtime market screen). */
export const discoveredPeopleHubs = (character) => {
  const found = character?.progression?.discoveredHubs || [];
  return PEOPLE_HUBS.filter(h => found.includes(h.id));
};

/**
 * Standing and discoveries after a patrol with a people. Peaceful endings
 * build trust; beating them in a fight costs it. A peaceful meeting with a
 * people's traders also shows the player the way to their home.
 */
export function applyPeoplePatrolOutcome(character, encounter, outcome) {
  const peopleId = encounter?.people;
  if (!peopleId || outcome === 'escaped') return character;
  let next = adjustPeopleStanding(character, peopleId, outcome === 'victory' ? -10 : 5);
  const hub = PEOPLE_HUBS.find(h => h.discoveredBy === encounter.id);
  if (hub && outcome === 'parley') {
    const found = next.progression?.discoveredHubs || [];
    if (!found.includes(hub.id)) {
      next = { ...next, progression: { ...next.progression, discoveredHubs: [...found, hub.id] } };
    }
  }
  return next;
}
