import { describe, it, expect } from 'vitest';
import {
  recordDiscoveries, resolveLoanRemovals, returnLoan, settleLoansOnLeave, returnableLoans, settleMissingLoans,
  keptLoans, lateReturnTerms,
} from './discoveries';
import { ITEM_NOTES, LOANED_ITEMS } from '../data/itemObjectives';
import { ADVENTURES_LIST } from '../data/adventures';
import { merchantBuys, sellOfferCp, sellToMerchant, getAdventureMerchants } from './adventureTrade';

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
    const c = { ...withKeystone(), currency: { gp: 0 } };
    expect(sellToMerchant(c, ADV, vance, KEY)).toBe(c);
  });

  it('leaving with it: kept, standing drops, and the day is recorded', () => {
    const kept = settleLoansOnLeave(withKeystone(), ADV);
    expect(kept.progression.loans[KEY]).toMatchObject({ status: 'kept', keptOnDay: 3 });
    expect(standing(kept)).toBe(-20);
    expect(settleLoansOnLeave(kept, ADV)).toBe(kept);
    expect(keptLoans(kept, ADV)).toEqual([KEY]);
  });

  it('a late return refunds the penalty by how long it was kept, never more', () => {
    const kept = settleLoansOnLeave(withKeystone(), ADV);
    const on = (day) => ({ ...kept, stats: { day } });
    // Within a week: fully forgiven (back to 0, not the +5/+15 of a prompt return).
    const soon = returnLoan(on(10), KEY);
    expect(soon.progression.loans[KEY].status).toBe('lateReturn');
    expect(standing(soon)).toBe(0);
    expect(soon.storyEvents.at(-1)).toMatch(/children, not for your pack.*lets it go/);
    expect(keptLoans(soon, ADV)).toEqual([]);
    // Then a quarter less per further week, never below a quarter.
    expect(lateReturnTerms(on(11), KEY)).toMatchObject({ fraction: 0.75, amount: 15 });
    expect(lateReturnTerms(on(18), KEY)).toMatchObject({ fraction: 0.5, amount: 10 });
    expect(standing(returnLoan(on(200), KEY))).toBe(-15);
    expect(returnLoan(on(200), KEY).storyEvents.at(-1)).toMatch(/not fully forgiven/);
  });

  it('handing it over in the village square on a later visit counts as late', () => {
    const kept = settleLoansOnLeave(withKeystone(), ADV);
    const back = resolveLoanRemovals(kept, [KEY], 'Ashveil Village Square');
    expect(back.progression.loans[KEY].status).toBe('lateReturn');
    expect(standing(back)).toBe(0);
  });

  it('nothing happens to a loan that was already settled', () => {
    const used = resolveLoanRemovals(withKeystone(), [KEY], 'Prison Sub-Level');
    const again = settleLoansOnLeave({ ...used, inventory: [KEY] }, ADV);
    expect(again.progression.loans[KEY].status).toBe('used');
  });
});

describe('the other loans', () => {
  const ELIXIR = 'Water-Breathing Elixir';
  const SPIRE = 'sunken_spire';
  const spire = (inventory, bought = 0) => hero({
    inventory,
    progression: bought ? { adventureTrades: { [SPIRE]: { 'Naelia the Diver': { bought: { [ELIXIR]: bought } } } } } : {},
  });

  it("Bram's notebook: returned in the barracks, kept if you leave with it", () => {
    const c = recordDiscoveries(hero({ inventory: ["Bram's Notebook"] }), 'saltblood_mines');
    expect(c.progression.loans["Bram's Notebook"].status).toBe('active');
    const back = resolveLoanRemovals(c, ["Bram's Notebook"], 'Prisoner Barracks');
    expect(back.localEconomy.relationships['Old Bram']).toBe(10);
    expect(settleLoansOnLeave(c, 'saltblood_mines').localEconomy.relationships['Old Bram']).toBe(-15);
  });

  it("an elixir bought from a merchant is not a loan; one from Naelia is", () => {
    expect(recordDiscoveries(spire([ELIXIR], 1), SPIRE).progression.loans).toBeUndefined();
    const lent = recordDiscoveries(spire([ELIXIR, ELIXIR], 1), SPIRE);
    expect(lent.progression.loans[ELIXIR].status).toBe('active');
  });

  it('drinking the elixir (it leaves the pack) counts as using it', () => {
    const lent = recordDiscoveries(spire([ELIXIR, ELIXIR], 1), SPIRE);
    const drank = settleMissingLoans({ ...lent, inventory: [ELIXIR] }, SPIRE, 'Tidal Siphon Junction');
    expect(drank.progression.loans[ELIXIR].status).toBe('used');
    expect(drank.localEconomy.relationships['Naelia the Diver']).toBe(5);
    expect(settleMissingLoans(lent, SPIRE, 'Tidal Siphon Junction')).toBe(lent);
  });

  it('a dropped loan is not settled', () => {
    const lent = recordDiscoveries(spire([ELIXIR]), SPIRE);
    expect(settleMissingLoans({ ...lent, inventory: [] }, SPIRE, 'Hall of Forgotten Runes', [ELIXIR]).progression.loans[ELIXIR].status).toBe('active');
  });

  it("Moon Gear Key: set into the lock away from Unit-7's lab is used", () => {
    const c = recordDiscoveries(hero({ inventory: ['Moon Gear Key'] }), 'clockwork_conservatory');
    const used = settleMissingLoans({ ...c, inventory: [] }, 'clockwork_conservatory', 'The Chronos Vault');
    expect(used.progression.loans['Moon Gear Key'].status).toBe('used');
    expect(used.localEconomy.relationships['Unit-7 (Nanny)']).toBe(10);
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
