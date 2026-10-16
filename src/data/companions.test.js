import { describe, expect, it } from 'vitest';
import { COMPANIONS, getCompanionById, getCompanionForSkill, calculateCompanionSkillBonus } from './companions';
import { SKILLS_LIST } from './gms';

const validSkills = new Set(SKILLS_LIST.map(s => s.id));

describe('Companions & Teamwork System', () => {
  it('defines valid companions with authentic canonical skills', () => {
    expect(COMPANIONS.length).toBeGreaterThanOrEqual(5);

    for (const comp of COMPANIONS) {
      expect(comp.id).toBeTruthy();
      expect(comp.name).toBeTruthy();
      expect(comp.role).toBeTruthy();
      expect(comp.icon).toBeTruthy();
      expect(comp.adventureId).toBeTruthy();
      expect(comp.assistBonus).toBeGreaterThanOrEqual(1);
      expect(comp.desc.length).toBeGreaterThan(20);
      expect(comp.skills.length).toBeGreaterThanOrEqual(3);

      for (const skillId of comp.skills) {
        expect(validSkills.has(skillId), `Companion ${comp.id} has invalid skill ${skillId}`).toBe(true);
      }
    }
  });

  it('correctly matches companions to their specialized assist skills', () => {
    const activeCompanions = ['skritt_goblin', 'silas_hound'];

    // Skritt assists with stealth and trapping
    const stealthComp = getCompanionForSkill(activeCompanions, 'stealth');
    expect(stealthComp).toBeDefined();
    expect(stealthComp.name).toBe('Skritt the Goblin Scout');

    // Silas assists with tracking and animal_rapport
    const trackingComp = getCompanionForSkill(activeCompanions, 'tracking');
    expect(trackingComp).toBeDefined();
    expect(trackingComp.name).toBe('Silas the Timber-Hound');

    // Unassisted skill returns null
    const heavyComp = getCompanionForSkill(activeCompanions, 'heavy_weapons');
    expect(heavyComp).toBeNull();
  });

  it('calculates the teamwork assist bonus for skill checks', () => {
    const activeCompanions = ['skritt_goblin'];

    expect(calculateCompanionSkillBonus(activeCompanions, 'trapping')).toBe(1);
    expect(calculateCompanionSkillBonus(activeCompanions, 'stealth')).toBe(1);
    expect(calculateCompanionSkillBonus(activeCompanions, 'arcane_shaping')).toBe(0);
    expect(calculateCompanionSkillBonus([], 'trapping')).toBe(0);
  });
});
