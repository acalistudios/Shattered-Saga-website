import { describe, expect, it } from 'vitest';
import { TRAVEL_ENCOUNTERS, getRandomTravelEncounter } from './travelEncounters';
import { SKILLS_LIST } from './gms';

const validSkills = new Set(SKILLS_LIST.map(s => s.id));

describe('Travel & Roadside Combat Encounters', () => {
  it('has valid encounter definitions with full tactical branches', () => {
    expect(TRAVEL_ENCOUNTERS.length).toBeGreaterThan(0);

    for (const encounter of TRAVEL_ENCOUNTERS) {
      expect(encounter.id).toBeTruthy();
      expect(encounter.title).toBeTruthy();
      expect(encounter.intro.length).toBeGreaterThan(20);
      expect(encounter.approaches.length).toBeGreaterThanOrEqual(4);

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
  });

  it('selects a valid random encounter for a given region', () => {
    const enc1 = getRandomTravelEncounter('region1');
    expect(enc1).toBeDefined();
    expect(enc1.region).toBe('region1');

    const enc2 = getRandomTravelEncounter('region2');
    expect(enc2).toBeDefined();
    expect(enc2.region).toBe('region2');
  });
});
