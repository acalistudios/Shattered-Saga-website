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
  maybeRelocateGear,
  canRecoverGearHere,
  resolveGearTrailTick,
  applyGearTrailTick,
  cureUndeath,
  getAvailableResurrectionSites,
} from './resurrectionEngine';
import { getDivineInterventionItem, RESURRECTION_SITES } from '../data/resurrection';
import { ADVENTURE_GEAR_RECOVERY, CARRIER_MOVE_HOURS } from '../data/gearRecovery';

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
    expect(Object.values(c.equipment).every(item => item === null)).toBe(true);
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

describe('trail relocation', () => {
  const risen = (over = {}) => applyResurrection(character(), {
    attributeId: 'vigor',
    site: RESURRECTION_SITES[0],
    adventureId: 'ashveil_keep',
    killerName: 'Skritt',
    diedAtHours: 100,
    ...over,
  });

  it('stays put inside the move window', () => {
    const c = risen();
    const before = c.progression.pendingGearRecovery.location;
    const after = maybeRelocateGear(c, 105, () => 0);
    expect(after.progression.pendingGearRecovery.location).toBe(before);
  });

  it('moves once the window passes, and restarts the clock', () => {
    const c = risen();
    const before = c.progression.pendingGearRecovery.location;
    const after = maybeRelocateGear(c, 100 + CARRIER_MOVE_HOURS, () => 0);

    expect(after.progression.pendingGearRecovery.location).not.toBe(before);
    expect(after.progression.pendingGearRecovery.lastMovedAtHours).toBe(100 + CARRIER_MOVE_HOURS);
  });

  it('only ever moves to a real location in the same adventure', () => {
    const valid = ADVENTURE_GEAR_RECOVERY.ashveil_keep.locations;
    for (let i = 0; i < 50; i++) {
      const moved = maybeRelocateGear(risen(), 200, () => i / 50);
      expect(valid).toContain(moved.progression.pendingGearRecovery.location);
    }
  });

  it('never relocates onto the location it is already at', () => {
    for (let i = 0; i < 50; i++) {
      const c = risen();
      const before = c.progression.pendingGearRecovery.location;
      const moved = maybeRelocateGear(c, 200, () => i / 50);
      expect(moved.progression.pendingGearRecovery.location).not.toBe(before);
    }
  });

  it('is a no-op when nothing is pending', () => {
    const c = character();
    expect(maybeRelocateGear(c, 999)).toBe(c);
  });

  it('keeps the recovered items across a move', () => {
    const moved = maybeRelocateGear(risen(), 200, () => 0);
    expect(moved.progression.pendingGearRecovery.items).toContain('Champion Maul +2');
  });
});

describe('reaching the gear', () => {
  const carrierCase = () => applyResurrection(character(), {
    attributeId: 'vigor', site: RESURRECTION_SITES[0],
    adventureId: 'saltblood_mines', killerName: 'Threx', diedAtHours: 0,
  });
  const cacheCase = () => applyResurrection(character(), {
    attributeId: 'vigor', site: RESURRECTION_SITES[0],
    adventureId: 'blackroot_hollow', killerName: 'Mother Silken', diedAtHours: 0,
  });

  it('recovers by killing the carrier, wherever that happens', () => {
    expect(canRecoverGearHere(carrierCase(), { defeatedEnemyName: 'Threx' })).toBe(true);
  });

  it('matches a carrier the GM names loosely', () => {
    expect(canRecoverGearHere(carrierCase(), { defeatedEnemyName: 'Threx, the Mine Boss' })).toBe(true);
  });

  it('recovers by reaching the carrier\'s quarters without a fight', () => {
    expect(canRecoverGearHere(carrierCase(), { currentLocation: "Threx's Office" })).toBe(true);
  });

  it('ignores killing some unrelated enemy', () => {
    expect(canRecoverGearHere(carrierCase(), { defeatedEnemyName: 'Saltblood Guard' })).toBe(false);
  });

  it('ignores being in the wrong room', () => {
    expect(canRecoverGearHere(carrierCase(), { currentLocation: 'Prisoner Barracks' })).toBe(false);
  });

  it('recovers a cache by reaching its site', () => {
    expect(canRecoverGearHere(cacheCase(), { currentLocation: 'Egg Nursery' })).toBe(true);
  });

  it('does not let a beast be "defeated into" giving gear back', () => {
    // Beasts do not carry, so killing one is not itself recovery — the player
    // still has to reach the nest.
    expect(canRecoverGearHere(cacheCase(), { defeatedEnemyName: 'Mother Silken' })).toBe(false);
  });

  it('is false when nothing is pending', () => {
    expect(canRecoverGearHere(character(), { currentLocation: 'Anywhere' })).toBe(false);
  });
});

