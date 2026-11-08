import { describe, it, expect } from 'vitest';
import {
  completionPayoutGp, completionPayoutCp, treasureBudgetCp, treasureFindCp, patrolCoinCapCp,
  claimSearchFind, applySearchFind, isSearchAction, formatCoin, TREASURE_FINDS_PER_ADVENTURE,
} from './payouts';
import { ADVENTURE_REWARD_MODELS, getAdventureRewardModel } from './progressionRewards';
import { ADVENTURE_PROGRESSION_METADATA } from './adventureProgression';

describe('A8 payout formula', () => {
  it('P(n) = 8 gp x 1.15^(n-1), rounded to whole gp', () => {
    expect([1, 4, 6, 8, 10, 13, 14, 16, 18].map(completionPayoutGp))
      .toEqual([8, 12, 16, 21, 28, 43, 49, 65, 86]);
  });

  it('grows with every adventure and totals about 600 gp over the campaign', () => {
    for (let n = 2; n <= 18; n++) expect(completionPayoutGp(n)).toBeGreaterThan(completionPayoutGp(n - 1));
    const total = Array.from({ length: 18 }, (_, i) => completionPayoutGp(i + 1)).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(580);
    expect(total).toBeLessThan(630);
  });

  it('in-adventure coin is half the payout, in equal finds', () => {
    expect(treasureBudgetCp(1)).toBe(400);
    expect(treasureFindCp(1) * TREASURE_FINDS_PER_ADVENTURE).toBeLessThanOrEqual(400);
    expect(treasureFindCp(1)).toBe(133);
  });

  it('patrol coin is capped at a tenth of the next payout, at least 5 sp', () => {
    expect(patrolCoinCapCp(1)).toBe(80);
    expect(patrolCoinCapCp(0)).toBe(80);
    expect(patrolCoinCapCp(18)).toBe(860);
  });

  it('every reward model pays its campaign position', () => {
    for (const [id, model] of Object.entries(ADVENTURE_REWARD_MODELS)) {
      const order = ADVENTURE_PROGRESSION_METADATA[id]?.campaignOrder;
      expect(order, id).toBeTruthy();
      expect(model.guaranteedRewards.baseCurrencyCp).toBe(completionPayoutCp(order));
      expect(model.maxCurrencyBudgetCp).toBe(treasureBudgetCp(order));
    }
    expect(getAdventureRewardModel('ashveil_keep').guaranteedRewards.baseCurrencyCp).toBe(800);
  });

  it('formats coin', () => {
    expect(formatCoin(80)).toBe('8 sp');
    expect(formatCoin(133)).toBe('1 gp 3 sp 3 cp');
    expect(formatCoin(0)).toBe('0 cp');
  });
});

describe('found coin from searches (engine-paid)', () => {
  const hero = (over = {}) => ({ completed_adventures: [], progression: {}, currency: { gp: 5, sp: 0, cp: 0, gold: 5 }, ...over });
  const search = (over = {}) => ({
    adventureId: 'ashveil_keep', campaignOrder: 1, skillId: 'lockpicking', success: true,
    actionText: 'I pick the lock on the writing desk and search the drawers.', location: "Lord's Study", ...over,
  });

  it('a successful search pays a find and records the place', () => {
    const find = claimSearchFind(hero(), search());
    expect(find).toEqual({ amountCp: 133, count: 1, location: "lord's study" });
    const paid = applySearchFind(hero(), 'ashveil_keep', find);
    expect(paid.currency).toMatchObject({ gp: 6, sp: 3, cp: 3, gold: 6 });
    expect(paid.progression.treasureFinds.ashveil_keep).toBe(1);
    expect(paid.progression.treasureLocations.ashveil_keep).toEqual(["lord's study"]);
  });

  it('pays nothing for a failed check, a non-search skill or a non-search action', () => {
    expect(claimSearchFind(hero(), search({ success: false }))).toBeNull();
    expect(claimSearchFind(hero(), search({ skillId: 'athletics' }))).toBeNull();
    expect(claimSearchFind(hero(), search({ skillId: 'perception', actionText: 'I watch the goblins for an ambush.' }))).toBeNull();
    expect(isSearchAction('I rummage through the guard lockers')).toBe(true);
    expect(isSearchAction('I check for a false bottom')).toBe(true);
  });

  it('one find per place, three per adventure, none on replays or off-adventure', () => {
    const once = applySearchFind(hero(), 'ashveil_keep', claimSearchFind(hero(), search()));
    expect(claimSearchFind(once, search())).toBeNull();
    expect(claimSearchFind(once, search({ location: 'Chapel' }))).toMatchObject({ count: 2 });
    const full = hero({ progression: { treasureFinds: { ashveil_keep: TREASURE_FINDS_PER_ADVENTURE } } });
    expect(claimSearchFind(full, search({ location: 'Crypt' }))).toBeNull();
    expect(claimSearchFind(hero({ completed_adventures: ['ashveil_keep'] }), search())).toBeNull();
    expect(claimSearchFind(hero(), search({ adventureId: null }))).toBeNull();
    expect(claimSearchFind(hero(), search({ campaignOrder: undefined }))).toBeNull();
  });
});
