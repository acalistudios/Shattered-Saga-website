import { describe, it, expect } from 'vitest';
import {
  merchantsAtLocation, merchantStock, buyFromMerchant, sellToMerchant, sellOfferCp, buyPriceCp,
  recordHaggle, haggleToday,
} from './adventureTrade';

const ADV = 'ashveil_keep';
const hero = (over = {}) => ({
  stats: { day: 1 },
  currency: { gp: 2, sp: 0, cp: 0, gold: 2 },
  inventory: ['Steel Shortsword', 'Dagger', 'Holy Water', 'Binding Prayer Scroll'],
  equipment: { hand_right: 'Steel Shortsword' },
  progression: {},
  ...over,
});
const [martha, vance] = merchantsAtLocation(ADV, 'Ashveil Village Square');

describe('who trades where', () => {
  it('finds the merchants in the current room only', () => {
    expect([martha.name, vance.name]).toEqual(['Martha Greaves', 'Vance Coalhand']);
    expect(merchantsAtLocation(ADV, 'ashveil village square ')).toHaveLength(2);
    expect(merchantsAtLocation(ADV, 'Great Hall')).toEqual([]);
    expect(merchantsAtLocation(ADV, '')).toEqual([]);
  });
});

describe('buying', () => {
  it('pays list price, adds the item and counts down stock for this run', () => {
    let c = buyFromMerchant(hero(), ADV, martha, 'Holy Water');
    expect(c.currency).toMatchObject({ gp: 1, sp: 0, cp: 0 });
    expect(c.inventory.filter((i) => i === 'Holy Water')).toHaveLength(2);
    c = buyFromMerchant(c, ADV, martha, 'Holy Water');
    expect(merchantStock(c, ADV, martha).find((s) => s.item === 'Holy Water').remaining).toBe(0);
    expect(buyFromMerchant(c, ADV, martha, 'Holy Water')).toBe(c);
  });

  it('refuses when the player cannot pay or the item is not sold here', () => {
    const poor = hero({ currency: { gp: 0, sp: 0, cp: 5, gold: 0 } });
    expect(buyFromMerchant(poor, ADV, vance, 'Shortsword')).toBe(poor);
    const h = hero();
    expect(buyFromMerchant(h, ADV, vance, 'Holy Water')).toBe(h);
  });
});

describe('selling', () => {
  it('pays half value for what the merchant buys, nothing for the rest', () => {
    expect(sellOfferCp(ADV, martha, 'Binding Prayer Scroll')).toBe(250);
    expect(sellOfferCp(ADV, martha, 'Dagger')).toBeNull();
    expect(sellOfferCp(ADV, vance, 'Dagger')).toBeGreaterThan(0);
  });

  it('will not buy an equipped item', () => {
    const c = hero();
    const equipped = Object.values(c.equipment);
    expect(sellOfferCp(ADV, vance, 'Steel Shortsword', 0, equipped)).toBeNull();
    expect(sellToMerchant(c, ADV, vance, 'Steel Shortsword', equipped)).toBe(c);
  });

  it('removes one copy and pays the offer', () => {
    const c = sellToMerchant(hero(), ADV, martha, 'Binding Prayer Scroll');
    expect(c.inventory).not.toContain('Binding Prayer Scroll');
    expect(c.currency).toMatchObject({ gp: 4, sp: 5, cp: 0 });
  });
});

describe('counted items', () => {
  it('sells one ration from a stack and merges bought rations into it', () => {
    const c = hero({ inventory: ['Rations (3)'] });
    expect(sellOfferCp(ADV, martha, 'Rations (3)')).toBeGreaterThan(0);
    const sold = sellToMerchant(c, ADV, martha, 'Rations (3)');
    expect(sold.inventory).toEqual(['Rations (2)']);
    const bought = buyFromMerchant(sold, ADV, martha, 'Rations (5)');
    expect(bought.inventory).toEqual(['Rations (7)']);
    const last = sellToMerchant(hero({ inventory: ['Rations (1)'] }), ADV, martha, 'Rations (1)');
    expect(last.inventory).toEqual([]);
  });
});

describe('haggling', () => {
  it('one Negotiation roll a day: 5% per point of margin, capped at 25%', () => {
    expect(haggleToday(hero(), ADV, martha)).toBeNull();
    const won = recordHaggle(hero(), ADV, martha, { success: true, margin: 3 });
    expect(haggleToday(won, ADV, martha)).toBeCloseTo(0.15);
    expect(haggleToday(recordHaggle(hero(), ADV, martha, { success: true, margin: 12 }), ADV, martha)).toBe(0.25);
    expect(haggleToday(recordHaggle(hero(), ADV, martha, { success: false, margin: -2 }), ADV, martha)).toBe(0);
    expect(haggleToday({ ...won, stats: { day: 2 } }, ADV, martha)).toBeNull();
  });

  it('improves both buying and selling, never past 75% on a sale', () => {
    expect(buyPriceCp({ priceCp: 100 }, 0.25)).toBe(75);
    expect(sellOfferCp(ADV, martha, 'Binding Prayer Scroll', 0.25)).toBe(313);
    const won = recordHaggle(hero(), ADV, martha, { success: true, margin: 5 });
    expect(buyFromMerchant(won, ADV, martha, 'Holy Water').currency).toMatchObject({ gp: 1, sp: 2, cp: 5 });
  });
});
