import { describe, it, expect } from 'vitest';
import {
  completionPayoutGp, completionPayoutCp, treasureBudgetCp, treasureFindCp, patrolCoinCapCp,
  claimTreasureFind, formatCoin, TREASURE_FINDS_PER_ADVENTURE,
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

describe('treasure finds', () => {
  const hero = (over = {}) => ({ completed_adventures: [], progression: {}, ...over });

  it('pays the find amount and counts it', () => {
    expect(claimTreasureFind(hero(), 'ashveil_keep', 1)).toEqual({ amountCp: 133, count: 1 });
    const two = hero({ progression: { treasureFinds: { ashveil_keep: 2 } } });
    expect(claimTreasureFind(two, 'ashveil_keep', 1)).toEqual({ amountCp: 133, count: 3 });
  });

  it('stops after the last find, on replays, and without an adventure', () => {
    const full = hero({ progression: { treasureFinds: { ashveil_keep: TREASURE_FINDS_PER_ADVENTURE } } });
    expect(claimTreasureFind(full, 'ashveil_keep', 1)).toBeNull();
    expect(claimTreasureFind(hero({ completed_adventures: ['ashveil_keep'] }), 'ashveil_keep', 1)).toBeNull();
    expect(claimTreasureFind(hero(), null, 1)).toBeNull();
    expect(claimTreasureFind(hero(), 'patrol:x', undefined)).toBeNull();
  });
});
