import { describe, expect, it } from 'vitest';
import {
  CONDITIONS, normalizeCondition, conditionMods, addCondition, tickEnemyConditions,
  cinderbreathDice, resolveCinderbreath, fireAffinityOf, MAX_GM_DURATION,
  stoneMantleRounds, tideMendDice, resolveTideMend,
} from './conditions';
import { getAttackPenalty } from './combatModifiers';
import { rollEnemyDefense } from './enemyDefense';

const fixed = (n) => () => n;

describe('combat conditions', () => {
  it('maps GM wording onto the six conditions and ignores story-only labels', () => {
    expect(normalizeCondition('Stunned')).toBe('stunned');
    expect(normalizeCondition('disoriented')).toBe('stunned');
    expect(normalizeCondition('on fire')).toBe('burning');
    expect(normalizeCondition('knocked_down')).toBe('prone');
    expect(normalizeCondition('terrified')).toBe('frightened');
    expect(normalizeCondition('stone_mantle')).toBe('stone_mantle');
    expect(normalizeCondition('inspired')).toBeNull();
  });

  it('sums effects once per condition and skips expired ones', () => {
    const m = conditionMods([
      { name: 'stunned', duration: 2 }, { name: 'dazed', duration: 1 }, // same condition twice
      { name: 'blinded', duration: 1 }, { name: 'prone', duration: 0 }, { name: 'inspired', duration: 3 },
    ]);
    expect(m.attack).toBe(-5);
    expect(m.defence).toBe(-4);
    expect(m.resist).toBe(-2);
    expect(m.labels).toEqual(['Stunned', 'Blinded']);
  });

  it('keeps every penalty small (no single condition beyond -3)', () => {
    for (const c of Object.values(CONDITIONS)) {
      for (const f of ['attack', 'defence', 'resist']) expect(c[f]).toBeGreaterThanOrEqual(-3);
    }
  });

  it('refreshes rather than stacks, and caps GM durations', () => {
    let list = addCondition([], 'stunned', 1);
    list = addCondition(list, 'dazed', 2);
    expect(list).toHaveLength(1);
    expect(list[0].duration).toBe(2);
    expect(addCondition([], 'blinded', 9, { cap: MAX_GM_DURATION })[0].duration).toBe(MAX_GM_DURATION);
    expect(addCondition([], 'inspired', 2)).toEqual([]);
  });

  it('burns an enemy each round, ticks conditions down and spares fresh ones', () => {
    const enemy = { name: 'Zealot', hp: 10, maxHp: 10, conditions: [
      { id: 'burning', duration: 2 }, { id: 'stunned', duration: 1 }, { id: 'blinded', duration: 2, fresh: true },
    ] };
    const t = tickEnemyConditions(enemy, fixed(3));
    expect(t.damage).toBe(3);
    expect(t.enemy.hp).toBe(7);
    expect(t.enemy.conditions).toEqual([
      { id: 'burning', duration: 1 },
      { id: 'blinded', duration: 2, fresh: false },
    ]);
    expect(t.notes.join(' ')).toMatch(/no longer stunned/);
    expect(tickEnemyConditions({ name: 'X', hp: 5 }).changed).toBe(false);
  });

  it('player conditions lower attack rolls through getAttackPenalty', () => {
    const character = { stats: { fatigue: 10, maxFatigue: 15, statuses: [{ name: 'blinded', duration: 2 }] }, inventory: [], equipment: {} };
    const pen = getAttackPenalty(character);
    expect(pen.total).toBe(-3);
    expect(pen.text).toMatch(/blinded -3/);
  });

  it('enemy conditions lower its defence roll', () => {
    const base = { name: 'Guard', defenses: { dodge: '2d6' } };
    const calm = rollEnemyDefense(base, 'none', fixed(7));
    const stunned = rollEnemyDefense({ ...base, conditions: [{ id: 'stunned', duration: 1 }] }, 'none', fixed(7));
    expect(stunned.roll).toBe(calm.roll - 2);
    expect(stunned.notes.join(' ')).toMatch(/stunned/);
  });
});

describe('Cinderbreath', () => {
  it('grows with level', () => {
    expect(cinderbreathDice(1)).toBe('2d6');
    expect(cinderbreathDice(5)).toBe('3d6');
    expect(cinderbreathDice(9)).toBe('4d6');
  });

  it('always hits an unshielded foe, past half its armour, and sets it burning', () => {
    const r = resolveCinderbreath({ level: 1, enemy: { name: 'Bandit', armorSoak: '1d4' }, roll: (e) => (e === '2d6' ? 8 : 3) });
    expect(r.soak).toBe(1);
    expect(r.net).toBe(7);
    expect(r.burns).toBe(true);
  });

  it('a shield block reduces the damage by the shield die but does not negate it', () => {
    const r = resolveCinderbreath({ level: 1, enemy: { name: 'Shield Guard', armorSoak: '1d3' }, blocked: true, shieldBlock: 3, roll: (e) => (e === '2d6' ? 8 : 2) });
    expect(r.net).toBe(4); // 8 - 1 (half armour) - 3 (shield)
    expect(r.burns).toBe(false);
  });

  it('spares creatures of fire and hurts creatures of ice more', () => {
    expect(fireAffinityOf({ name: 'Ember Maw' })).toBe('immune');
    expect(fireAffinityOf({ name: 'Frostbite Spider' })).toBe('vulnerable');
    expect(fireAffinityOf({ name: 'Kaelen-Ghar', desc: 'frostfire wraith' })).toBe('normal');
    const roll = (e) => (e === '2d6' ? 8 : 2);
    expect(resolveCinderbreath({ level: 1, enemy: { name: 'Ember Maw' }, roll }).net).toBe(0);
    expect(resolveCinderbreath({ level: 1, enemy: { name: 'Ember Maw' }, roll }).burns).toBe(false);
    expect(resolveCinderbreath({ level: 1, enemy: { name: 'Frost Wolf', armorSoak: '1d3' }, roll }).net).toBe(10);
  });
});

describe('Stone Mantle and Tide Mend', () => {
  it('Stone Mantle lasts longer with level', () => {
    expect(stoneMantleRounds(1)).toBe(3);
    expect(stoneMantleRounds(5)).toBe(4);
    expect(stoneMantleRounds(9)).toBe(5);
    expect(conditionMods(addCondition([], 'stone_mantle', stoneMantleRounds(5))).soak).toContain('1d6');
  });

  it('Tide Mend heals, staunches two tiers, and washes out burning and poison', () => {
    expect(tideMendDice(1)).toBe('1d6+2');
    expect(tideMendDice(5)).toBe('2d6+2');
    expect(tideMendDice(9)).toBe('3d6+2');
    const r = resolveTideMend({
      level: 1, hp: 3, maxHp: 12, bleedingTier: 3,
      statuses: [{ name: 'burning', duration: 2 }, { name: 'poisoned', duration: 3 }, { name: 'stunned', duration: 1 }],
      roll: () => 6,
    });
    expect(r).toMatchObject({ healed: 6, hp: 9, bleedingTier: 1, staunched: 2 });
    expect(r.cleansed).toEqual(['burning', 'poisoned']);
    expect(r.statuses.map(s => s.name)).toEqual(['stunned']);
    expect(resolveTideMend({ hp: 10, maxHp: 12, bleedingTier: 1, roll: () => 8 })).toMatchObject({ hp: 12, bleedingTier: 0, staunched: 1 });
  });
});
