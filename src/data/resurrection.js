// Death no longer ends a campaign. The character comes back changed, and the
// changes are permanent unless bought off.
//
// Engine owns all of this. The GM narrates the return and the way people treat
// the risen, but it does not decide whether the character is undead, what the
// penalty is, or where the lost gear went.

// Consecrated ground the risen can return to. Only sites the player has already
// unlocked are offered; Ashveil is adventure 1, so there is always at least one
// once the campaign has begun.
export const RESURRECTION_SITES = [
  {
    adventureId: 'ashveil_keep',
    name: 'Ashveil Chapel',
    location: 'Chapel',
    flavor: 'The Voss chapel still holds a thread of consecration, enough to call something back.',
  },
  {
    adventureId: 'merrin_abbey_plague_bells',
    name: 'Merrin Abbey',
    location: 'Bell Tower',
    flavor: 'The abbey bells have called the dying back before. They will do it again, at a price.',
  },
];

// Attributes eligible for the resurrection loss. An attribute already at 1 is
// never offered — a score of 0 would break every roll that depends on it.
export const RESURRECTION_ATTRIBUTES = [
  'power',
  'coordination',
  'vigor',
  'willpower',
  'intellect',
  'charisma',
  'attunement',
  'empathy',
];

export const ATTRIBUTE_FLOOR = 1;

// Social checks the risen suffer on. Intimidation is included per spec, though
// a visibly undead character arguably ought to intimidate better — flip it by
// removing it from this list if that reads better in play.
export const UNDEAD_SOCIAL_SKILLS = [
  'deception',
  'diplomacy',
  'intimidation',
  'leadership',
  'negotiation',
  'performance',
];

// Coming back once marks you. Coming back repeatedly marks you more.
export const NPC_REACTION_PENALTY_FIRST = 1;
export const NPC_REACTION_PENALTY_REPEAT = 2;

// The only way out of the undead condition, sold rather than earned.
export const UNDEATH_CURE_ITEM = 'Rite of Quiet Return';

// Premium "divine intervention" items, consumed at the moment of death to skip
// resurrection entirely. Purchased, never dropped by the reward tables.
export const DIVINE_INTERVENTION_ITEMS = {
  'Breath of the Creator': {
    id: 'divine_breath',
    mode: 'revive_in_place',
    reviveHp: 1,
    description: 'Revive where you fell with 1 HP. No resurrection penalties.',
  },
  'Thread of Returning': {
    id: 'divine_thread',
    mode: 'restart_adventure',
    description: 'Return to the start of the current adventure, whole. No resurrection penalties.',
  },
};

export const getDivineInterventionItem = (itemName) => {
  if (!itemName) return null;
  const lower = itemName.toLowerCase();
  const key = Object.keys(DIVINE_INTERVENTION_ITEMS).find(n => lower.includes(n.toLowerCase()));
  return key ? { name: key, ...DIVINE_INTERVENTION_ITEMS[key] } : null;
};

/** Sites the player can actually choose, given what they have completed. */
export const getAvailableResurrectionSites = (completedAdventures = []) => {
  const done = new Set(completedAdventures);
  // Ashveil is always available, including imported saves that completed Merrin
  // without Ashveil. Other sanctuaries still require their own completion.
  return RESURRECTION_SITES.filter(s => s.adventureId === 'ashveil_keep' || done.has(s.adventureId));
};
