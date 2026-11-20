import { describe, expect, it } from 'vitest';
import {
  RECOVERY_CHANCE, ammoKindOf, ammoKindForWeapon, countAmmo, takeOneAmmo, addAmmo,
  recordSpent, spentTotal, rollRecovery,
  listThrowables, getThrownProfile, takeItemAt, returnItems, returnRecovered, thrownSpent,
} from './ammoRecovery';
import { resolveRest } from './restEngine';

describe('thrown weapons at rest', () => {
  it('are picked up even if the player never searched', () => {
    const character = { inventory: ['Rations (1)'], stats: { hp: 5, maxHp: 10, fatigue: 0, maxFatigue: 15, spentAmmo: { Javelin: { kind: 'thrown', hit: 1, miss: 1 }, Arrows: { kind: 'arrow', hit: 3, miss: 0 } } } };
    const rested = resolveRest(character).character;
    expect(rested.inventory).toEqual(['Javelin', 'Javelin']);
    expect(rested.stats.spentAmmo).toEqual({});
  });
});

describe('ammunition recovery', () => {
  it('tells arrows, bolts and thrown weapons apart', () => {
    expect(ammoKindOf('Arrows (20)')).toBe('arrow');
    expect(ammoKindOf('Crossbow Bolts (20)')).toBe('bolt');
    expect(ammoKindOf('Throwing Dagger')).toBe('thrown');
    expect(ammoKindOf('Longbow')).toBeNull();
    expect(ammoKindForWeapon('Heavy Crossbow')).toBe('bolt');
    expect(ammoKindForWeapon('Short Bow')).toBe('arrow');
  });

  it('a crossbow takes bolts, not arrows', () => {
    const inv = ['Arrows (5)', 'Crossbow Bolts (2)'];
    expect(countAmmo(inv, 'bolt')).toBe(2);
    const t = takeOneAmmo(inv, 'bolt');
    expect(t.name).toBe('Crossbow Bolts');
    expect(t.inventory).toEqual(['Arrows (5)', 'Crossbow Bolts (1)']);
    expect(takeOneAmmo(['Crossbow Bolts (1)'], 'bolt').inventory).toEqual([]);
    expect(takeOneAmmo(['Arrows (3)'], 'bolt').name).toBeNull();
  });

  it('puts recovered ammunition back on its stack', () => {
    expect(addAmmo(['Arrows (3)', 'Rations (2)'], 'Arrows', 4)).toEqual(['Arrows (7)', 'Rations (2)']);
    expect(addAmmo(['Rations (2)'], 'Crossbow Bolts', 2)).toEqual(['Rations (2)', 'Crossbow Bolts (2)']);
    expect(addAmmo(['Arrows (3)'], 'Arrows', 0)).toEqual(['Arrows (3)']);
  });

  it('remembers hits and misses per ammunition', () => {
    let s = recordSpent({}, 'Arrows', 'arrow', true);
    s = recordSpent(s, 'Arrows', 'arrow', false);
    s = recordSpent(s, 'Arrows', 'arrow', false);
    expect(s.Arrows).toEqual({ kind: 'arrow', hit: 1, miss: 2 });
    expect(spentTotal(s)).toBe(3);
  });

  it('uses the agreed chances: arrows 50/33, bolts 60/40, thrown always', () => {
    expect(RECOVERY_CHANCE.arrow).toEqual({ hit: 0.5, miss: 0.33 });
    expect(RECOVERY_CHANCE.bolt).toEqual({ hit: 0.6, miss: 0.4 });
    expect(RECOVERY_CHANCE.thrown).toEqual({ hit: 1, miss: 1 });
    // A roll of 0.45 recovers an arrow that hit but not one that missed.
    const r = rollRecovery({ Arrows: { kind: 'arrow', hit: 2, miss: 2 } }, true, () => 0.45);
    expect(r).toMatchObject({ found: 2, total: 4, recovered: { Arrows: 2 }, lost: { Arrows: 2 } });
  });

  it('a failed search halves the chances, but thrown weapons always come back', () => {
    // 0.3 is under 0.5 (hit) but not under 0.25 (hit, careless search).
    expect(rollRecovery({ Arrows: { kind: 'arrow', hit: 3, miss: 0 } }, false, () => 0.3).found).toBe(0);
    expect(rollRecovery({ Arrows: { kind: 'arrow', hit: 3, miss: 0 } }, true, () => 0.3).found).toBe(3);
    expect(rollRecovery({ 'Throwing Dagger': { kind: 'thrown', hit: 1, miss: 2 } }, false, () => 0.999).found).toBe(3);
  });

  it('throws only spares, made throwing weapons first', () => {
    const inv = ['Dagger', 'Dagger', 'Throwing Knife', 'Rations (2)', 'Longsword'];
    const eq = { hand_right: 'Dagger', hand_left: 'Longsword' };
    const list = listThrowables(inv, eq);
    expect(list.map(t => t.name)).toEqual(['Throwing Knife', 'Dagger']);
    expect(list[1].count).toBe(1); // one dagger is in hand
    expect(listThrowables(['Dagger'], { hand_right: 'Dagger' })).toEqual([]);
    expect(listThrowables(['Javelin (3)'], {})[0].count).toBe(3);
    expect(getThrownProfile('Javelin')).toMatchObject({ dice: '1d6+1', pierce: 1, made: true });
    expect(getThrownProfile('Throwing Axe')).toMatchObject({ dice: '1d8+1', hit: -1 });
    expect(getThrownProfile('Hatchet')).toMatchObject({ dice: '1d6', hit: -1, made: false });
    expect(getThrownProfile('Longsword')).toBeNull();
  });

  it('takes one thrown weapon and gives it back as an item', () => {
    expect(takeItemAt(['Javelin (3)', 'Dagger'], 0)).toEqual(['Javelin (2)', 'Dagger']);
    expect(takeItemAt(['Throwing Knife', 'Dagger'], 0)).toEqual(['Dagger']);
    expect(returnItems(['Dagger'], 'Throwing Knife', 2)).toEqual(['Dagger', 'Throwing Knife', 'Throwing Knife']);
    expect(returnItems(['Javelin (1)'], 'Javelin', 2)).toEqual(['Javelin (3)']);
    const spent = { 'Throwing Knife': { kind: 'thrown', hit: 1, miss: 1 }, Arrows: { kind: 'arrow', hit: 1, miss: 0 } };
    expect(returnRecovered(['Arrows (4)'], spent, { 'Throwing Knife': 2, Arrows: 1 })).toEqual(['Arrows (5)', 'Throwing Knife', 'Throwing Knife']);
    expect(thrownSpent(spent)).toEqual({ 'Throwing Knife': 2 });
  });

  it('averages out near the expected rates', () => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const r = rollRecovery({ Arrows: { kind: 'arrow', hit: 5000, miss: 5000 } }, true, rand);
    expect(r.found / r.total).toBeGreaterThan(0.38);
    expect(r.found / r.total).toBeLessThan(0.45);
  });
});
