import { describe, expect, it } from 'vitest';
import { TRAVEL_ENCOUNTERS, getRandomTravelEncounter } from './travelEncounters';
import { SKILLS_LIST } from './gms';

const validSkills = new Set(SKILLS_LIST.map(s => s.id));

describe('Travel & Roadside Combat Encounters', () => {
  it('has 8 starting encounters plus 4 level 2+ road threats, all with full tactical branches', () => {
    expect(TRAVEL_ENCOUNTERS.filter(e => !e.minLevel).length).toBe(8);
    expect(TRAVEL_ENCOUNTERS.filter(e => e.minLevel === 2).map(e => e.id).sort())
      .toEqual(['anarchist_street_gang', 'flagellant_zealots', 'inquisition_enforcers', 'tollroad_crossbowmen']);

    const regionsCovered = new Set();

    // The level 2+ threats are written as shorter scenes (4-5 ways out) and
    // need not cover every school of magic.
    for (const encounter of TRAVEL_ENCOUNTERS.filter(e => e.minLevel)) {
      expect(encounter.approaches.length).toBeGreaterThanOrEqual(4);
      for (const app of encounter.approaches) {
        expect(validSkills.has(app.skill), `Invalid skill: ${app.skill}`).toBe(true);
        expect(validSkills.has(app.fallbackSkill), `Invalid fallback skill: ${app.fallbackSkill}`).toBe(true);
        expect(app.winDesc.length).toBeGreaterThan(10);
        expect(app.failDesc.length).toBeGreaterThan(10);
      }
    }

    for (const encounter of TRAVEL_ENCOUNTERS.filter(e => !e.minLevel)) {
      expect(encounter.id).toBeTruthy();
      expect(encounter.title).toBeTruthy();
      expect(encounter.intro.length).toBeGreaterThan(20);
      expect(encounter.approaches.length).toBe(5);
      regionsCovered.add(encounter.region);

      // Verify each approach
      for (const app of encounter.approaches) {
        expect(app.name).toBeTruthy();
        expect(validSkills.has(app.skill), `Invalid skill: ${app.skill}`).toBe(true);
        if (app.fallbackSkill) {
          expect(validSkills.has(app.fallbackSkill), `Invalid fallback skill: ${app.fallbackSkill}`).toBe(true);
        }
        expect(app.actionDesc.length).toBeGreaterThan(10);
        expect(app.winDesc.length).toBeGreaterThan(10);
        expect(app.failDesc.length).toBeGreaterThan(10);
        expect(app.rewards).toBeDefined();
        expect(typeof app.rewards.reputation).toBe('number');
      }

      // Verify that every encounter includes physical, magical, divine, and diplomatic options
      const skills = encounter.approaches.map(a => a.skill);
      const hasCombat = skills.some(s => ['marksmanship', 'heavy_weapons', 'light_weapons', 'brawling', 'blocking'].includes(s));
      const hasMagic = skills.some(s => ['arcane_shaping', 'arcane_drawing'].includes(s));
      const hasDivine = skills.some(s => ['divine_manifestation', 'divine_communion'].includes(s));
      const hasSocial = skills.some(s => ['negotiation', 'intimidation', 'deception'].includes(s));

      expect(hasCombat, `${encounter.id} missing combat approach`).toBe(true);
      expect(hasMagic, `${encounter.id} missing magic approach`).toBe(true);
      expect(hasDivine, `${encounter.id} missing divine approach`).toBe(true);
      expect(hasSocial, `${encounter.id} missing social approach`).toBe(true);
    }

    expect(regionsCovered.has('region1')).toBe(true);
    expect(regionsCovered.has('region2')).toBe(true);
    expect(regionsCovered.has('region3')).toBe(true);
    expect(regionsCovered.has('region4')).toBe(true);
  });

  it('selects a valid random encounter for each of the 4 regions', () => {
    for (const reg of ['region1', 'region2', 'region3', 'region4']) {
      const enc = getRandomTravelEncounter(reg);
      expect(enc).toBeDefined();
      expect(enc.region).toBe(reg);
      expect(enc.approaches.length).toBe(5);
    }
  });

  it('keeps level 2+ road threats away from a level 1 character', () => {
    for (let i = 0; i < 200; i++) expect(getRandomTravelEncounter('region1', 1).minLevel).toBeUndefined();
    const seen = new Set(Array.from({ length: 400 }, () => getRandomTravelEncounter('region1', 2).id));
    expect(seen.has('flagellant_zealots')).toBe(true);
    expect(seen.has('tollroad_crossbowmen')).toBe(true);
  });
});
