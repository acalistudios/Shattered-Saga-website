import { describe, it, expect } from 'vitest';
import {
  COMPANION_CAMPFIRE_DATA,
  getCompanionCampfireInfo,
  applyCompanionCampfireDuty,
} from './campfireInterludes';

describe('Campfire Interludes & Companion Duties', () => {
  it('defines campfire data for all 5 canonical companions', () => {
    const keys = Object.keys(COMPANION_CAMPFIRE_DATA);
    expect(keys).toEqual(expect.arrayContaining(['skritt', 'kaelen', 'silas', 'sister_maren', 'cog_tail']));
    
    keys.forEach(k => {
      const data = COMPANION_CAMPFIRE_DATA[k];
      expect(data.dialogue.length).toBeGreaterThanOrEqual(2);
      expect(data.duty.name).toBeTruthy();
      expect(data.duty.desc).toBeTruthy();
    });
  });

  it('retrieves combined info from getCompanionCampfireInfo', () => {
    const info = getCompanionCampfireInfo('kaelen');
    expect(info).not.toBeNull();
    expect(info.name).toBe('Kaelen Iron-Breaker');
    expect(info.duty.id).toBe('armor_cinch');
  });

  it('applies Kaelen armor cinch granting tempHp barrier', () => {
    const character = { stats: { hp: 10, maxHp: 10, tempHp: 0 }, progression: {} };
    const { character: updated, message } = applyCompanionCampfireDuty(character, 'kaelen');
    expect(updated.stats.tempHp).toBe(2);
    expect(message).toContain('+2 Temporary HP barrier');
  });

  it('applies Silas hearth vigil restoring fatigue stamina', () => {
    const character = { stats: { hp: 10, fatigue: 2, maxFatigue: 15 }, progression: {} };
    const { character: updated, message } = applyCompanionCampfireDuty(character, 'silas');
    expect(updated.stats.fatigue).toBe(12);
    expect(message).toContain('Recovered an extra 10 Fatigue');
  });

  it('applies Sister Maren healing and divine SP restoration', () => {
    const character = { stats: { hp: 5, maxHp: 10, divineSP: 0, maxDivineSP: 3 }, progression: {} };
    const { character: updated, message } = applyCompanionCampfireDuty(character, 'sister_maren');
    expect(updated.stats.hp).toBe(8);
    expect(updated.stats.divineSP).toBe(1);
    expect(message).toContain('Recovered 3 HP and +1 Divine SP');
  });

  it('applies Cog-Tail clockwork tuning check bonus', () => {
    const character = { stats: { hp: 10 }, progression: {} };
    const { character: updated, message } = applyCompanionCampfireDuty(character, 'cog_tail');
    expect(updated.progression.campfireToolBonus).toEqual({
      skills: ['lockpicking', 'smithing', 'crafting'],
      bonus: 1,
    });
    expect(message).toContain('+1 bonus to your next Lockpicking or Crafting check');
  });
});
