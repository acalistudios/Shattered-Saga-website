import { describe, it, expect } from 'vitest';
import {
  rollResurrectionAttributeChoices,
  applyResurrection,
  isUndead,
  getNpcReactionPenalty,
  getUndeadSocialPenalty,
  isGearTrailCold,
  getGearTrailHoursRemaining,
  recoverGear,
  abandonGearRecovery,
  cureUndeath,
  getAvailableResurrectionSites,
} from './resurrectionEngine';
import { getDivineInterventionItem, RESURRECTION_SITES } from '../data/resurrection';

const character = (over = {}) => ({
  attributes: {
    power: 3, coordination: 3, vigor: 3, willpower: 3,
    intellect: 3, charisma: 3, attunement: 3, empathy: 3,
  },
  equipment: { hand_right: 'Champion Maul +2', head: "Saint Orra's Veil +3" },
  inventory: ['Rations (3)', 'Rope'],
  stats: { hp: -5, day: 2, hour: 4.0, bleedingTier: 2, deathCountdown: 0 },
  progression: {},
  ...over,
});

describe('attribute choices', () => {
  it('offers exactly two options', () => {
    expect(rollResurrectionAttributeChoices(character())).toHaveLength(2);
  });

  it('never offers the same attribute twice', () => {
    // Drawing without replacement must hold for every possible rng value.
    for (let i = 0; i < 200; i++) {
      const [a, b] = rollResurrectionAttributeChoices(character(), () => i / 200);
      expect(a).not.toBe(b);
    }
  });

  it('never offers an attribute already at the floor', () => {
    const c = character({
      attributes: {
        power: 1, coordination: 1, vigor: 1, willpower: 1,
        intellect: 4, charisma: 4, attunement: 1, empathy: 1,
      },
    });
    expect(rollResurrectionAttributeChoices(c).sort()).toEqual(['charisma', 'intellect']);
  });

  it('offers what remains when almost everything is spent', () => {
    const c = character({
      attributes: {
        power: 1, coordination: 1, vigor: 1, willpower: 1,
        intellect: 1, charisma: 1, attunement: 1, empathy: 2,
      },
    });
    expect(rollResurrectionAttributeChoices(c)).toEqual(['empathy']);
  });

  it('handles a character with nothing left to lose', () => {
    const c = character({
      attributes: {
        power: 1, coordination: 1, vigor: 1, willpower: 1,
        intellect: 1, charisma: 1, attunement: 1, empathy: 1,
      },
    });
    expect(rollResurrectionAttributeChoices(c)).toEqual([]);
  });
});

describe('applying resurrection', () => {
  const revived = () => applyResurrection(character(), {
    attributeId: 'vigor',
    site: RESURRECTION_SITES[0],
    adventureId: 'saltblood_mines',
    killerName: 'Threx',
    diedAtHours: 28,
  });

  it('drops the chosen attribute by one and leaves the rest alone', () => {
    const c = revived();
    expect(c.attributes.vigor).toBe(2);
    expect(c.attributes.power).toBe(3);
  });

  it('marks the character undead with a reaction penalty', () => {
    const c = revived();
    expect(isUndead(c)).toBe(true);
    expect(getNpcReactionPenalty(c)).toBe(1);
  });

  it('escalates the penalty on a second death but never lowers it', () => {
    const second = applyResurrection(revived(), { attributeId: 'power', site: RESURRECTION_SITES[0] });
    expect(second.progression.resurrectionCount).toBe(2);
    expect(getNpcReactionPenalty(second)).toBe(2);

    const third = applyResurrection(second, { attributeId: 'intellect', site: RESURRECTION_SITES[0] });
    expect(getNpcReactionPenalty(third)).toBe(2);
  });

  it('strips carried gear and records where it went', () => {
    const c = revived();
    expect(c.equipment).toEqual({});
    expect(c.inventory).toEqual([]);

    const pending = c.progression.pendingGearRecovery;
    expect(pending.mode).toBe('carrier');
    expect(pending.location).toBe("Threx's Office");
    expect(pending.items).toContain('Champion Maul +2');
    expect(pending.items).toContain('Rations (3)');
  });

  it('ends the death spiral rather than reviving into it', () => {
    const c = revived();
    expect(c.stats.hp).toBe(1);
    expect(c.stats.deathCountdown).toBeNull();
    expect(c.stats.bleedingTier).toBe(0);
  });

  it('tracks every attribute lost across deaths', () => {
    const second = applyResurrection(revived(), { attributeId: 'power', site: RESURRECTION_SITES[0] });
    expect(second.progression.lostAttributes).toEqual(['vigor', 'power']);
  });

  it('refuses to push an attribute below the floor', () => {
    const c = applyResurrection(character({ attributes: { ...character().attributes, vigor: 1 } }), {
      attributeId: 'vigor',
      site: RESURRECTION_SITES[0],
    });
    expect(c.attributes.vigor).toBe(1);
  });
});

