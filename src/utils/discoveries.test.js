import { describe, it, expect } from 'vitest';
import {
  recordDiscoveries, resolveLoanRemovals, returnLoan, settleLoansOnLeave, returnableLoans,
} from './discoveries';
import { ITEM_NOTES, LOANED_ITEMS } from '../data/itemObjectives';
import { ADVENTURES_LIST } from '../data/adventures';
import { merchantBuys, sellOfferCp, getAdventureMerchants } from './adventureTrade';

const KEY = "Vance's Blessed Iron Keystone";
const ADV = 'ashveil_keep';
const hero = (over = {}) => ({ stats: { day: 3 }, inventory: [], progression: {}, localEconomy: {}, storyEvents: [], ...over });
const standing = (c) => c.localEconomy.relationships?.['Vance Coalhand'] ?? 0;
const withKeystone = () => recordDiscoveries(hero({ inventory: [KEY] }), ADV);

describe('journal notes', () => {
  it('every authored item in every adventure has a note', () => {
    const missing = ADVENTURES_LIST.flatMap((a) => (a.items || []).filter((i) => !ITEM_NOTES[i]).map((i) => `${a.id}: ${i}`));
    expect(missing).toEqual([]);
  });

  it('records an item once, with its note, the first time it is in the pack', () => {
    const c = recordDiscoveries(hero({ inventory: ['Holy Water', 'Torch'] }), ADV);
    expect(c.progression.discoveries[ADV]).toEqual([{ item: 'Holy Water', note: ITEM_NOTES['Holy Water'], day: 3 }]);
    expect(recordDiscoveries(c, ADV)).toBe(c);
    const gone = { ...c, inventory: [] };
    expect(recordDiscoveries(gone, ADV)).toBe(gone);
  });
});

describe("Vance's keystone (a loan)", () => {
  it('starts as borrowed when obtained', () => {
    expect(withKeystone().progression.loans[KEY]).toMatchObject({ status: 'active', adventureId: ADV });
  });

  it('used in the seal: big standing gain', () => {
    const c = resolveLoanRemovals(withKeystone(), [KEY], 'Prison Sub-Level');
    expect(c.progression.loans[KEY].status).toBe('used');
    expect(standing(c)).toBe(LOANED_ITEMS[KEY].reputation.used);
    expect(c.storyEvents.at(-1)).toMatch(/seal/);
  });

  it('given up in the village square, or via Trade: returned', () => {
    const viaGm = resolveLoanRemovals(withKeystone(), [KEY], 'Ashveil Village Square');
    expect(viaGm.progression.loans[KEY].status).toBe('returned');
    const viaTrade = returnLoan(withKeystone(), KEY);
    expect(viaTrade.inventory).not.toContain(KEY);
    expect(standing(viaTrade)).toBe(LOANED_ITEMS[KEY].reputation.returned);
    expect(returnableLoans(withKeystone(), 'Vance Coalhand')).toEqual([KEY]);
    expect(returnableLoans(viaTrade, 'Vance Coalhand')).toEqual([]);
    const walkedIn = resolveLoanRemovals(withKeystone(), [KEY], ['Prison Sub-Level', 'Ashveil Village Square']);
    expect(walkedIn.progression.loans[KEY].status).toBe('returned');
  });

  it('cannot be sold to anyone', () => {
    const vance = getAdventureMerchants(ADV).find((m) => m.name === 'Vance Coalhand');
    expect(sellOfferCp(ADV, vance, KEY)).toBeNull();
  });

  it('leaving with it: kept, standing drops; returning later recovers some', () => {
    const kept = settleLoansOnLeave(withKeystone(), ADV);
    expect(kept.progression.loans[KEY].status).toBe('kept');
    expect(standing(kept)).toBe(-20);
    expect(settleLoansOnLeave(kept, ADV)).toBe(kept);
    const late = returnLoan(kept, KEY);
    expect(late.progression.loans[KEY].status).toBe('lateReturn');
    expect(standing(late)).toBe(-10);
  });

  it('nothing happens to a loan that was already settled', () => {
    const used = resolveLoanRemovals(withKeystone(), [KEY], 'Prison Sub-Level');
    const again = settleLoansOnLeave({ ...used, inventory: [KEY] }, ADV);
    expect(again.progression.loans[KEY].status).toBe('used');
  });
});

describe('treasure', () => {
  it('jewellers and relic dealers buy treasure; others still do not', () => {
    const all = Object.keys({ ashveil_keep: 1, saltblood_mines: 1, iron_colosseum: 1 }).flatMap(getAdventureMerchants);
    const relicBuyer = all.find((m) => m.buys.includes('relics'));
    const provisioner = getAdventureMerchants(ADV).find((m) => m.name === 'Martha Greaves');
    expect(merchantBuys(relicBuyer, 'treasure')).toBe(true);
    expect(merchantBuys(provisioner, 'treasure')).toBe(false);
    expect(sellOfferCp(ADV, relicBuyer, 'Silver Mirror')).toBe(150);
  });
});
