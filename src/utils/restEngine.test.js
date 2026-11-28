import { describe, expect, it } from 'vitest';
import { consumeRationFromInventory, resolveRest, isIndoorRestLocation } from './restEngine';

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
  it('consumes one ration, advances midnight correctly and heals a quarter of max HP', () => {
    const source = hero();
    const before = JSON.stringify(source);
    const { character, message } = resolveRest(source);
    expect(character.inventory).toEqual(['Rations (1)', 'Dagger']);
    expect(character.stats).toMatchObject({ day: 2, hour: 8, hp: 6, fatigue: 15, arcaneSP: 8, divineSP: 4, elementalAbilityUsed: false });
    expect(message).toContain('recover 5 HP');
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
  it('adds Healing ranks, caps at max HP, and does not heal the dying', () => {
    expect(resolveRest(hero({ skills: { healing: 3 } })).character.stats.hp).toBe(9);
    expect(resolveRest(hero({ stats: { ...hero().stats, hp: 18 } })).character.stats.hp).toBe(20);
    expect(resolveRest(hero({ stats: { ...hero().stats, hp: 0 } })).character.stats.hp).toBe(0);
  });
  it('without food advances time and hunger, heals nothing, and gives back half the fatigue', () => {
    const source = hero({ inventory: ['Dagger'] });
    const { character, message } = resolveRest(source);
    expect(character.stats).toMatchObject({ hour: 8, hp: 1, fatigue: 10, arcaneSP: 0, elementalAbilityUsed: true });
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
  it('grants bonus rest healing for Bedroll (+2) and Waterskin (+1) and distinguishes indoor locations', () => {
    const withGear = resolveRest(hero({ inventory: ['Rations (2)', 'Bedroll', 'Waterskin'] }));
    expect(withGear.character.stats.hp).toBe(9); // 1 + 5 (25% of 20) + 2 (Bedroll) + 1 (Waterskin)
    expect(isIndoorRestLocation('Great Hall')).toBe(true);
    expect(isIndoorRestLocation('Prison Sub-Level')).toBe(true);
    expect(isIndoorRestLocation('Ashveil Village Square')).toBe(false);
  });
});
