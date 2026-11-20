// What shop items do when used (Hans 2026-11-20). Several were sold but did
// nothing in play: blade venoms and oils, scrolls, the major potion. Healing
// items stay in hooks/useGameState.js (sendPlayerAction).

import { fireAffinityOf } from './conditions';
import { rollDiceExpression } from './dice';

/** Weapon coatings: the next HITS melee hits each deal the extra die, past armour. */
export const COATINGS = {
  venom: { label: 'Venom', match: /venom vial|poison vial/i, die: '1d4', hits: 3, damageType: 'poison' },
  ember: { label: 'Ember Oil', match: /ember oil/i, die: '1d4', hits: 3, damageType: 'fire' },
};

export function getCoating(itemName) {
  const entry = Object.entries(COATINGS).find(([, c]) => c.match.test(itemName || ''));
  return entry ? { id: entry[0], ...entry[1] } : null;
}

// Venom needs blood: the undead, constructs, elementals and spirits shrug it off.
const BLOODLESS = /\b(undead|skeleton|zombie|wraith|ghost|spectr\w*|specter|ghoul|lich|golem|construct|clockwork|automaton|unit-\d|brass|elemental|spirit|shade|phantom|wisp)/i;

/**
 * Extra damage from the coating on a hit, or 0 when this foe is immune.
 * Returns { damage, note }.
 */
export function coatingDamage(coating, enemy, roll = rollDiceExpression) {
  if (!coating || !(coating.hits > 0)) return { damage: 0, note: '' };
  if (enemy?.mundaneImmunity === 'immune' && !enemy?.weakened) return { damage: 0, note: `${coating.label} has no effect on ${enemy.name}` };
  const text = [enemy?.name, enemy?.role, enemy?.desc].filter(Boolean).join(' ');
  if (coating.id === 'venom' && BLOODLESS.test(text)) return { damage: 0, note: `${enemy.name} has no blood for the venom to work on` };
  if (coating.id === 'ember' && fireAffinityOf(enemy) === 'immune') return { damage: 0, note: `${enemy.name} is a creature of fire: the oil does nothing` };
  const damage = roll(coating.die);
  return { damage, note: `${coating.label} +${damage} ${coating.damageType}` };
}

/** Scrolls: study one for a bonus to your next check in these skills. */
export const SCROLLS = [
  { match: /rare scroll/i, bonus: 4, skills: ['lore', 'languages', 'arcane_drawing', 'arcane_shaping'] },
  { match: /common scroll/i, bonus: 2, skills: ['lore', 'languages', 'arcane_drawing', 'arcane_shaping'] },
];

export function getScroll(itemName) {
  return SCROLLS.find((s) => s.match.test(itemName || '')) || null;
}

/** Items that are thrown in combat, never drunk or used from the pack. */
export const isThrowOnly = (itemName) => /acid flask|smoke bomb|gladiator net/i.test(itemName || '');

/** The Major Potion: 4d6+4 HP, stops bleeding, 3 SP to each pool. */
export const MAJOR_POTION = { heal: '4d6+4', sp: 3 };
export const isMajorPotion = (itemName) => /major potion|major elixir|greater healing/i.test(itemName || '');
