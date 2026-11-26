import { describe, expect, it } from 'vitest';
import fs from 'fs';
import {
  PEOPLES, PEOPLE_HUBS, goblinStance, peopleStance, peopleEncounterAvailable, applyPeoplePatrolOutcome,
  discoveredPeopleHubs, peopleStanding,
} from './peoples';
import { TRAVEL_ENCOUNTERS, getRandomTravelEncounter } from './travelEncounters';
import { ADVENTURE_ECONOMY_METADATA } from './adventureEconomy';
import { TAVERNS } from './downtimeMerchants';
import { PATROL_FOES, encounterImage, buildPatrolAdventure, patrolIdFor, isParleyApproach, patrolGearRecovery } from '../utils/patrolEngine';
import { merchantPortraitPath } from '../utils/artMoments';
import manifest from './artManifest.json';

const PAINTED = new Set(manifest);
const hero = (over = {}) => ({ name: 'T', stats: { level: 2 }, companions: [], completed_adventures: [], progression: {}, ...over });
const goblinIds = (c) => new Set(Array.from({ length: 300 }, () => getRandomTravelEncounter('region1', 2, c).id).filter(id => id.startsWith('goblin_')));

describe('goblins and Skritt', () => {
  it('are wary of strangers, friendly to Skritt\'s friends, hostile after Ashveil without him', () => {
    expect(goblinStance(hero())).toBe('wary');
    expect(goblinStance(hero({ companions: ['skritt_goblin'] }))).toBe('friendly');
    expect(goblinStance(hero({ progression: { partedCompanions: ['skritt_goblin'] } }))).toBe('friendly');
    expect(goblinStance(hero({ progression: { artSeen: ['companion:skritt_goblin'] } }))).toBe('friendly');
    expect(goblinStance(hero({ completed_adventures: ['ashveil_keep'] }))).toBe('hostile');
    // Standing earned on the road outweighs the Ashveil story either way.
    expect(goblinStance(hero({ completed_adventures: ['ashveil_keep'], progression: { peopleStanding: { goblins: 20 } } }))).toBe('friendly');
    expect(goblinStance(hero({ companions: ['skritt_goblin'], progression: { peopleStanding: { goblins: -20 } } }))).toBe('hostile');
  });

  it('puts exactly one goblin band on the road, the one that matches', () => {
    expect([...goblinIds(hero())]).toEqual(['goblin_toll']);
    expect([...goblinIds(hero({ companions: ['skritt_goblin'] }))]).toEqual(['goblin_traders']);
    expect([...goblinIds(hero({ completed_adventures: ['ashveil_keep'] }))]).toEqual(['goblin_raiders']);
    expect(peopleEncounterAvailable(TRAVEL_ENCOUNTERS.find(e => e.id === 'highway_bandit_ambush'), hero())).toBe(true);
  });

  it('peaceful meetings build trust and reveal the Warren; fights cost it', () => {
    const traders = TRAVEL_ENCOUNTERS.find(e => e.id === 'goblin_traders');
    const met = applyPeoplePatrolOutcome(hero(), traders, 'parley');
    expect(peopleStanding(met, 'goblins')).toBe(5);
    expect(discoveredPeopleHubs(met).map(h => h.id)).toEqual(['gutterstone_warren']);
    const robbed = applyPeoplePatrolOutcome(hero(), traders, 'victory');
    expect(peopleStanding(robbed, 'goblins')).toBe(-10);
    expect(discoveredPeopleHubs(robbed)).toEqual([]);
    expect(applyPeoplePatrolOutcome(hero(), traders, 'escaped')).toEqual(hero());
  });

  it('the trader meeting is a peaceful scene with a merchant on the spot', () => {
    const adv = buildPatrolAdventure(patrolIdFor('goblin_traders'));
    expect(adv.patrolPeaceful).toBe(true);
    expect(adv.settings).toEqual(['The Goblin Wagon Camp']);
    const merchants = ADVENTURE_ECONOMY_METADATA[adv.id].merchants;
    expect(merchants.map(m => m.location)).toEqual(['The Goblin Wagon Camp']);
    // Every peaceful way through counts as a parley; only robbing them is a fight.
    const traders = TRAVEL_ENCOUNTERS.find(e => e.id === 'goblin_traders');
    expect(traders.approaches.filter(a => !isParleyApproach(a)).map(a => a.id)).toEqual(['goblin_trade_betray']);
  });
});

describe('dwarves and the Fire Core', () => {
  const vault = (ending) => hero({ completed_adventures: ['obsidian_vault'], progression: { completedEndings: { obsidian_vault: [ending] } } });
  const dwarfIds = (c) => new Set(Array.from({ length: 300 }, () => getRandomTravelEncounter('region2', 2, c).id).filter(id => id.startsWith('dwarf_')));
  it('respect those who saved the ridge and hunt those who stole the core', () => {
    expect(peopleStance(hero(), 'dwarves')).toBe('wary');
    for (const e of ['stabilize', 'destroy', 'forge']) expect(peopleStance(vault(e), 'dwarves')).toBe('friendly');
    expect(peopleStance(vault('steal'), 'dwarves')).toBe('hostile');
    expect(peopleStance({ ...vault('steal'), progression: { ...vault('steal').progression, peopleStanding: { dwarves: 20 } } }, 'dwarves')).toBe('friendly');
  });
  it('puts exactly one dwarf band on the road, the one that matches', () => {
    expect([...dwarfIds(hero())]).toEqual(['dwarf_hold_patrol']);
    expect([...dwarfIds(vault('destroy'))]).toEqual(['dwarf_caravan']);
    expect([...dwarfIds(vault('steal'))]).toEqual(['dwarf_war_party']);
  });
  it('a peaceful caravan meeting reveals Emberdeep Hold', () => {
    const caravan = TRAVEL_ENCOUNTERS.find(e => e.id === 'dwarf_caravan');
    expect(discoveredPeopleHubs(applyPeoplePatrolOutcome(hero(), caravan, 'parley')).map(h => h.id)).toEqual(['emberdeep_hold']);
  });
});

