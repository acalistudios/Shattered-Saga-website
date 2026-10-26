import { describe, expect, it } from 'vitest';
import { getMapReadiness } from './mapReadiness';

describe('map recovery and patrol readiness', () => {
  it.each([0, -1, -5])('blocks exhausted patrols at %s fatigue', fatigue => {
    expect(getMapReadiness({ stats: { hp: 20, maxHp: 20, fatigue } }).canPatrol).toBe(false);
  });
  it.each([0, 1, 9])('blocks wounded patrols at %s HP without replacing zero with a default', hp => {
    expect(getMapReadiness({ stats: { hp, maxHp: 20, fatigue: 15 } }).canPatrol).toBe(false);
  });
  it('permits a fit character', () => {
    expect(getMapReadiness({ stats: { hp: 10, maxHp: 20, fatigue: 1 } }).canPatrol).toBe(true);
  });
});
