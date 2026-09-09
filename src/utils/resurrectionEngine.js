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
import { resolveGearRecovery } from '../data/gearRecovery';

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
    equipment: {},
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
