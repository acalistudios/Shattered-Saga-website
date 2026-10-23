import { describe, it, expect } from 'vitest';
import { filterGmItemGrants, filterGmCurrencyChanges, isElementalUnlockAllowed } from './rewardPolicy';

const saltbloodItems = ["Threx's Ledger", "Threx's Sealed Letter", 'Flare Pouch', 'Raw Redvein Ore', "Bram's Notebook"];

describe('filterGmItemGrants', () => {
  it('allows items authored for the current adventure', () => {
    const r = filterGmItemGrants({ items: ["Threx's Ledger"], adventureItems: saltbloodItems });
    expect(r.allowed).toEqual(["Threx's Ledger"]);
    expect(r.blocked).toEqual([]);
  });

  it('blocks invented items — the playtest "Pack"', () => {
    const r = filterGmItemGrants({ items: ['Pack'], adventureItems: saltbloodItems });
    expect(r.allowed).toEqual([]);
    expect(r.blocked).toEqual(['Pack']);
  });

  it('blocks reward-table relics from another adventure', () => {
    const r = filterGmItemGrants({ items: ['Frostfire Glaive +3', 'Dawnbound Sickle +3'], adventureItems: saltbloodItems });
    expect(r.allowed).toEqual([]);
  });

  it('returns confiscated gear instead of minting a copy', () => {
    const r = filterGmItemGrants({ items: ['steel sword'], adventureItems: saltbloodItems, confiscatedGear: ['Steel Sword', 'Iron Shield'] });
    expect(r.allowed).toEqual(['Steel Sword']);
    expect(r.returned).toEqual(['Steel Sword']);
    expect(r.remainingConfiscated).toEqual(['Iron Shield']);
  });

  it('grants an authored item only once', () => {
    expect(filterGmItemGrants({ items: ["Threx's Ledger"], adventureItems: saltbloodItems, inventory: ["Threx's Ledger"] }).allowed).toEqual([]);
    expect(filterGmItemGrants({ items: ["Threx's Ledger", "Threx's Ledger"], adventureItems: saltbloodItems }).allowed).toHaveLength(1);
  });

  it('uses the authored spelling', () => {
    expect(filterGmItemGrants({ items: ["threx's ledger"], adventureItems: saltbloodItems }).allowed).toEqual(["Threx's Ledger"]);
  });
});

describe('filterGmCurrencyChanges', () => {
  it('keeps charges, drops grants', () => {
    const r = filterGmCurrencyChanges([{ amount: -5, unit: 'gp' }, { amount: 50, unit: 'gp' }, { amount: 0, unit: 'cp' }]);
    expect(r.allowed).toEqual([{ amount: -5, unit: 'gp' }]);
    expect(r.blocked).toHaveLength(2);
  });
});

describe('isElementalUnlockAllowed', () => {
  it('only in the Elemental Crucible, only for the character affinity', () => {
    expect(isElementalUnlockAllowed({ element: 'earth', characterElement: 'earth', activeAdventureId: 'elemental_crucible' })).toBe(true);
    expect(isElementalUnlockAllowed({ element: 'fire', characterElement: 'earth', activeAdventureId: 'elemental_crucible' })).toBe(false);
    expect(isElementalUnlockAllowed({ element: 'earth', characterElement: 'earth', activeAdventureId: 'saltblood_mines' })).toBe(false);
  });
});