describe('gear trail tick convergence', () => {
  // The hook runs resolveGearTrailTick from an effect that depends on the
  // character and then writes the character. If applying an action could ever
  // produce another action, that is an infinite render loop in the game.
  const settle = (c, opts) => {
    let cur = c;
    for (let i = 0; i < 10; i++) {
      const action = resolveGearTrailTick(cur, opts);
      if (action.type === 'none') return { character: cur, steps: i };
      cur = applyGearTrailTick(cur, action);
    }
    throw new Error('did not converge in 10 ticks');
  };

  const risen = (adventureId, killerName) => applyResurrection(character(), {
    attributeId: 'vigor', site: RESURRECTION_SITES[0],
    adventureId, killerName, diedAtHours: 0,
  });

  it('settles after a recovery', () => {
    const { character: c, steps } = settle(risen('saltblood_mines', 'Threx'), {
      currentHours: 1, currentLocation: "Threx's Office",
    });
    expect(steps).toBe(1);
    expect(c.inventory).toContain('Champion Maul +2');
  });

  it('settles after the trail goes cold', () => {
    const { character: c, steps } = settle(risen('saltblood_mines', 'Threx'), { currentHours: 500 });
    expect(steps).toBe(1);
    expect(c.progression.pendingGearRecovery).toBeNull();
  });

  it('settles after a relocation instead of moving forever', () => {
    const { steps } = settle(risen('ashveil_keep', 'Skritt'), {
      currentHours: 20, currentLocation: 'Somewhere Else', rng: () => 0,
    });
    expect(steps).toBe(1);
  });

  it('does nothing at all when the trail is fresh and the player is elsewhere', () => {
    const { steps } = settle(risen('ashveil_keep', 'Skritt'), {
      currentHours: 1, currentLocation: 'Yew Graveyard',
    });
    expect(steps).toBe(0);
  });

  it('converges from any hour, for every adventure', () => {
    for (const id of Object.keys(ADVENTURE_GEAR_RECOVERY)) {
      for (const hour of [0, 5, 12, 13, 24, 25, 71, 72, 200]) {
        expect(() => settle(risen(id, 'Nobody In Particular'), { currentHours: hour, rng: () => 0.5 })).not.toThrow();
      }
    }
  });

  it('prefers recovery over letting the trail go cold on the same tick', () => {
    // Cold is checked first by design: past the deadline the gear is gone even
    // if the player is standing on it. Guard the ordering so it stays deliberate.
    const c = risen('saltblood_mines', 'Threx');
    const action = resolveGearTrailTick(c, { currentHours: 500, currentLocation: "Threx's Office" });
    expect(action.type).toBe('cold');
  });
});

describe('gear recovery encounter boundaries', () => {
  it('records stripped slots explicitly so reload does not grant default gear', () => {
    const c = applyResurrection(character({ equipment: { backpack: 'Small Backpack', hand_right: 'Champion Maul +2' } }), {
      attributeId: 'power', site: RESURRECTION_SITES[0], adventureId: 'saltblood_mines', killerName: 'Threx',
    });
    const hydratedEquipment = { backpack: 'Small Backpack', ...JSON.parse(JSON.stringify(c)).equipment };
    expect(hydratedEquipment.backpack).toBeNull();
    expect(c.progression.pendingGearRecovery.items).toContain('Small Backpack');
  });
  const risen = () => applyResurrection(character(), {
    attributeId: 'power', site: RESURRECTION_SITES[0],
    adventureId: 'saltblood_mines', killerName: 'Threx', diedAtHours: 28,
  });

  it('keeps the hunt open on arrival at the resurrection sanctuary', () => {
    const c = risen();
    expect(resolveGearTrailTick(c, {
      currentHours: 28, currentAdventureId: 'ashveil_keep', currentLocation: 'Chapel',
    }).type).toBe('none');
    expect(c.progression.pendingGearRecovery.items).toContain('Champion Maul +2');
  });

  it('ignores matching names and locations in a different adventure', () => {
    expect(canRecoverGearHere(risen(), {
      currentAdventureId: 'ashveil_keep', currentLocation: "Threx's Office",
      defeatedEnemyName: 'Threx', currentHours: 28,
    })).toBe(false);
  });

  it('recovers once by defeating the carrier in the original adventure', () => {
    const c = risen();
    const action = resolveGearTrailTick(c, {
      currentAdventureId: 'saltblood_mines', defeatedEnemyName: 'Threx, the mine boss', currentHours: 29,
    });
    expect(action.type).toBe('recover');
    const recovered = applyGearTrailTick(c, action);
    expect(recovered.inventory).toContain('Champion Maul +2');
    expect(resolveGearTrailTick(recovered, { currentHours: 29, defeatedEnemyName: 'Threx' }).type).toBe('none');
  });

  it('recovers by reaching the quarters in the original adventure', () => {
    expect(canRecoverGearHere(risen(), {
      currentAdventureId: 'saltblood_mines', currentLocation: "Threx's Office", currentHours: 29,
    })).toBe(true);
  });

  it('does not let a combat-end trigger bypass the 72-hour deadline', () => {
    expect(canRecoverGearHere(risen(), {
      currentAdventureId: 'saltblood_mines', defeatedEnemyName: 'Threx', currentHours: 100,
    })).toBe(false);
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
  it('keeps Ashveil available when only Merrin was completed', () => {
    expect(getAvailableResurrectionSites(['merrin_abbey_plague_bells']).map(s => s.adventureId))
      .toEqual(['ashveil_keep', 'merrin_abbey_plague_bells']);
  });
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
