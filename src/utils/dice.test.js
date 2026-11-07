import { describe, it, expect } from 'vitest';
import { rollDiceExpression } from './dice';
import { ARENA_BRACKETS } from './arenaEngine';

const max = () => 0.999999;
const min = () => 0;

describe('rollDiceExpression', () => {
  it('rolls plain dice and constants', () => {
    expect(rollDiceExpression('2d6+1', max)).toBe(13);
    expect(rollDiceExpression('2d6+1', min)).toBe(3);
    expect(rollDiceExpression('10')).toBe(10);
    expect(rollDiceExpression('')).toBe(0);
  });

  it('rolls authored NPC defenses, ignoring the attribute names', () => {
    // These used to roll 0 every time, so every player attack hit.
    expect(rollDiceExpression('Coordination d10 + Vigor d4+1', max)).toBe(15);
    expect(rollDiceExpression('Coordination d10 + Vigor d4+1', min)).toBe(3);
    expect(rollDiceExpression('Power d20 + Coordination d2+1 + 4d2', min)).toBe(7);
  });

  it('every arena champion has a rollable defense and a real attack skill', () => {
    for (const { opponent } of ARENA_BRACKETS) {
      expect(rollDiceExpression(opponent.stats.defenses.dodge, min)).toBeGreaterThan(0);
      expect(['Heavy Weapons', 'Light Weapons']).toContain(opponent.stats.attacks[0].skill);
    }
  });
});
