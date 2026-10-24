import { describe, it, expect } from 'vitest';
import { claimDepot, isAtDepot, settleConfiscatedOnCompletion, shouldConfiscateOnEntry } from './depotEngine';
import { SUPPLY_DEPOTS } from '../data/supplyDepot';

const depot = SUPPLY_DEPOTS.saltblood_mines;
const prisoner = () => ({
  inventory: [],
  confiscatedGear: ['Steel Sword', 'Iron Shield', 'Lockpicks'],
  progression: {},
});

describe('claimDepot', () => {
  it('returns all confiscated gear plus 6 ordinary and 1-2 good items on the first visit', () => {
    for (const r of [0, 0.49, 0.5, 0.99]) {
      const { character, recovered, found } = claimDepot(prisoner(), 'saltblood_mines', () => r);
      expect(recovered).toEqual(['Steel Sword', 'Iron Shield', 'Lockpicks']);
      const mundane = found.filter(i => depot.mundane.includes(i));
      const good = found.filter(i => depot.good.includes(i));
      expect(mundane).toHaveLength(6);
      expect(good.length).toBeGreaterThanOrEqual(1);
      expect(good.length).toBeLessThanOrEqual(2);
      expect(new Set(found).size).toBe(found.length); // no repeats
      expect(character.confiscatedGear).toEqual([]);
      expect(character.inventory).toHaveLength(3 + found.length);
    }
  });

  it('rolls both 1 and 2 good items across the die', () => {
    const counts = new Set([0.1, 0.9].map(r => claimDepot(prisoner(), 'saltblood_mines', () => r).found.filter(i => depot.good.includes(i)).length));
    expect([...counts].sort()).toEqual([1, 2]);
  });

  it('only stocks the extra loot once', () => {
    const first = claimDepot(prisoner(), 'saltblood_mines', () => 0.3).character;
    const emptied = { ...first, confiscatedGear: [] };
    const again = claimDepot(emptied, 'saltblood_mines', () => 0.3);
    expect(again.found).toEqual([]);
    // Nothing to do: the same object comes back, so the hook can skip a write.
    expect(again.character).toBe(emptied);
  });

  it('still returns gear on a later visit, without new loot', () => {
    const first = claimDepot(prisoner(), 'saltblood_mines', () => 0.3).character;
    const later = claimDepot({ ...first, confiscatedGear: ['Bedroll'] }, 'saltblood_mines', () => 0.3);
    expect(later.recovered).toEqual(['Bedroll']);
    expect(later.found).toEqual([]);
  });

  it('does nothing outside a depot adventure', () => {
    const c = prisoner();
    expect(claimDepot(c, 'ashveil_keep').character).toBe(c);
  });
});

describe('isAtDepot', () => {
  it('matches the depot room of that adventure only', () => {
    expect(isAtDepot('saltblood_mines', 'Supply Depot')).toBe(true);
    expect(isAtDepot('saltblood_mines', 'supply depot')).toBe(true);
    expect(isAtDepot('saltblood_mines', "Threx's Office")).toBe(false);
    expect(isAtDepot('ashveil_keep', 'Supply Depot')).toBe(false);
  });
});

describe('settleConfiscatedOnCompletion', () => {
  it('forfeits unrecovered gear under strict rules', () => {
    const { character, lost } = settleConfiscatedOnCompletion(prisoner(), false);
    expect(lost).toEqual(['Steel Sword', 'Iron Shield', 'Lockpicks']);
    expect(character.confiscatedGear).toEqual([]);
  });

  it('keeps it held at the depot when return visits may reclaim', () => {
    const c = prisoner();
    const { character, lost } = settleConfiscatedOnCompletion(c, true);
    expect(lost).toEqual([]);
    expect(character.confiscatedGear).toEqual(c.confiscatedGear);
  });
});

describe('shouldConfiscateOnEntry', () => {
  it('strips on the real adventure, never on a free-roam return', () => {
    expect(shouldConfiscateOnEntry({ stripEquipment: true }, false)).toBe(true);
    expect(shouldConfiscateOnEntry({ stripEquipment: true }, true)).toBe(false);
    expect(shouldConfiscateOnEntry({}, false)).toBe(false);
  });
});
