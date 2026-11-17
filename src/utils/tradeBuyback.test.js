import { describe, it, expect } from 'vitest';
import { getAdventureMerchants, sellToMerchant, buyFromMerchant, merchantStock, undoTrade, undosPerVisit, sellOfferCp, shelfItemFor } from './adventureTrade';

const ADV = 'ashveil_keep';
const vance = getAdventureMerchants(ADV).find((m) => m.name === 'Vance Coalhand');
const base = (extra = {}) => ({
  inventory: ['Iron War Scythe', 'Iron War Scythe', 'Iron Shield', 'Rations (3)'],
  equipment: {},
  currency: { gp: 0, sp: 0, cp: 0 },
  stats: { day: 1 },
  progression: {},
  ...extra,
});
const coin = (c) => c.gp * 100 + c.sp * 10 + c.cp;

describe('selling to a merchant puts it on their shelf', () => {
  it('Vance buys the War Scythe and then sells it back at list value', () => {
    const offer = sellOfferCp(ADV, vance, 'Iron War Scythe');
    expect(offer).toBeGreaterThan(0);
    const sold = sellToMerchant(base(), ADV, vance, 'Iron War Scythe');
    expect(sold.inventory.filter((i) => i === 'Iron War Scythe')).toHaveLength(1);
    expect(coin(sold.currency)).toBe(offer);
    const shelf = merchantStock(sold, ADV, vance).find((e) => e.item === 'Iron War Scythe');
    expect(shelf).toMatchObject({ remaining: 1, soldByYou: 1, priceCp: 500 });

    const rich = { ...sold, currency: { gp: 10, sp: 0, cp: 0 } };
    const bought = buyFromMerchant(rich, ADV, vance, 'Iron War Scythe');
    expect(bought.inventory.filter((i) => i === 'Iron War Scythe')).toHaveLength(2);
    expect(merchantStock(bought, ADV, vance).find((e) => e.item === 'Iron War Scythe').remaining).toBe(0);
  });
});

describe('undo', () => {
  it('grants one undo per 20 reputation', () => {
    expect(undosPerVisit(base(), vance)).toBe(0);
    expect(undosPerVisit(base({ localEconomy: { relationships: { 'Vance Coalhand': 19 } } }), vance)).toBe(0);
    expect(undosPerVisit(base({ localEconomy: { relationships: { 'Vance Coalhand': 45 } } }), vance)).toBe(2);
  });

  it('reverses a sale at its own price and takes it off the shelf', () => {
    const offer = sellOfferCp(ADV, vance, 'Iron Shield');
    const sold = sellToMerchant(base(), ADV, vance, 'Iron Shield');
    const undone = undoTrade(sold, ADV, vance, { action: 'sell', item: shelfItemFor('Iron Shield'), priceCp: offer });
    expect(undone.inventory).toContain('Iron Shield');
    expect(coin(undone.currency)).toBe(0);
    expect(merchantStock(undone, ADV, vance).find((e) => e.item === 'Iron Shield')).toBeUndefined();
  });

  it('reverses a purchase for a refund and restocks the merchant', () => {
    const rich = base({ currency: { gp: 5, sp: 0, cp: 0 } });
    const entry = merchantStock(rich, ADV, vance)[0];
    const bought = buyFromMerchant(rich, ADV, vance, entry.item);
    const undone = undoTrade(bought, ADV, vance, { action: 'buy', item: entry.item, priceCp: entry.priceCp });
    expect(coin(undone.currency)).toBe(500);
    expect(merchantStock(undone, ADV, vance)[0].remaining).toBe(entry.remaining);
  });

  it('refuses to undo a sale you can no longer afford', () => {
    const sold = sellToMerchant(base(), ADV, vance, 'Iron Shield');
    const broke = { ...sold, currency: { gp: 0, sp: 0, cp: 0 } };
    expect(undoTrade(broke, ADV, vance, { action: 'sell', item: 'Iron Shield', priceCp: 50 })).toBe(broke);
  });
});
