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

/** The healing items in hooks/useGameState.js (sendPlayerAction), described. */
export const HEALING_TEXT = {
  bandage: 'Use: 1 HP and stops bleeding.',
  herbs: 'Use: heals your Vigor die + Healing ranks + 1d6 HP.',
  satchel: "Use: heals your Vigor die + Healing ranks + 2d6 HP, stops bleeding and clears conditions.",
  minor: 'Drink: heals 2d6+2 HP and stops bleeding.',
  holyWater: 'Drink: heals 1d6 HP, stops bleeding and clears conditions. Or throw it (Throw panel): 2d6 against undead, demons and spirits, and a hit weakens an incorporeal foe.',
};

/**
 * What using an item does, built from the numbers the game uses, or '' if
 * it has no use of its own. Shown in shops and the inventory
 * (data/gearStats.js describeGear), so a changed rule changes its text.
 */
export function describeItemUse(itemName) {
  const n = String(itemName || '').toLowerCase();
  if (!n) return '';
  const coating = getCoating(itemName);
  if (coating) {
    const immune = coating.id === 'venom' ? ' No effect on the undead, constructs or spirits.' : ' No effect on creatures of fire.';
    return `Use: coat the melee weapon in your hand. Your next ${coating.hits} melee hits each deal +${coating.die} ${coating.damageType} damage that armour does not stop.${immune}`;
  }
  const scroll = getScroll(itemName);
  if (scroll) return `Use: study it for +${scroll.bonus} on your next Lore, Languages or Arcane check. Used up.`;
  if (isMajorPotion(itemName)) return `Drink: heals ${MAJOR_POTION.heal} HP, stops bleeding, and restores ${MAJOR_POTION.sp} Arcane and ${MAJOR_POTION.sp} Divine SP.`;
  if (/minor potion|healing potion/.test(n)) return HEALING_TEXT.minor;
  if (/holy water/.test(n)) return HEALING_TEXT.holyWater;
  if (/bandage/.test(n)) return HEALING_TEXT.bandage;
  if (/healer's (kit|satchel)/.test(n)) return HEALING_TEXT.satchel;
  if (/healing herb|poultice/.test(n)) return HEALING_TEXT.herbs;
  if (/^crafting tools\b/.test(n)) return 'Carried: +1 to Crafting checks.';
  if (/^smithing tools\b/.test(n)) return 'Carried: +1 to Smithing checks; with Smithing 3, lets you forge plate armour yourself at a smith\'s forge.';
  if (/fine clothing|silk robes/.test(n)) return 'Carried: +1 to Negotiation, Deception and Performance checks.';
  if (/fire-resistant cloak/.test(n)) return 'Worn or carried: takes 2 off any fire damage.';
  if (/^(steel plate|iron ingot)s?\b/.test(n)) return 'Metal for plate armour: a smith (Forge tab) turns 4 Steel Plates or Iron Ingots into Forged Plate Armor.';
  return '';
}
