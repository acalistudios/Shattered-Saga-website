import { describe, expect, it } from 'vitest';
import { bendLuckUses, bendLuckBonus, bendLuckLeft, armBendLuck, cancelBendLuck, spendArmedLuck, bendRoll, isLuckArmed } from './luck';
import { applyRewardRestRecovery } from './rewardEngine';
import { executeOpposedCheck } from './ai';

const lucky = (rank, progression = {}) => ({ skills: { luck: rank }, progression });

describe('Bend Luck', () => {
  it('follows the table: uses and bonus by rank', () => {
    const table = [1, 2, 3, 4, 5, 6].map(r => [bendLuckUses(r), bendLuckBonus(r)]);
    expect(table).toEqual([[1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3]]);
    expect(bendLuckUses(0)).toBe(0);
  });

  it('arms, cancels with a refund, spends, and recharges at rest', () => {
    const c = lucky(3);
    const armed = { ...c, progression: armBendLuck(c) };
    expect(isLuckArmed(armed)).toBe(true);
    expect(bendLuckLeft(armed)).toBe(1);
    expect(armBendLuck(armed)).toBeNull(); // already armed
    expect(bendLuckLeft({ ...c, progression: cancelBendLuck(armed.progression) })).toBe(2);
    const spent = { ...c, progression: spendArmedLuck(armed.progression) };
    expect(isLuckArmed(spent)).toBe(false);
    expect(bendLuckLeft(spent)).toBe(1);
    expect(armBendLuck(lucky(0))).toBeNull();
    expect(bendLuckLeft(applyRewardRestRecovery({ ...spent, progression: { ...spent.progression, bendLuckUsed: 2 } }))).toBe(2);
  });

  it('keeps the better of the two rolls, the second with its bonus', () => {
    expect(bendRoll(5, () => 7, 2)).toMatchObject({ dice: 9, gain: 4 });
    expect(bendRoll(12, () => 3, 1)).toMatchObject({ dice: 12, gain: 0 });
  });

  it('a bent skill check never comes out lower', () => {
    for (let i = 0; i < 200; i++) {
      const c = executeOpposedCheck({ skillName: 'Luck', primaryAttr: 'A', primaryScore: 2, secondaryAttr: 'W', secondaryScore: 2, skillRanks: 2, difficulty: 'moderate', bendLuckBonus: 1 });
      expect(c.luckGain).toBeGreaterThanOrEqual(0);
      expect(c.playerTotal).toBe(c.primaryRoll + c.secondaryRoll + c.skillRoll + c.luckGain);
      expect(c.text).toContain('Bend Luck');
    }
  });
});