describe('undead social penalty', () => {
  const risen = () => applyResurrection(character(), { attributeId: 'vigor', site: RESURRECTION_SITES[0] });

  it('applies to social skills only', () => {
    const c = risen();
    expect(getUndeadSocialPenalty(c, 'negotiation')).toBe(1);
    expect(getUndeadSocialPenalty(c, 'diplomacy')).toBe(1);
    expect(getUndeadSocialPenalty(c, 'lockpicking')).toBe(0);
    expect(getUndeadSocialPenalty(c, 'heavy_weapons')).toBe(0);
  });

  it('does not apply to the living', () => {
    expect(getUndeadSocialPenalty(character(), 'negotiation')).toBe(0);
  });
});

describe('gear trail decay', () => {
  const risen = () => applyResurrection(character(), {
    attributeId: 'vigor',
    site: RESURRECTION_SITES[0],
    adventureId: 'blackroot_hollow',
    killerName: 'Mother Silken',
    diedAtHours: 100,
  });

  it('stays warm right up to the deadline', () => {
    const c = risen();
    expect(isGearTrailCold(c, 150)).toBe(false);
    expect(getGearTrailHoursRemaining(c, 150)).toBe(22); // 100 + 72 cold, 150 now
  });

  it('goes cold once the window passes', () => {
    const c = risen();
    expect(isGearTrailCold(c, 172)).toBe(true);
    expect(getGearTrailHoursRemaining(c, 200)).toBe(0);
  });

  it('returns gear on a successful recovery and closes the hunt', () => {
    const c = recoverGear(risen());
    expect(c.inventory).toContain('Champion Maul +2');
    expect(c.progression.pendingGearRecovery).toBeNull();
  });

  it('drops the hunt when abandoned, without returning gear', () => {
    const c = abandonGearRecovery(risen());
    expect(c.inventory).toEqual([]);
    expect(c.progression.pendingGearRecovery).toBeNull();
  });

  it('is a no-op when nothing is pending', () => {
    const c = character();
    expect(abandonGearRecovery(c)).toBe(c);
    expect(isGearTrailCold(c, 999)).toBe(false);
  });
});

describe('curing undeath', () => {
  it('clears the condition and the social penalty', () => {
    const risen = applyResurrection(character(), { attributeId: 'vigor', site: RESURRECTION_SITES[0] });
    const cured = cureUndeath(risen);
    expect(isUndead(cured)).toBe(false);
    expect(getUndeadSocialPenalty(cured, 'negotiation')).toBe(0);
  });

  it('does not refund the lost attribute', () => {
    const risen = applyResurrection(character(), { attributeId: 'vigor', site: RESURRECTION_SITES[0] });
    expect(cureUndeath(risen).attributes.vigor).toBe(2);
  });
});

describe('resurrection sites', () => {
  it('always offers Ashveil, even before anything is completed', () => {
    expect(getAvailableResurrectionSites([])).toHaveLength(1);
    expect(getAvailableResurrectionSites([])[0].adventureId).toBe('ashveil_keep');
  });

  it('adds Merrin Abbey once it has been completed', () => {
    const sites = getAvailableResurrectionSites(['ashveil_keep', 'merrin_abbey_plague_bells']);
    expect(sites.map(s => s.adventureId)).toContain('merrin_abbey_plague_bells');
  });
});

describe('divine intervention items', () => {
  it('revives in place', () => {
    const item = getDivineInterventionItem('Breath of the Creator');
    expect(item.mode).toBe('revive_in_place');
    expect(item.reviveHp).toBe(1);
  });

  it('restarts the adventure', () => {
    expect(getDivineInterventionItem('Thread of Returning').mode).toBe('restart_adventure');
  });

  it('ignores ordinary items', () => {
    expect(getDivineInterventionItem('Rations (3)')).toBeNull();
  });
});
