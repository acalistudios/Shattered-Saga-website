import { describe, expect, it } from 'vitest';
import { resolveThrow, isUnholy, isIncorporeal } from './throwing';
import { getThrownProfile, listThrowables, gatherRocks, MAX_ROCKS, returnItems } from './ammoRecovery';
import { cannotAttack } from './conditions';

const roll = (values) => (expr) => (expr in values ? values[expr] : 2);
const die = (n) => () => n;

const bandit = { name: 'Bandit', armorSoak: '1d3' };
const ghost = { name: 'Lord Aldric Voss', armorSoak: '1d3', mundaneImmunity: 'immune' };
const zombie = { name: 'Rotting Zombie', armorSoak: '1d3' };

describe('throwable items', () => {
  it('knows the throw-only items and their rules', () => {
    expect(getThrownProfile('Darts (10)')).toMatchObject({ dice: '1d3', hit: 0, quick: 2 });
    expect(getThrownProfile('Rocks (6)')).toMatchObject({ dice: '1d2', hit: -1, stack: true });
    expect(getThrownProfile('Acid Flask')).toMatchObject({ dice: '2d4', ignoresArmor: true, consumed: true });
    expect(getThrownProfile('Holy Water')).toMatchObject({ holy: true, consumed: true });
    expect(getThrownProfile("Mara's Smoke Bombs")).toMatchObject({ effect: 'smoke', consumed: true });
    expect(getThrownProfile('Gladiator Net')).toMatchObject({ effect: 'entangle', unblockable: true });
    expect(getThrownProfile('Fishing Net')).toBeNull(); // only the gladiator net
    expect(getThrownProfile('Bottle of Wine')).toBeNull();
    expect(getThrownProfile('Torch')).toBeNull();
  });

  it('defaults to a reusable weapon before flasks, smoke and nets', () => {
    const list = listThrowables(['Acid Flask', 'Gladiator Net', 'Rocks (3)', 'Throwing Knife'], {});
    expect(list.map(t => t.name)).toEqual(['Throwing Knife', 'Rocks', 'Acid Flask', 'Gladiator Net']);
  });

  it('rocks are picked up for free, up to the cap, and come back as a stack', () => {
    expect(gatherRocks(['Rations (2)'])).toEqual({ inventory: ['Rations (2)', `Rocks (${MAX_ROCKS})`], added: MAX_ROCKS });
    expect(gatherRocks(['Rocks (4)']).added).toBe(MAX_ROCKS - 4);
    expect(gatherRocks([`Rocks (${MAX_ROCKS})`]).added).toBe(0);
    expect(returnItems([], 'Rocks', 2)).toEqual(['Rocks (2)']);
    expect(returnItems(['Darts (3)'], 'Darts', 2)).toEqual(['Darts (5)']);
  });
});

describe('resolveThrow', () => {
  it('acid ignores armour; a rock does not', () => {
    const acid = resolveThrow({ profile: getThrownProfile('Acid Flask'), enemy: bandit, hit: true, roll: roll({ '2d4': 5, '1d3': 3 }), rollDie: die(1) });
    expect(acid).toMatchObject({ outcome: 'hit', soak: 0, damage: 5 });
    const rock = resolveThrow({ profile: getThrownProfile('Rocks (3)'), enemy: bandit, hit: true, roll: roll({ '1d2': 2, '1d3': 3 }), rollDie: die(1) });
    expect(rock.damage).toBe(1); // at least 1 on a hit
  });

  it('holy water burns the unholy, barely touches the living, and weakens the incorporeal', () => {
    const p = getThrownProfile('Holy Water');
    expect(resolveThrow({ profile: p, enemy: zombie, hit: true, roll: roll({ '2d6': 8 }), rollDie: die(1) }).damage).toBe(8);
    expect(resolveThrow({ profile: p, enemy: bandit, hit: true, roll: roll({ '2d6': 8 }), rollDie: die(1) }).damage).toBe(1);
    const g = resolveThrow({ profile: p, enemy: ghost, hit: true, roll: roll({ '2d6': 7 }), rollDie: die(1) });
    expect(g).toMatchObject({ damage: 7, weakens: true });
    expect(isUnholy(zombie)).toBe(true);
    expect(isUnholy(bandit)).toBe(false);
  });

  it('nothing but holy water affects an incorporeal foe', () => {
    for (const name of ['Rocks (3)', 'Darts (5)', 'Acid Flask', 'Gladiator Net', 'Javelin']) {
      const r = resolveThrow({ profile: getThrownProfile(name), enemy: ghost, hit: true, roll: roll({}), rollDie: die(4) });
      expect(r.outcome, name).toBe('no_effect');
      expect(r.damage).toBe(0);
      expect(r.entangleRounds).toBe(0);
    }
    expect(isIncorporeal({ ...ghost, weakened: true })).toBe(false);
  });

  it('the net does no damage and entangles for 0-3 rounds', () => {
    const p = getThrownProfile('Gladiator Net');
    expect(resolveThrow({ profile: p, enemy: bandit, hit: true, rollDie: die(4) })).toMatchObject({ damage: 0, entangleRounds: 3 });
    expect(resolveThrow({ profile: p, enemy: bandit, hit: true, rollDie: die(1) })).toMatchObject({ damage: 0, entangleRounds: 0 });
    expect(resolveThrow({ profile: p, enemy: bandit, hit: false, rollDie: die(4) }).entangleRounds).toBe(0);
    expect(cannotAttack([{ id: 'entangled', duration: 2 }])).toBe(true);
    expect(cannotAttack([{ id: 'entangled', duration: 0 }, { id: 'stunned', duration: 1 }])).toBe(false);
  });

  it('a shield that wins still lets part of a thrown weapon through', () => {
    const r = resolveThrow({ profile: getThrownProfile('Throwing Axe'), enemy: bandit, hit: false, blocked: true, blockDie: 6, roll: roll({ '1d8+1': 8, '1d3': 1 }), rollDie: die(3) });
    expect(r).toMatchObject({ outcome: 'blocked', damage: 4 });
  });
});
