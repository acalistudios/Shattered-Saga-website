// Heavy armour is earned, not bought (Hans 2026-11-20). Shops sell nothing
// heavier than chainmail. Plate armour comes from:
// - Durn Ashjaw's Arena Plate, the Iron Colosseum's special reward;
// - a smith forging it from 4 pieces of metal: Steel Plates (stripped from
//   plate-armoured Inquisition knights on the road from level 7) or Iron
//   Ingots (sold by travelling merchants, sometimes found on late road bands).
//   A smith charges a fee; a character with Smithing 3 and smithing tools can
//   do the work at the smith's forge and pay only for the metal.
// Chainmail cannot be broken down into plates.

import { stackCount } from './ammoRecovery';

export const PLATE_RECIPE = {
  pieces: 4,
  smithFeeCp: 400,
  days: 2,
  selfSmithingRank: 3,
  result: 'Forged Plate Armor',
};

/** Who has a forge that can work plate: named smiths, or a smith/armourer role. */
export const FORGE_MERCHANTS = ['Vance Coalhand', 'Hask of Basalt Ridge', 'Savax the Locker-Keeper'];
export const isForgeMerchant = (merchant) =>
  FORGE_MERCHANTS.includes(merchant?.name) || /\b(black)?smith\b|armou?rer|weaponsmith/i.test(merchant?.role || '');

const PIECE = /^(steel plate|iron ingot)s?\b/i;
const SMITH_TOOLS = /smithing tools|masterwork tool kit/i;

/** Metal carried for plate armour: { plates, ingots, total }. */
export function countPlateMetal(inventory) {
  let plates = 0;
  let ingots = 0;
  for (const item of inventory || []) {
    if (typeof item !== 'string' || !PIECE.test(item)) continue;
    if (/steel plate/i.test(item)) plates += stackCount(item);
    else ingots += stackCount(item);
  }
  return { plates, ingots, total: plates + ingots };
}

/** Remove n pieces of metal, Steel Plates first. */
export function takePlateMetal(inventory, n) {
  let left = n;
  const out = [];
  const sorted = [...(inventory || [])].map((item, i) => ({ item, i }));
  const used = new Map();
  for (const kind of [/steel plate/i, /iron ingot/i]) {
    for (const { item, i } of sorted) {
      if (!left || typeof item !== 'string' || !PIECE.test(item) || !kind.test(item)) continue;
      const take = Math.min(left, stackCount(item));
      used.set(i, take);
      left -= take;
    }
  }
  sorted.forEach(({ item, i }) => {
    const take = used.get(i) || 0;
    if (!take) { out.push(item); return; }
    const remaining = stackCount(item) - take;
    if (remaining > 0) out.push(`${item.replace(/\s*\(\d+\)\s*$/, '')} (${remaining})`);
  });
  return out;
}

export const hasSmithingTools = (character) =>
  [...(character?.inventory || []), ...Object.values(character?.equipment || {})].some(i => typeof i === 'string' && SMITH_TOOLS.test(i));

/** Can this character forge the armour themselves (no fee)? */
export const canSelfForge = (character) =>
  (character?.skills?.smithing || 0) >= PLATE_RECIPE.selfSmithingRank && hasSmithingTools(character);

const walletCp = (c) => (c?.currency?.gp || 0) * 100 + (c?.currency?.sp || 0) * 10 + (c?.currency?.cp || 0);
const toCoins = (cp) => ({ gp: Math.floor(cp / 100), sp: Math.floor((cp % 100) / 10), cp: cp % 10 });

/**
 * Why forging is not possible right now, or null. `self` is true when the
 * character does the smithing work.
 */
export function forgeBlocker(character, { self = false } = {}) {
  const metal = countPlateMetal(character?.inventory);
  if (metal.total < PLATE_RECIPE.pieces) return `Plate armour needs ${PLATE_RECIPE.pieces} Steel Plates or Iron Ingots; you have ${metal.total}.`;
  if (self && !canSelfForge(character)) return `Forging it yourself needs Smithing ${PLATE_RECIPE.selfSmithingRank} and smithing tools.`;
  if (!self && walletCp(character) < PLATE_RECIPE.smithFeeCp) return `The smith's fee is ${PLATE_RECIPE.smithFeeCp / 100} gp.`;
  return null;
}

/**
 * Forge the armour: takes the metal (and the fee unless self), adds the
 * armour to the pack. Time passing is left to the caller. Returns the new
 * character, or the same one when blocked.
 */
export function forgePlateArmor(character, { self = false } = {}) {
  if (forgeBlocker(character, { self })) return character;
  const inventory = [...takePlateMetal(character.inventory, PLATE_RECIPE.pieces), PLATE_RECIPE.result];
  const coins = toCoins(walletCp(character) - PLATE_RECIPE.smithFeeCp);
  // `gold` mirrors gp for older saves (same as skill training).
  const currency = self ? character.currency : { ...(character.currency || {}), ...coins, gold: coins.gp };
  return { ...character, inventory, currency };
}
