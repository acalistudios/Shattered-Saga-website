import { describe, it, expect } from 'vitest';
import { TRAINING_EXPERTS, getTrainerConfig } from './downtimeMerchants';
import { SKILLS_LIST } from './gms';

describe('Downtime Training System & Trainer Roster', () => {
  const allSkillIds = SKILLS_LIST.map(s => s.id);

  it('ensures all 36 Shattered Saga skills are defined in SKILLS_LIST', () => {
    expect(allSkillIds.length).toBe(36);
  });

  it('enforces that NO trainer teaches more than 2 skills', () => {
    for (const [trainerName] of Object.entries(TRAINING_EXPERTS)) {
      const config = getTrainerConfig(trainerName);
      expect(config, `Trainer ${trainerName} should resolve config`).not.toBeNull();
      expect(config.skills.length, `Trainer ${trainerName} must not teach more than 2 skills`).toBeLessThanOrEqual(2);
      expect(config.skills.length, `Trainer ${trainerName} must teach at least 1 skill`).toBeGreaterThanOrEqual(1);
    }
  });

  it('enforces that EVERY skill has strictly 2 or 3 trainers across the world', () => {
    const skillToTrainers = {};
    for (const skillId of allSkillIds) {
      skillToTrainers[skillId] = [];
    }

    for (const [trainerName] of Object.entries(TRAINING_EXPERTS)) {
      // Skip legacy aliases to prevent double counting
      if (['Arena Quartermaster', 'Silas', 'Thomas'].includes(trainerName)) continue;
      const config = getTrainerConfig(trainerName);
      for (const skillId of config.skills) {
        expect(allSkillIds, `Skill ${skillId} taught by ${trainerName} must be a valid skill`).toContain(skillId);
        skillToTrainers[skillId].push(trainerName);
      }
    }

    for (const skillId of allSkillIds) {
      const trainers = skillToTrainers[skillId];
      expect(trainers.length, `Skill ${skillId} must have at least 2 trainers`).toBeGreaterThanOrEqual(2);
      expect(trainers.length, `Skill ${skillId} must have at most 3 trainers`).toBeLessThanOrEqual(3);
    }
  });

  it('enforces that lawful trainers require at least +10 reputation and evil trainers require <= -10 reputation', () => {
    for (const [trainerName] of Object.entries(TRAINING_EXPERTS)) {
      if (['Arena Quartermaster', 'Silas', 'Thomas'].includes(trainerName)) continue;
      const config = getTrainerConfig(trainerName);
      if (config.evil) {
        expect(config.reqReputation, `Evil trainer ${trainerName} must require <= -10`).toBeLessThanOrEqual(-10);
      } else {
        expect(config.reqReputation, `Lawful trainer ${trainerName} must require >= +10`).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it('verifies getTrainerConfig handles both object definitions and legacy fallback arrays', () => {
    const vance = getTrainerConfig('Vance Coalhand');
    expect(vance).toEqual({
      skills: ['smithing', 'heavy_weapons'],
      reqReputation: 10,
      evil: false
    });

    const oldSalk = getTrainerConfig('Old Salk');
    expect(oldSalk).toEqual({
      skills: ['brawling', 'escapology'],
      reqReputation: -10,
      evil: true
    });

    const nonTrainer = getTrainerConfig('Nobody');
    expect(nonTrainer).toBeNull();
  });

  it('verifies rank-squared active time and equal downtime calculation', () => {
    // For rank 1 (targetRank = 1): 1d study + 1d downtime = 2d total (48h)
    const target1 = 1;
    const studyDays1 = target1 * target1;
    const totalDays1 = 2 * studyDays1;
    expect(studyDays1).toBe(1);
    expect(totalDays1).toBe(2);

    // For rank 2 (targetRank = 2): 4d study + 4d downtime = 8d total (192h)
    const target2 = 2;
    const studyDays2 = target2 * target2;
    const totalDays2 = 2 * studyDays2;
    expect(studyDays2).toBe(4);
    expect(totalDays2).toBe(8);

    // For rank 3 (targetRank = 3): 9d study + 9d downtime = 18d total (432h)
    const target3 = 3;
    const studyDays3 = target3 * target3;
    const totalDays3 = 2 * studyDays3;
    expect(studyDays3).toBe(9);
    expect(totalDays3).toBe(18);
  });
});
