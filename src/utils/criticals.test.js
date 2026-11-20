import { describe, expect, it } from 'vitest';
import { attackOutcome, critBonus, isFumble, foeFumbled, CRIT_BONUS, CRIT_MARGIN } from './criticals';
import { conditionMods } from './conditions';
import { resolveThrow } from './throwing';
import { getThrownProfile } from './ammoRecovery';

describe('critical hits and fumbles', () => {
  it('triggers at a margin of 8 either way', () => {
    expect(CRIT_MARGIN).toBe(8);
    expect(attackOutcome(18, 10)).toBe('critical');
    expect(attackOutcome(17, 10)).toBeNull();
    expect(attackOutcome(10, 10)).toBeNull();
    expect(attackOutcome(3, 11)).toBe('fumble');
    expect(attackOutcome(4, 11)).toBeNull();
  });

  it('a critical adds a small, fixed bonus', () => {
    expect(CRIT_BONUS).toBe(3);
    expect(critBonus(20, 12)).toBe(3);
    expect(critBonus(19, 12)).toBe(0);
    expect(isFumble(2, 10)).toBe(true);
  });

  it('a foe that is out-defended by 8 has fumbled', () => {
    expect(foeFumbled(15, 7)).toBe(true);
    expect(foeFumbled(14, 7)).toBe(false);
  });

  it('Off Balance is -2 to defend', () => {
    expect(conditionMods([{ name: 'off_balance', duration: 1 }])).toMatchObject({ attack: 0, defence: -2 });
  });

  it('a critical throw adds the bonus to a clean hit only', () => {
    const p = getThrownProfile('Throwing Knife');
    const roll = (e) => (e === '1d4+1' ? 4 : 1);
    expect(resolveThrow({ profile: p, enemy: { name: 'Bandit', armorSoak: '1d3' }, hit: true, critical: 3, roll, rollDie: () => 1 }).damage).toBe(6);
    expect(resolveThrow({ profile: p, enemy: { name: 'Bandit', armorSoak: '1d3' }, hit: false, blocked: true, blockDie: 4, critical: 3, roll, rollDie: () => 1 }).damage).toBe(2);
  });
});
