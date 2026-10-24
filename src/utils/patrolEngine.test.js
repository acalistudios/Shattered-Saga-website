import { describe, it, expect } from 'vitest';
import {
  applyPatrolCosts, rollPatrolLoot, resolvePatrolFailure, retreatPursuitDamage,
  patrolGearRecovery, pendingPatrolEncounterFor, isConsumable, addLootToInventory,
  PATROL_HOURS, PATROL_FATIGUE, PATROL_FOES,
} from './patrolEngine';
import { TRAVEL_ENCOUNTERS } from '../data/travelEncounters';

const traveller = (over = {}) => ({
  stats: { day: 3, hour: 10, fatigue: 15, maxFatigue: 15, hp: 20, maxHp: 20 },
  inventory: ['Rations (2)'],
  daysWithoutFood: 0,
  ...over,
});

describe('applyPatrolCosts', () => {
  it('costs hours and fatigue', () => {
    const c = applyPatrolCosts(traveller());
    expect(c.stats.hour).toBe(10 + PATROL_HOURS);
    expect(c.stats.fatigue).toBe(15 - PATROL_FATIGUE);
  });

  it('eats a ration when a patrol crosses midnight', () => {
    const c = applyPatrolCosts(traveller({ stats: { day: 3, hour: 22, fatigue: 15 } }));
    expect(c.stats.day).toBe(4);
    expect(c.inventory).toEqual(['Rations (1)']);
    expect(c.daysWithoutFood).toBe(0);
  });

  it('starves you when there is nothing to eat', () => {
    const c = applyPatrolCosts(traveller({ inventory: [], stats: { day: 3, hour: 22, fatigue: 15 } }));
    expect(c.daysWithoutFood).toBe(1);
  });

  it('makes back-to-back grinding drive fatigue negative', () => {
    let c = traveller();
    for (let i = 0; i < 6; i++) c = applyPatrolCosts(c);
    expect(c.stats.fatigue).toBeLessThan(0);
  });
});

describe('rollPatrolLoot', () => {
  const rewards = { gold: 20, morality: 1, items: ['Bandit Shortbow', 'Rations (2)'] };

  it('always pays gold and consumables', () => {
    const r = rollPatrolLoot(rewards, () => 0.99);
    expect(r.gold).toBe(20);
    expect(r.items).toEqual(['Rations (2)']);
  });

  it('only sometimes drops the gear', () => {
    expect(rollPatrolLoot(rewards, () => 0.1).items).toContain('Bandit Shortbow');
    expect(rollPatrolLoot(rewards, () => 0.9).items).not.toContain('Bandit Shortbow');
  });

  it('never drops more than one piece of gear', () => {
    const r = rollPatrolLoot({ items: ['Corsair Cutlass', 'Corsair Dagger', 'Phase-Tether Bow'] }, () => 0);
    expect(r.items).toHaveLength(1);
  });
});

describe('resolvePatrolFailure', () => {
  it('leaves you standing after an ordinary failure, even at low HP', () => {
    expect(resolvePatrolFailure({ hp: 3, damage: 5, margin: -2 })).toEqual({ hp: 1, died: false });
  });

  it('can kill on a bad failure', () => {
    expect(resolvePatrolFailure({ hp: 3, damage: 5, margin: -6 })).toEqual({ hp: -2, died: true });
  });

  it('a bad failure at healthy HP just hurts', () => {
    expect(resolvePatrolFailure({ hp: 20, damage: 5, margin: -8 })).toEqual({ hp: 15, died: false });
  });
});

describe('retreat', () => {
  it('a failed retreat costs about half the failure damage, at least 1', () => {
    expect(retreatPursuitDamage(5)).toBe(3);
    expect(retreatPursuitDamage(1)).toBe(1);
  });
});

describe('patrol gear recovery', () => {
  it('people carry your gear; beasts leave it where you fell', () => {
    expect(patrolGearRecovery({ encounterId: 'highway_bandit_ambush', regionId: 'region1', diedAtHours: 10 }).carries).toBe(true);
    expect(patrolGearRecovery({ encounterId: 'frostfire_glacier_ambush', regionId: 'region3', diedAtHours: 10 }).carries).toBe(false);
  });

  it('goes cold after 72 hours', () => {
    expect(patrolGearRecovery({ encounterId: 'highway_bandit_ambush', regionId: 'region1', diedAtHours: 10 }).coldAtHours).toBe(82);
  });

  it('sends the next patrol in that region back to the same foe', () => {
    const progression = { pendingGearRecovery: patrolGearRecovery({ encounterId: 'cinder_coast_corsairs', regionId: 'region4', diedAtHours: 0 }) };
    expect(pendingPatrolEncounterFor({ progression }, 'region4')).toBe('cinder_coast_corsairs');
    expect(pendingPatrolEncounterFor({ progression }, 'region1')).toBeNull();
  });

  it('every authored encounter has a foe', () => {
    for (const e of TRAVEL_ENCOUNTERS) expect(PATROL_FOES[e.id], e.id).toBeTruthy();
  });
});

describe('isConsumable', () => {
  it('sorts authored rewards', () => {
    expect(isConsumable('Rations (2)')).toBe(true);
    expect(isConsumable('Medicinal Herb Bundle')).toBe(true);
    expect(isConsumable('Corsair Cutlass')).toBe(false);
  });
});

describe('addLootToInventory', () => {
  it('folds counted loot into a matching stack', () => {
    expect(addLootToInventory(['Rations (3)', 'Iron Greatsword'], ['Rations (1)']))
      .toEqual(['Rations (4)', 'Iron Greatsword']);
  });
  it('appends uncounted items and new stacks', () => {
    expect(addLootToInventory(['Rations (3)'], ['Healing Herbs (2)', 'Steel Dagger']))
      .toEqual(['Rations (3)', 'Healing Herbs (2)', 'Steel Dagger']);
  });
});
