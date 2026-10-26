import { describe, it, expect } from 'vitest';
import {
  applyPatrolCosts, rollPatrolLoot, patrolGearRecovery, pendingPatrolEncounterFor,
  isConsumable, addLootToInventory, buildPatrolAdventure, patrolIdFor, isPatrolId,
  beginPatrol, markPatrolFought, normalizePatrolOutcome, rollPatrolOutcomeLoot, finishPatrol,
  PATROL_HOURS, PATROL_FATIGUE, PATROL_FOES, canBeginPatrol, getPatrolAllowance, patrolGoldCap,
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

describe('patrol as a played encounter', () => {
  const id = patrolIdFor('highway_bandit_ambush');

  it('builds an adventure-shaped scene with the leader as an NPC and nothing to hand over', () => {
    const adv = buildPatrolAdventure(id);
    expect(isPatrolId(adv.id)).toBe(true);
    expect(adv.isPatrol).toBe(true);
    expect(adv.region).toBe('region1');
    expect(adv.npcs[0].name).toBe('Highwayman Captain');
    expect(adv.npcs[0].stats.HP).toBeGreaterThan(0);
    expect(adv.items).toEqual([]);
    expect(adv.playabilityGuidance).toMatch(/Heavy Melee Charge/);
  });

  it('every authored encounter builds', () => {
    for (const e of TRAVEL_ENCOUNTERS) expect(buildPatrolAdventure(patrolIdFor(e.id)), e.id).toBeTruthy();
  });

  it('setting out spends fatigue but not time, and refills nothing', () => {
    const c = beginPatrol(traveller({ stats: { day: 3, hour: 10, fatigue: 9, maxFatigue: 15, hp: 12, maxHp: 20 } }), 'highway_bandit_ambush');
    expect(c.stats.fatigue).toBe(9 - PATROL_FATIGUE);
    expect(c.stats.hp).toBe(12);
    expect(c.stats.hour).toBe(10);
    expect(c.progression.activePatrol).toMatchObject({ encounterId: 'highway_bandit_ambush', regionId: 'region1', startedAtHours: 58, fought: false });
  });

  it('victory needs a fight', () => {
    expect(normalizePatrolOutcome('victory', { fought: false })).toBe('parley');
    expect(normalizePatrolOutcome('victory', { fought: true })).toBe('victory');
    expect(normalizePatrolOutcome('nonsense', { fought: true })).toBe('escaped');
  });

  it('escaping pays nothing; parley pays from the talking approach', () => {
    expect(rollPatrolOutcomeLoot('highway_bandit_ambush', 'escaped')).toEqual({ gold: 0, items: [], morality: 0 });
    const parley = TRAVEL_ENCOUNTERS[0].approaches.find(a => a.id === 'diplomatic_parley');
    expect(rollPatrolOutcomeLoot('highway_bandit_ambush', 'parley', () => 0.99).gold).toBe(Math.min(parley.rewards.gold, 2));
  });

  it('finishing tops the clock up to the patrol length, pays spoils and clears the patrol', () => {
    let c = beginPatrol(traveller({ currency: { gp: 5, gold: 5 }, morality: 0 }), 'highway_bandit_ambush');
    c = { ...c, stats: { ...c.stats, hour: 11 } }; // one hour of play
    const { character } = finishPatrol(markPatrolFought(c), { outcome: 'victory', loot: { gold: 15, items: ['Rations (1)'], morality: 1 } });
    expect(character.stats.hour).toBe(10 + PATROL_HOURS);
    expect(character.currency.gp).toBe(20);
    expect(character.inventory).toEqual(['Rations (3)']);
    expect(character.morality).toBe(1);
    expect(character.progression.activePatrol).toBeNull();
    expect(character.progression.lastPatrolResult.outcome).toBe('victory');
  });

  it('a long fight costs its real time, not less', () => {
    let c = beginPatrol(traveller(), 'highway_bandit_ambush');
    c = { ...c, stats: { ...c.stats, hour: 17 } };
    expect(finishPatrol(c, { outcome: 'escaped', loot: null }).character.stats.hour).toBe(17);
  });

  it('fleeing mid-fight hurts but never kills', () => {
    const started = beginPatrol(traveller(), 'highway_bandit_ambush');
    const c = { ...started, stats: { ...started.stats, hp: 3 } };
    expect(finishPatrol(c, { outcome: 'escaped', loot: null, pursuitDamage: 5 }).character.stats.hp).toBe(1);
  });

  it('beating the band that killed you wins your gear back; escaping does not', () => {
    const pending = { ...patrolGearRecovery({ encounterId: 'highway_bandit_ambush', regionId: 'region1', diedAtHours: 0 }), items: ['Iron Greatsword'] };
    const c = beginPatrol(traveller({ progression: { pendingGearRecovery: pending } }), 'highway_bandit_ambush');
    const won = finishPatrol(markPatrolFought(c), { outcome: 'victory', loot: null });
    expect(won.recovered).toEqual(['Iron Greatsword']);
    expect(won.character.inventory).toContain('Iron Greatsword');
    expect(won.character.progression.pendingGearRecovery).toBeNull();
    const fled = finishPatrol(c, { outcome: 'escaped', loot: null });
    expect(fled.character.progression.pendingGearRecovery).toBeTruthy();
  });

  it('cannot recover an expired trail or a trail from another region', () => {
    const pending = { ...patrolGearRecovery({ encounterId: 'highway_bandit_ambush', regionId: 'region1', diedAtHours: 0 }), items: ['Dagger'] };
    for (const p of [{ ...pending, coldAtHours: 62 }, { ...pending, patrolRegion: 'region2' }]) {
      const c = beginPatrol(traveller({ progression: { pendingGearRecovery: p } }), 'highway_bandit_ambush');
      expect(finishPatrol(c, { outcome: 'victory', loot: null }).recovered).toEqual([]);
    }
  });
});

describe('non-bankable patrol allowance', () => {
  const finish = c => finishPatrol(c, { outcome: 'escaped', loot: null }).character;
  it('allows one before the first adventure and persists exhaustion of the allowance', () => {
    const c = finish(beginPatrol(traveller(), 'highway_bandit_ambush'));
    const loaded = JSON.parse(JSON.stringify(c));
    expect(getPatrolAllowance(loaded).remaining).toBe(0);
    expect(canBeginPatrol(loaded)).toBe(false);
    expect(beginPatrol(loaded, 'highway_bandit_ambush')).toBe(loaded);
  });
  it('resets to two, never adds unused patrols, after distinct completed adventures', () => {
    let c = { ...traveller(), completed_adventures: ['ashveil_keep'] };
    expect(getPatrolAllowance(c).remaining).toBe(2);
    c = finish(beginPatrol(c, 'highway_bandit_ambush'));
    expect(getPatrolAllowance(c).remaining).toBe(1);
    c = { ...c, completed_adventures: ['ashveil_keep', 'saltblood_mines'] };
    expect(getPatrolAllowance(c).remaining).toBe(2);
    c = finish(beginPatrol(c, 'highway_bandit_ambush'));
    c = finish(beginPatrol(c, 'highway_bandit_ambush'));
    expect(getPatrolAllowance(c).remaining).toBe(0);
  });
  it('cannot stack starts or reset allowance by resting or changing regions', () => {
    const c = beginPatrol(traveller(), 'highway_bandit_ambush');
    expect(beginPatrol(c, 'harvest_vale_scavengers')).toBe(c);
    const rested = { ...finish(c), stats: { ...c.stats, fatigue: 15 } };
    expect(canBeginPatrol(rested)).toBe(false);
  });
  it('rejects invalid encounters and exhausted or wounded characters without costs', () => {
    for (const stats of [{ hp: 20, fatigue: 0 }, { hp: 1, fatigue: 15 }]) {
      const c = traveller({ stats: { maxHp: 20, ...stats } });
      expect(beginPatrol(c, 'highway_bandit_ambush')).toBe(c);
    }
    const c = traveller();
    expect(beginPatrol(c, 'missing')).toBe(c);
  });
  it('caps gold sharply at level one across every encounter and scales conservatively', () => {
    for (const e of TRAVEL_ENCOUNTERS) {
      for (const outcome of ['victory', 'parley']) {
        expect(rollPatrolOutcomeLoot(e.id, outcome, () => 0, 1).gold).toBeLessThanOrEqual(2);
      }
    }
    expect(patrolGoldCap(5)).toBe(10);
    expect(patrolGoldCap(20)).toBe(20);
  });
});
