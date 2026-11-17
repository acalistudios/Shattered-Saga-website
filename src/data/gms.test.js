import { describe, it, expect } from 'vitest';
import { GMS, getGm, DEFAULT_GM_ID, PREMIUM_TURN_COST } from './gms';

describe('Game Masters', () => {
  it('offers The Chronicler at 1 turn and The Loremaster at the premium cost', () => {
    expect(getGm('narrator')).toMatchObject({ name: 'The Chronicler', premium: false, turnCost: 1 });
    // Must match the Worker's PREMIUM_TURN_COST (ss-api src/turns.ts).
    expect(PREMIUM_TURN_COST).toBe(8);
    expect(getGm('loremaster')).toMatchObject({ name: 'The Loremaster', premium: true, turnCost: 8 });
  });

  it('resolves legacy, missing and unknown ids to the default GM', () => {
    for (const id of ['oracle', 'titan', 'ancient', null, undefined, 'nope']) {
      expect(getGm(id).id).toBe(DEFAULT_GM_ID);
    }
  });

  it('gives every GM what the picker shows', () => {
    for (const gm of GMS) {
      expect(gm.avatar).toBeTruthy();
      expect(gm.tagline).toBeTruthy();
      expect(gm.strengths.length).toBeGreaterThan(0);
      expect(gm.theme.accentText).toBeTruthy();
    }
  });
});
