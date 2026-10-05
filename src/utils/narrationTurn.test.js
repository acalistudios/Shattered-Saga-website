import { describe, expect, it, vi } from 'vitest';
import { canDeferNarrationCosts, createPreparedNarrationTurn } from './narrationTurn';

describe('prepared narration retry', () => {
  it('reuses a failed action and accepts its outcome only once', async () => {
    const resolveEngineAction = vi.fn(() => ({ roll: 7, arrowCost: 1 }));
    const prepared = resolveEngineAction();
    const applyNarration = vi.fn();
    let requests = 0;
    const attempt = createPreparedNarrationTurn(async accept => {
      requests++;
      expect(prepared).toEqual({ roll: 7, arrowCost: 1 });
      if (requests === 1) return;
      accept(); applyNarration();
    });
    await attempt(); await attempt(); await attempt();
    expect(requests).toBe(2);
    expect(resolveEngineAction).toHaveBeenCalledTimes(1);
    expect(applyNarration).toHaveBeenCalledTimes(1);
  });
  it('coalesces concurrent retries into one request', async () => {
    const run = vi.fn(async accept => { await Promise.resolve(); accept(); });
    const attempt = createPreparedNarrationTurn(run);
    await Promise.all([attempt(), attempt(), attempt()]);
    expect(run).toHaveBeenCalledTimes(1);
  });
  it('permits retry after a rejected request but not after accepted parsing fails', async () => {
    let count = 0;
    const attempt = createPreparedNarrationTurn(async accept => {
      count++;
      if (count === 1) throw new Error('network failure');
      accept(); throw new Error('parse failure');
    });
    await expect(attempt()).rejects.toThrow('network failure');
    await expect(attempt()).rejects.toThrow('parse failure');
    await attempt();
    expect(count).toBe(2);
  });
  it('only defers simple healthy, noncombat narrative costs', () => {
    const stats = { hp: 10, bleedingTier: 0, deathCountdown: null, statuses: [] };
    expect(canDeferNarrationCosts(null, null, stats)).toBe(true);
    expect(canDeferNarrationCosts('marksmanship', null, stats)).toBe(false);
    expect(canDeferNarrationCosts(null, { hp: 10 }, stats)).toBe(false);
    expect(canDeferNarrationCosts(null, null, { ...stats, bleedingTier: 1 })).toBe(false);
    expect(canDeferNarrationCosts(null, null, { ...stats, deathCountdown: 3 })).toBe(false);
    expect(canDeferNarrationCosts(null, null, { ...stats, statuses: ['poisoned'] })).toBe(false);
  });
});
