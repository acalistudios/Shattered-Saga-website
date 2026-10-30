import { describe, it, expect } from 'vitest';
import {
  ARENA_BRACKETS, ARENA_FATIGUE, ARENA_HOURS, ARENA_BOUTS_AFTER_ADVENTURE,
  arenaIdFor, isArenaId, buildArenaAdventure, isArenaUnlocked, isBracketOpen, arenaBlockReason,
  canEnterArena, beginArenaBout, markArenaFought, normalizeArenaOutcome, finishArenaBout,
  getArenaAllowance, getArenaRecord, describeArenaResult,
} from './arenaEngine';
import { getAdventureById } from '../data/adventureLookup';
import { getDifficultyScaling } from '../data/difficultyScaling';

const gladiator = (over = {}) => ({
  stats: { day: 10, hour: 9, hp: 30, maxHp: 30, fatigue: 20, maxFatigue: 20, level: 14 },
  currency: { gp: 100, gold: 100 },
  inventory: ['Rations (2)'],
  completed_adventures: ['ashveil_keep', 'iron_colosseum'],
  progression: {},
  ...over,
});

describe('Arena unlock and brackets (A16)', () => {
  it('opens only after Chains of the Iron Colosseum', () => {
    expect(isArenaUnlocked(gladiator())).toBe(true);
    expect(isArenaUnlocked(gladiator({ completed_adventures: ['ashveil_keep'] }))).toBe(false);
    expect(arenaBlockReason(gladiator({ completed_adventures: [] }), 'initiate')).toMatch(/Iron Colosseum/);
  });

  it('brackets escalate in fee, purse and opponent', () => {
    for (let i = 1; i < ARENA_BRACKETS.length; i++) {
      const [a, b] = [ARENA_BRACKETS[i - 1], ARENA_BRACKETS[i]];
      expect(b.feeGp).toBeGreaterThan(a.feeGp);
      expect(b.purseGp).toBeGreaterThan(a.purseGp);
      expect(b.opponent.stats.HP).toBeGreaterThan(a.opponent.stats.HP);
      expect(b.purseGp).toBeGreaterThan(b.feeGp);
    }
  });

  it('only the first bracket is open until you win', () => {
    expect(isBracketOpen(gladiator(), 'initiate')).toBe(true);
    expect(isBracketOpen(gladiator(), 'blooded')).toBe(false);
    const won = gladiator({ progression: { arena: { highestWon: 0 } } });
    expect(isBracketOpen(won, 'blooded')).toBe(true);
    expect(isBracketOpen(won, 'champions')).toBe(false);
  });

  it('is a playable synthetic adventure with a fixed-difficulty opponent', () => {
    const adv = getAdventureById(arenaIdFor('blooded'));
    expect(isArenaId(adv.id)).toBe(true);
    expect(adv.isArena).toBe(true);
    expect(adv.npcs[0].name).toBe('Marra Two-Spears');
    expect(adv.items).toEqual([]);
    // Brackets are fixed difficulties: a high-level gladiator does not inflate HP.
    expect(getDifficultyScaling(gladiator(), adv, adv.npcs[0]).hpMultiplier).toBe(1);
    expect(buildArenaAdventure('arena:nope')).toBeNull();
  });
});

describe('entering a bout', () => {
  it('charges the fee and fatigue and uses one bout of the allowance', () => {
    const c = beginArenaBout(gladiator(), 'initiate');
    expect(c.currency.gp).toBe(100 - ARENA_BRACKETS[0].feeGp);
    expect(c.stats.fatigue).toBe(20 - ARENA_FATIGUE);
    expect(c.progression.activeArena).toMatchObject({ bracketId: 'initiate', fought: false });
    expect(getArenaAllowance(c).remaining).toBe(ARENA_BOUTS_AFTER_ADVENTURE - 1);
  });

  it('refuses without the fee, while exhausted, mid-patrol, or out of bouts', () => {
    expect(arenaBlockReason(gladiator({ currency: { gp: 2 } }), 'initiate')).toMatch(/entry fee/);
    expect(canEnterArena(gladiator({ stats: { hp: 30, maxHp: 30, fatigue: 0 } }), 'initiate')).toBe(false);
    expect(canEnterArena(gladiator({ progression: { activePatrol: { encounterId: 'x' } } }), 'initiate')).toBe(false);
    const spent = gladiator({ progression: { arenaAllowance: { completions: 2, used: ARENA_BOUTS_AFTER_ADVENTURE } } });
    expect(arenaBlockReason(spent, 'initiate')).toMatch(/No bouts left/);
    const c = gladiator({ currency: { gp: 1 } });
    expect(beginArenaBout(c, 'initiate')).toBe(c);
  });

  it('the allowance resets when another adventure is completed, and does not bank', () => {
    const spent = gladiator({ progression: { arenaAllowance: { completions: 2, used: 2 } } });
    const after = { ...spent, completed_adventures: [...spent.completed_adventures, 'astral_sky'] };
    expect(getArenaAllowance(after).remaining).toBe(ARENA_BOUTS_AFTER_ADVENTURE);
  });
});

describe('ending a bout', () => {
  it('victory needs a real fight', () => {
    expect(normalizeArenaOutcome('victory', { fought: false })).toBe('defeat');
    expect(normalizeArenaOutcome('victory', { fought: true })).toBe('victory');
    expect(normalizeArenaOutcome('anything', { fought: true })).toBe('defeat');
  });

  it('a win pays the purse, records it and opens the next bracket', () => {
    let c = markArenaFought(beginArenaBout(gladiator(), 'initiate'));
    c = finishArenaBout(c, { outcome: 'victory' });
    expect(c.currency.gp).toBe(100 - 5 + 15);
    expect(getArenaRecord(c)).toEqual({ highestWon: 0, wins: 1, losses: 0 });
    expect(isBracketOpen(c, 'blooded')).toBe(true);
    expect(c.progression.activeArena).toBeNull();
    expect(describeArenaResult(c, c.progression.lastArenaResult)).toMatch(/The Blooded is now open/);
  });

  it('a loss is never fatal: back on your feet at 1 HP, fee gone', () => {
    let c = beginArenaBout(gladiator(), 'initiate');
    c = { ...c, stats: { ...c.stats, hp: -3, bleedingTier: 2, deathCountdown: 3 } };
    c = finishArenaBout(c, { outcome: 'defeat' });
    expect(c.stats.hp).toBe(1);
    expect(c.stats.bleedingTier).toBe(0);
    expect(c.stats.deathCountdown).toBeNull();
    expect(c.currency.gp).toBe(95);
    expect(getArenaRecord(c).losses).toBe(1);
  });

  it('a bout takes at least ARENA_HOURS', () => {
    const c = finishArenaBout(beginArenaBout(gladiator(), 'initiate'), { outcome: 'defeat' });
    expect(c.stats.hour).toBe(9 + ARENA_HOURS);
  });
});
