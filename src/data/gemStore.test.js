import { describe, it, expect } from 'vitest';
import { GEM_STORE_ITEMS, buyWithLocalGems } from './gemStore';
import { STORE_ITEMS } from '../../api-worker/src/store';
import { UNDEATH_CURE_ITEM, DIVINE_INTERVENTION_ITEMS, getCompletionGifts } from './resurrection';

describe('gem store (A4)', () => {
  it('shows exactly the prices the server charges', () => {
    const shown = Object.fromEntries(GEM_STORE_ITEMS.map(i => [i.id, { item: i.item, gems: i.gems }]));
    expect(shown).toEqual(STORE_ITEMS);
  });

  it('sells the cure and both divine-intervention items, by their engine names', () => {
    const names = GEM_STORE_ITEMS.map(i => i.item);
    expect(names).toContain(UNDEATH_CURE_ITEM);
    for (const name of Object.keys(DIVINE_INTERVENTION_ITEMS)) expect(names).toContain(name);
  });

  it('guests buy against their local balance and cannot go below zero', () => {
    expect(buyWithLocalGems('thread_of_returning', 7)).toEqual({ gems: 2, item: 'Thread of Returning' });
    expect(buyWithLocalGems('rite_of_quiet_return', 9)).toBeNull();
    expect(buyWithLocalGems('not_an_item', 99)).toBeNull();
  });

  it('gives one free Rite for finishing The Plague Bells of Merrin Abbey', () => {
    expect(getCompletionGifts('merrin_abbey_plague_bells')).toEqual([UNDEATH_CURE_ITEM]);
    expect(getCompletionGifts('ashveil_keep')).toEqual([]);
  });
});
