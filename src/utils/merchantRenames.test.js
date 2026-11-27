import { describe, expect, it } from 'vitest';
import { MERCHANT_RENAMES, renameMerchantKeys, renameAdventureTrades } from './merchantRenames';

describe('renamed merchants keep their saved standing and stock', () => {
  it('moves Brak to Breka', () => {
    const out = renameMerchantKeys({ relationships: { Brak: 25, Krag: 5 }, merchantStock: { Brak: ['x'] }, decay: {} });
    expect(out.relationships).toEqual({ Breka: 25, Krag: 5 });
    expect(out.merchantStock).toEqual({ Breka: ['x'] });
  });
  it('never overwrites a newer Breka entry', () => {
    expect(renameMerchantKeys({ relationships: { Brak: 25, Breka: 40 } }).relationships).toEqual({ Breka: 40 });
  });
  it('moves the 2026-11-27 renames', () => {
    const out = renameMerchantKeys({ relationships: { 'Neris Tidehand': 10, 'Theron Vell': 20, 'Mara Voss': 30 } });
    expect(out.relationships).toEqual({ 'Naelia the Diver': 10, 'Corwin Vell': 20, 'Kessa Voss': 30 });
  });
  it('moves saved trade logs inside each adventure', () => {
    const progression = { level: 2, adventureTrades: { sunken_spire: { 'Neris Tidehand': { bought: { Torch: 1 } } }, blackroot_hollow: { 'Etta Bramble': {} } } };
    const out = renameAdventureTrades(progression);
    expect(out.adventureTrades.sunken_spire).toEqual({ 'Naelia the Diver': { bought: { Torch: 1 } } });
    expect(out.adventureTrades.blackroot_hollow).toEqual({ 'Etta Bramble': {} });
    expect(out.level).toBe(2);
    expect(renameAdventureTrades({ level: 1 })).toEqual({ level: 1 });
  });
});

describe('no merchant uses a retired name', () => {
  it('every renamed merchant is gone from the data', async () => {
    const { ADVENTURE_ECONOMY_METADATA: ADVENTURE_ECONOMY } = await import('../data/adventureEconomy');
    const names = Object.values(ADVENTURE_ECONOMY).flatMap(e => (e.merchants || []).map(m => m.name));
    for (const old of Object.keys(MERCHANT_RENAMES)) expect(names, old).not.toContain(old);
  });
});
