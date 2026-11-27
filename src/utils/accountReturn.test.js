import { beforeEach, describe, expect, it } from 'vitest';
import storage from './storage';
import { consumeAccountReturn, safeBackScreen } from './accountReturn';

describe('account return keys', () => {
  beforeEach(() => {
    storage.remove('account_return_screen');
    storage.remove('account_return_section');
  });

  it('are read once, then cleared', () => {
    storage.set('account_return_screen', 'play');
    storage.set('account_return_section', 'store');
    expect(consumeAccountReturn()).toEqual({ screen: 'play', section: 'store' });
    expect(consumeAccountReturn()).toEqual({ screen: null, section: null });
  });
});

describe('Back from Account', () => {
  const hero = { name: 'Rowan', stats: { hp: 10 } };
  it('returns to play only with a loaded character and adventure', () => {
    expect(safeBackScreen('play', hero, 'ashveil_keep')).toBe('play');
    expect(safeBackScreen('play', hero, null)).toBe('adventure_selection');
    expect(safeBackScreen('play', {}, 'ashveil_keep')).toBe('splash');
    expect(safeBackScreen('play', { name: 'Rowan' }, 'ashveil_keep')).toBe('splash');
  });
  it('never opens the map without a character', () => {
    expect(safeBackScreen('adventure_selection', {}, null)).toBe('splash');
    expect(safeBackScreen('adventure_selection', hero, null)).toBe('adventure_selection');
  });
  it('leaves other screens alone', () => {
    expect(safeBackScreen('splash', {}, null)).toBe('splash');
    expect(safeBackScreen(undefined, {}, null)).toBe('splash');
  });
});

describe('local slots owned by another account', async () => {
  const { localSlotsOwnedByOtherAccount, setLocalSaveOwner, prepareLocalSlotsForGuest } = await import('./cloudSaves');
  it('flags only a different real account', () => {
    setLocalSaveOwner('user-a');
    expect(localSlotsOwnedByOtherAccount('user-a')).toBe(false);
    expect(localSlotsOwnedByOtherAccount('user-b')).toBe(true);
    expect(localSlotsOwnedByOtherAccount(null)).toBe(false);
    prepareLocalSlotsForGuest();
    expect(localSlotsOwnedByOtherAccount('user-b')).toBe(false);
  });
});
