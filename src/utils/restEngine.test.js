import { describe, expect, it } from 'vitest';
import { consumeRationFromInventory, resolveRest } from './restEngine';

const hero = (overrides = {}) => ({
  inventory: ['Rations (2)', 'Dagger'], daysWithoutFood: 2,
  stats: { day: 2, hour: 0, hp: 1, maxHp: 20, fatigue: 2, maxFatigue: 15,
    arcaneSP: 0, maxArcaneSP: 8, divineSP: 0, maxDivineSP: 4, elementalAbilityUsed: true },
  progression: { resurrectionCount: 1, npcReactionPenalty: -1,
    itemCooldowns: { bell: { reset: 'rest' }, bow: { reset: '8_hours', usedAtHours: 24 } },
    temporarySkillPenalties: { lore: -1 }, activeItemEffects: [{ type: 'ward' }] },
  ...overrides,
});

describe('deterministic manual rest', () => {
  it('consumes one ration and advances midnight correctly without changing HP or undeath', () => {
    const source = hero();
    const before = JSON.stringify(source);
    const { character, message } = resolveRest(source);
    expect(character.inventory).toEqual(['Rations (1)', 'Dagger']);
    expect(character.stats).toMatchObject({ day: 2, hour: 8, hp: 1, fatigue: 15, arcaneSP: 8, divineSP: 4, elementalAbilityUsed: false });
    expect(character.progression).toMatchObject({ resurrectionCount: 1, npcReactionPenalty: -1 });
    expect(character.daysWithoutFood).toBe(0);
    expect(message).toContain('consuming a ration');
    expect(JSON.stringify(source)).toBe(before);
    expect(resolveRest(source)).toEqual(resolveRest(source));
  });
  it('resets only rest cooldowns, retaining timed cooldown stamps', () => {
    const { character } = resolveRest(hero());
    expect(character.progression.itemCooldowns).toEqual({ bow: { reset: '8_hours', usedAtHours: 24 } });
    expect(character.progression.activeItemEffects).toEqual([]);
    expect(character.progression.temporarySkillPenalties).toEqual({});
  });
  it('without food advances time and hunger but grants no recovery', () => {
    const source = hero({ inventory: ['Dagger'] });
    const { character, message } = resolveRest(source);
    expect(character.stats).toMatchObject({ hour: 8, hp: 1, fatigue: 2, arcaneSP: 0, elementalAbilityUsed: true });
    expect(character.progression).toEqual(source.progression);
    expect(character.daysWithoutFood).toBe(3);
    expect(message).toContain('no rations');
  });
  it('crosses days and repeated rests each consume exactly one ration', () => {
    const source = hero(); source.stats.hour = 22;
    const once = resolveRest(source).character;
    const twice = resolveRest(once).character;
    expect(once.stats).toMatchObject({ day: 3, hour: 6 });
    expect(twice.stats).toMatchObject({ day: 3, hour: 14 });
    expect(twice.inventory).toEqual(['Dagger']);
  });
  it('does not recover from zero rations or consume multiple stacks', () => {
    expect(consumeRationFromInventory(['Rations (0)']).hasRations).toBe(false);
    expect(consumeRationFromInventory(['Rations (0)', 'Rations (3)', 'Rations (2)']).updatedInventory)
      .toEqual(['Rations (0)', 'Rations (2)', 'Rations (2)']);
  });
});