describe('elves and tide-folk judge you by their adventures', () => {
  const ended = (adv, ending) => hero({ completed_adventures: [adv], progression: { completedEndings: { [adv]: [ending] } } });
  it('elves: the Sunken Spire archive', () => {
    expect(peopleStance(hero(), 'elves')).toBe('wary');
    expect(peopleStance(ended('sunken_spire', 'preserve'), 'elves')).toBe('friendly');
    expect(peopleStance(ended('sunken_spire', 'freeVaelin'), 'elves')).toBe('friendly');
    expect(peopleStance(ended('sunken_spire', 'sell'), 'elves')).toBe('hostile');
    expect(peopleStance(ended('sunken_spire', 'destroyed'), 'elves')).toBe('hostile');
  });
  it('tide-folk: the Drowned Market', () => {
    expect(peopleStance(hero(), 'tidefolk')).toBe('wary');
    for (const e of ['breakCurse', 'preserveMarket', 'tradeMemory']) expect(peopleStance(ended('drowned_market', e), 'tidefolk')).toBe('friendly');
    expect(peopleStance(ended('drowned_market', 'robDead'), 'tidefolk')).toBe('hostile');
  });
  it('both peoples share region 4 roads, one band each', () => {
    const ids = new Set(Array.from({ length: 400 }, () => getRandomTravelEncounter('region4', 2, hero()).id));
    expect([...ids].filter(id => id.startsWith('elf_') || id.startsWith('tidefolk_')).sort()).toEqual(['elf_ghost_procession', 'tidefolk_reef_toll']);
    expect(ids.has('skyfolk_wind_wardens')).toBe(true);
  });
  it('the elven dead leave your gear where you fell', () => {
    expect(patrolGearRecovery({ encounterId: 'elf_ghost_wardens', regionId: 'region4', diedAtHours: 0 }).carries).toBe(false);
    expect(patrolGearRecovery({ encounterId: 'tidefolk_raiders', regionId: 'region4', diedAtHours: 0 }).carries).toBe(true);
  });
});

describe('sky-folk and the Focal Core', () => {
  const ended = (ending) => hero({ completed_adventures: ['astral_sky'], progression: { completedEndings: { astral_sky: [ending] } } });
  it('trust those who kept the sky whole and hunt those who claimed its core', () => {
    expect(peopleStance(hero(), 'skyfolk')).toBe('wary');
    expect(peopleStance(ended('stabilize'), 'skyfolk')).toBe('friendly');
    expect(peopleStance(ended('release'), 'skyfolk')).toBe('friendly');
    expect(peopleStance(ended('fail'), 'skyfolk')).toBe('wary');
    expect(peopleStance(ended('claim'), 'skyfolk')).toBe('hostile');
  });
  it('a peaceful skiff meeting reveals Hightether Aerie', () => {
    const skiff = TRAVEL_ENCOUNTERS.find(e => e.id === 'skyfolk_skiff_traders');
    expect(discoveredPeopleHubs(applyPeoplePatrolOutcome(hero(), skiff, 'parley')).map(h => h.id)).toEqual(['hightether_aerie']);
  });
});

// The packet guard: a people ships complete or not at all. This fails while
// any part of a people (encounter, foe, painting, hub, merchant, keeper) is
// missing, so a half-built people cannot reach players.
describe('every people is complete', () => {
  it.each(Object.entries(PEOPLES))('%s', (peopleId, people) => {
    expect(people.summary.length).toBeGreaterThan(40);
    expect(Object.keys(people.encounters).sort()).toEqual(['friendly', 'hostile', 'wary']);
    for (const id of Object.values(people.encounters)) {
      const e = TRAVEL_ENCOUNTERS.find(x => x.id === id);
      expect(e, id).toBeTruthy();
      expect(e.people).toBe(peopleId);
      expect(e.region).toBe(people.region);
      expect(e.approaches.length, id).toBeGreaterThanOrEqual(5);
      e.approaches.forEach(a => expect(typeof a.rewards.reputation).toBe('number'));
      expect(PATROL_FOES[id], `${id} foe`).toBeTruthy();
      expect(encounterImage(id, PATROL_FOES[id]), `${id} painting`).toBeTruthy();
    }
    const hub = PEOPLE_HUBS.find(h => h.id === people.hub);
    expect(hub, 'hub').toBeTruthy();
    expect(hub.discoveredBy).toBe(people.encounters.friendly);
    const merchants = [
      ...(ADVENTURE_ECONOMY_METADATA[hub.id]?.merchants || []),
      ...Object.values(people.encounters).flatMap(id => ADVENTURE_ECONOMY_METADATA[patrolIdFor(id)]?.merchants || []),
    ];
    expect(merchants.length).toBeGreaterThan(0);
    const keeper = TAVERNS[hub.id];
    expect(keeper, 'tavern').toBeTruthy();
    for (const p of [...merchants.map(m => m.portrait), keeper.portrait]) {
      const src = merchantPortraitPath(hub.id, p);
      expect(PAINTED.has(src), src).toBe(true);
      expect(fs.existsSync(`public${src}`), src).toBe(true);
    }
  });
});
