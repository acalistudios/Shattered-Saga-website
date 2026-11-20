import { describe, expect, it } from 'vitest';
import {
  RECOVERY_CHANCE, ammoKindOf, ammoKindForWeapon, countAmmo, takeOneAmmo, addAmmo,
  recordSpent, spentTotal, rollRecovery,
} from './ammoRecovery';

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

  it('averages out near the expected rates', () => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const r = rollRecovery({ Arrows: { kind: 'arrow', hit: 5000, miss: 5000 } }, true, rand);
    expect(r.found / r.total).toBeGreaterThan(0.38);
    expect(r.found / r.total).toBeLessThan(0.45);
  });
});
