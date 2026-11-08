import { describe, it, expect } from 'vitest';
import { GEM_STORE_ITEMS, buyWithLocalGems } from './gemStore';
import { UNDEATH_CURE_ITEM, DIVINE_INTERVENTION_ITEMS, getCompletionGifts } from './resurrection';

describe('gem store (A4)', () => {
  it('shows the prices the server charges', () => {
    // The server owns the real prices (private repo Shattered-Saga-api,
    // src/store.ts). Keep this table equal to its STORE_ITEMS.
    const shown = Object.fromEntries(GEM_STORE_ITEMS.map(i => [i.id, { item: i.item, gems: i.gems }]));
    expect(shown).toEqual({
      rite_of_quiet_return: { item: 'Rite of Quiet Return', gems: 6 },
      breath_of_the_creator: { item: 'Breath of the Creator', gems: 5 },
      thread_of_returning: { item: 'Thread of Returning', gems: 3 },
    });
  });

  it('sells the cure and both divine-intervention items, by their engine names', () => {
    const names = GEM_STORE_ITEMS.map(i => i.item);
    expect(names).toContain(UNDEATH_CURE_ITEM);
    for (const name of Object.keys(DIVINE_INTERVENTION_ITEMS)) expect(names).toContain(name);
  });

  it('guests buy against their local balance and cannot go below zero', () => {
    expect(buyWithLocalGems('thread_of_returning', 7)).toEqual({ gems: 4, item: 'Thread of Returning' });
    expect(buyWithLocalGems('rite_of_quiet_return', 5)).toBeNull();
    expect(buyWithLocalGems('not_an_item', 99)).toBeNull();
  });

  it('gives one free Rite for finishing The Plague Bells of Merrin Abbey', () => {
    expect(getCompletionGifts('merrin_abbey_plague_bells')).toEqual([UNDEATH_CURE_ITEM]);
    expect(getCompletionGifts('ashveil_keep')).toEqual([]);
  });
});
