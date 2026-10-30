// Starfall Bowstring (Hans, 2026-10-28, A7): it is INSTALLED on one bow,
// permanently. The strung bow's bonus is +3 plus half the bow's own
// enchantment, rounded up: a +0 bow becomes +3, +1 or +2 becomes +4, +3
// becomes +5. Carrying the string loose does nothing.
//
// The strung bow keeps its original name inside the new one, e.g.
// "Sky-Stalker Composite Bow +2 (Starfall-strung +4)", so its own traits,
// weight and value still resolve from the base name.
import { getRewardItemByName } from '../data/rewardItems';

export const STARFALL_BOWSTRING = 'Starfall Bowstring +3';
export const STARFALL_BASE_BONUS = 3;

const STRUNG_RE = /^(.*) \(Starfall-strung \+(\d+)\)$/;
const BOW_RE = /\b(bow|longbow|shortbow|composite bow)\b/i;

/** {baseName, bonus} for a strung bow, or null. */
export function parseStrungBow(itemName) {
  const m = String(itemName || '').match(STRUNG_RE);
  return m ? { baseName: m[1], bonus: Number(m[2]) } : null;
}

export const isStarfallBowstring = (itemName) =>
  String(itemName || '').toLowerCase() === STARFALL_BOWSTRING.toLowerCase();

/** A bow the string can go on: a bow, not already strung. */
export const canTakeBowstring = (itemName) =>
  BOW_RE.test(String(itemName || '')) && !parseStrungBow(itemName) && !isStarfallBowstring(itemName);

/** A bow's own enchantment: the reward table's bonus, else "+N" in its name. */
export function bowEnchantment(bowName) {
  const byName = String(bowName || '').match(/\+(\d+)\b/);
  return Math.max(byName ? Number(byName[1]) : 0, getRewardItemByName(bowName)?.bonus || 0);
}

export const strungBonus = (bowName) => STARFALL_BASE_BONUS + Math.ceil(bowEnchantment(bowName) / 2);

export const strungBowName = (bowName) => `${bowName} (Starfall-strung +${strungBonus(bowName)})`;

/**
 * Install the string on a bow the character carries. Consumes one bowstring
 * and renames the bow everywhere it appears (inventory and any equipped slot),
 * so it cannot be taken back off. Returns the character unchanged if the
 * install is not possible.
 */
export function installStarfallBowstring(character, bowName) {
  const inventory = [...(character?.inventory || [])];
  const stringIdx = inventory.findIndex(isStarfallBowstring);
  const bowIdx = inventory.indexOf(bowName);
  if (stringIdx === -1 || bowIdx === -1 || !canTakeBowstring(bowName)) return character;

  const strung = strungBowName(bowName);
  inventory[bowIdx] = strung;
  inventory.splice(inventory.findIndex(isStarfallBowstring), 1);

  const equipment = { ...(character.equipment || {}) };
  const slot = Object.keys(equipment).find(k => equipment[k] === bowName);
  if (slot) equipment[slot] = strung;

  return {
    ...character,
    inventory,
    equipment,
    storyEvents: [...(character.storyEvents || []), `Installed the ${STARFALL_BOWSTRING} on ${bowName}: now ${strung}.`],
  };
}
