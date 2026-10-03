// Deterministic resurrection rules. Pure functions: pass a character in, get a
// new character back. The hook owns when these run; this module owns what they do.
import {
  RESURRECTION_ATTRIBUTES,
  ATTRIBUTE_FLOOR,
  UNDEAD_SOCIAL_SKILLS,
  NPC_REACTION_PENALTY_FIRST,
  NPC_REACTION_PENALTY_REPEAT,
  getAvailableResurrectionSites,
} from '../data/resurrection';
import { resolveGearRecovery, ADVENTURE_GEAR_RECOVERY } from '../data/gearRecovery';

/**
 * Offer two DIFFERENT attributes to lose. The player picks one.
 *
 * Attributes already at the floor are excluded, since dropping to 0 would break
 * every roll that reads them. If fewer than two remain eligible the character is
 * so worn down that we offer what is left rather than inventing a choice.
 */
export function rollResurrectionAttributeChoices(character, rng = Math.random) {
  const eligible = RESURRECTION_ATTRIBUTES.filter(
    id => (character?.attributes?.[id] ?? ATTRIBUTE_FLOOR) > ATTRIBUTE_FLOOR
  );
  if (eligible.length <= 2) return [...eligible];

  const pool = [...eligible];
  const picks = [];
  // Draw without replacement so the two options can never be the same.
  for (let i = 0; i < 2; i++) {
    const idx = Math.floor(rng() * pool.length) % pool.length;
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}

export const isUndead = (character) => !!character?.progression?.undead;

export const getNpcReactionPenalty = (character) =>
  Number(character?.progression?.npcReactionPenalty) || 0;

/** Social checks are harder for the risen; other skills are untouched. */
export function getUndeadSocialPenalty(character, skillId) {
  if (!isUndead(character) || !UNDEAD_SOCIAL_SKILLS.includes(skillId)) return 0;
  return getNpcReactionPenalty(character);
}

/**
 * Bring a dead character back.
 *
 * Applies every permanent cost at once: the chosen attribute loss, the undead
 * condition, the NPC reaction penalty, and the loss of carried gear. Where that
 * gear went is recorded so the player can go and take it back.
 */
export function applyResurrection(character, {
  attributeId,
  site,
  adventureId = null,
  killerName = '',
  diedAtHours = 0,
} = {}) {
  const prevCount = Number(character?.progression?.resurrectionCount) || 0;
  const nextCount = prevCount + 1;

  const attributes = { ...(character.attributes || {}) };
  if (attributeId && attributes[attributeId] > ATTRIBUTE_FLOOR) {
    attributes[attributeId] = attributes[attributeId] - 1;
  }

  // Repeat deaths mark the character more heavily, and the penalty never
  // shrinks — a second death cannot make you more welcome than a first.
  const penalty = nextCount > 1 ? NPC_REACTION_PENALTY_REPEAT : NPC_REACTION_PENALTY_FIRST;
  const npcReactionPenalty = Math.max(getNpcReactionPenalty(character), penalty);

  const recovery = adventureId ? resolveGearRecovery(adventureId, killerName) : null;
  const lostGear = [
    ...Object.values(character.equipment || {}).filter(Boolean),
    ...(character.inventory || []),
  ];

  return {
    ...character,
    attributes,
    // Explicit nulls survive schema hydration; an empty object restores default
    // equipment such as the starting backpack on the next load.
    equipment: Object.fromEntries(Object.keys(character.equipment || {}).map(slot => [slot, null])),
    inventory: [],
    stats: {
      ...character.stats,
      hp: 1,
      bleedingTier: 0,
      deathCountdown: null,
      defenseCount: 0,
    },
    progression: {
      ...character.progression,
      undead: true,
      resurrectionCount: nextCount,
      npcReactionPenalty,
      lostAttributes: [...(character.progression?.lostAttributes || []), attributeId].filter(Boolean),
      pendingGearRecovery: recovery
        ? {
            ...recovery,
            adventureId,
            items: lostGear,
            diedAtHours,
            coldAtHours: diedAtHours + recovery.coldAfterHours,
          }
        : null,
    },
    resurrectionSite: site?.name || null,
  };
}

/** Has the trail gone cold? Gear is unrecoverable past this point. */
export function isGearTrailCold(character, currentHours) {
  const pending = character?.progression?.pendingGearRecovery;
  if (!pending) return false;
  return currentHours >= pending.coldAtHours;
}

/** Hours left before the gear is lost for good; 0 once cold. */
export function getGearTrailHoursRemaining(character, currentHours) {
  const pending = character?.progression?.pendingGearRecovery;
  if (!pending) return null;
  return Math.max(0, pending.coldAtHours - currentHours);
}

/**
 * Trails do not sit still. Once the move window has passed, a carrier has walked
 * somewhere else and a cache has been dragged off — so the tracked location
 * shifts to another site in the same adventure and the clock restarts.
 */
export function maybeRelocateGear(character, currentHours, rng = Math.random) {
  const pending = character?.progression?.pendingGearRecovery;
  if (!pending || !pending.adventureId) return character;

  const lastMoved = pending.lastMovedAtHours ?? pending.diedAtHours ?? 0;
  if (currentHours - lastMoved < pending.movesAfterHours) return character;

  const entry = ADVENTURE_GEAR_RECOVERY[pending.adventureId];
  const pool = (entry?.locations || []).filter(l => l !== pending.location);
  if (pool.length === 0) return character;

  const next = pool[Math.floor(rng() * pool.length) % pool.length];
  return {
    ...character,
    progression: {
      ...character.progression,
      pendingGearRecovery: { ...pending, location: next, lastMovedAtHours: currentHours },
    },
  };
}

/**
 * Is the gear within reach right now?
 *
 * Two ways in, matching the design: put down the carrier, or reach the place the
 * gear is currently sitting — the carrier's quarters, or the cache itself.
 */
export function canRecoverGearHere(character, {
  currentLocation = null,
  defeatedEnemyName = '',
  currentAdventureId,
  currentHours,
} = {}) {
  const pending = character?.progression?.pendingGearRecovery;
  if (!pending) return false;
  // Names and room labels can recur in other adventures; neither is a valid
  // recovery trigger outside the adventure holding the gear or after expiry.
  if (currentAdventureId !== undefined && currentAdventureId !== pending.adventureId) return false;
  if (currentHours !== undefined && isGearTrailCold(character, currentHours)) return false;

  if (pending.carries && pending.killer && defeatedEnemyName) {
    const killerLower = pending.killer.toLowerCase();
    const foeLower = defeatedEnemyName.toLowerCase();
    if (foeLower.includes(killerLower) || killerLower.includes(foeLower)) return true;
  }

  if (currentLocation && pending.location) {
    if (currentLocation.toLowerCase() === pending.location.toLowerCase()) return true;
  }

  return false;
}

/**
 * Decide what, if anything, should happen to an open gear hunt right now.
 *
 * Pulled out of the hook so the decision is testable and, critically, provably
 * CONVERGENT: applying the returned action and re-resolving must yield 'none'.
 * The hook runs this from an effect that depends on `character` and then writes
 * to `character`, so a non-convergent rule here would be an infinite render loop.
 */
export function resolveGearTrailTick(character, {
  currentHours,
  currentLocation = null,
  defeatedEnemyName = '',
  currentAdventureId,
  rng = Math.random,
} = {}) {
  const pending = character?.progression?.pendingGearRecovery;
  if (!pending) return { type: 'none' };

  if (isGearTrailCold(character, currentHours)) {
    return { type: 'cold', items: pending.items || [] };
  }

  if (canRecoverGearHere(character, { currentLocation, defeatedEnemyName, currentAdventureId, currentHours })) {
    return {
      type: 'recover',
      items: pending.items || [],
      from: defeatedEnemyName || pending.location,
    };
  }

  const relocated = maybeRelocateGear(character, currentHours, rng);
  if (relocated !== character) {
    return {
      type: 'move',
      to: relocated.progression.pendingGearRecovery.location,
      lastMovedAtHours: relocated.progression.pendingGearRecovery.lastMovedAtHours,
    };
  }

  return { type: 'none' };
}

/** Apply a resolveGearTrailTick action to a character. Pure. */
export function applyGearTrailTick(character, action) {
  switch (action?.type) {
    case 'cold':
      return abandonGearRecovery(character);
    case 'recover':
      return recoverGear(character);
    case 'move': {
      const pending = character?.progression?.pendingGearRecovery;
      if (!pending) return character;
      return {
        ...character,
        progression: {
          ...character.progression,
          pendingGearRecovery: {
            ...pending,
            location: action.to,
            lastMovedAtHours: action.lastMovedAtHours,
          },
        },
      };
    }
    default:
      return character;
  }
}

/** Player reached the gear in time. Returns it and closes the recovery. */
export function recoverGear(character) {
  const pending = character?.progression?.pendingGearRecovery;
  if (!pending) return character;
  return {
    ...character,
    inventory: [...(character.inventory || []), ...(pending.items || [])],
    progression: { ...character.progression, pendingGearRecovery: null },
  };
}

/** Trail went cold. The gear is gone; drop the tracking. */
export function abandonGearRecovery(character) {
  if (!character?.progression?.pendingGearRecovery) return character;
  return {
    ...character,
    progression: { ...character.progression, pendingGearRecovery: null },
  };
}

/**
 * Lift the undead condition. Sold, not earned — the attribute loss is NOT
 * refunded, only the condition and the social penalty it carries.
 */
export function cureUndeath(character) {
  if (!isUndead(character)) return character;
  return {
    ...character,
    progression: { ...character.progression, undead: false, npcReactionPenalty: 0 },
  };
}

export { getAvailableResurrectionSites };
