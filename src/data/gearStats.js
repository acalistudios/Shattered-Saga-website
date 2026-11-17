// One table for what weapons, shields and armour do (Hans 2026-11-17).
//
// Combat (utils/rewardEngine.js, hooks/useGameState.js), shop prices
// (utils/items.js) and the item descriptions in the shop and inventory all read
// from here, so a stat shown to the player is the stat the dice use.
//
// Items are matched by keyword in their name, most specific first, so
// generated loot ("Iron War Scythe", "Rusted Shortsword") still gets real stats.
// Named reward weapons keep their own overrides in getRewardWeaponProfile.
//
// Skill rule: one-handed melee weapons use Light Weapons, two-handed ones
// Heavy Weapons, bows and crossbows Marksmanship.

export const WEAPON_TYPES = [
  { key: 'greatsword', match: ['greatsword'], label: 'Greatsword', dice: '2d6', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 500 },
  { key: 'greataxe', match: ['greataxe'], label: 'Greataxe', dice: '2d6', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 500 },
  { key: 'warhammer', match: ['warhammer', 'maul', 'sledge'], label: 'Warhammer', dice: '2d6', damageType: 'blunt', skill: 'heavy_weapons', hands: 2, valueCp: 500 },
  { key: 'polearm', match: ['scythe', 'glaive', 'halberd'], label: 'Polearm', dice: '1d10', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 500 },
  { key: 'staff', match: ['quarterstaff', 'staff'], label: 'Staff', dice: '1d6', damageType: 'blunt', skill: 'heavy_weapons', hands: 2, valueCp: 20 },
  { key: 'crossbow', match: ['crossbow'], label: 'Crossbow', dice: '1d8', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 500, ranged: true },
  { key: 'longbow', match: ['longbow'], label: 'Longbow', dice: '1d8', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 400, ranged: true },
  { key: 'bow', match: ['bow'], label: 'Bow', dice: '1d6', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 300, ranged: true },
  { key: 'dagger', match: ['dagger', 'knife', 'shiv'], label: 'Dagger', dice: '1d4', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'small', valueCp: 20 },
  { key: 'shortsword', match: ['shortsword', 'rapier', 'cutlass'], label: 'Shortsword', dice: '1d6', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 100 },
  { key: 'hatchet', match: ['hatchet', 'sickle'], label: 'Hatchet', dice: '1d6', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 50 },
  { key: 'club', match: ['club', 'cudgel'], label: 'Club', dice: '1d4', damageType: 'blunt', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 10 },
  { key: 'mace', match: ['mace', 'flail', 'hammer'], label: 'Mace', dice: '1d6', damageType: 'blunt', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 150 },
  { key: 'spear', match: ['spear'], label: 'Spear', dice: '1d6', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 100 },
  { key: 'axe', match: ['axe'], label: 'Axe', dice: '1d8', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 200 },
  { key: 'sword', match: ['longsword', 'sword', 'blade', 'sabre', 'saber'], label: 'Sword', dice: '1d8', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 200 },
  { key: 'torch', match: ['torch'], label: 'Torch', dice: '1d4', damageType: 'fire', skill: 'light_weapons', hands: 1, size: 'small', valueCp: 1 },
];

// Block: the soak die rolled when a Blocking defence succeeds.
export const SHIELD_TYPES = [
  { key: 'tower', match: ['tower', 'heavy', 'reinforced'], label: 'Heavy shield', blockDie: 8, valueCp: 500 },
  { key: 'light', match: ['buckler', 'targe'], label: 'Buckler', blockDie: 4, valueCp: 60 },
  { key: 'wooden', match: ['wood', 'hide', 'leather'], label: 'Wooden shield', blockDie: 4, valueCp: 100 },
  { key: 'metal', match: [], label: 'Shield', blockDie: 6, valueCp: 250 }, // iron, steel, unnamed
];

// Armour soak, and how each weight handles damage types (useGameState).
export const ARMOR_TYPES = {
  light: { label: 'Light armour', soak: '1d3', note: '-2 vs piercing' },
  medium: { label: 'Medium armour', soak: '1d4', note: '+2 vs piercing, -2 vs blunt' },
  heavy: { label: 'Heavy armour', soak: '1d6', note: '+2 vs edged, -2 vs blunt' },
};

const SKILL_LABELS = { light_weapons: 'Light Weapons', heavy_weapons: 'Heavy Weapons', marksmanship: 'Marksmanship', blocking: 'Blocking' };

const lowerOf = (name) => String(name || '').toLowerCase();
export const isShieldName = (name) => /shield|buckler|targe/i.test(name || '');

export function getArmorType(armorName) {
  if (!armorName) return 'none';
  const n = lowerOf(armorName);
  if (n.includes('heavy') || n.includes('plate') || n.includes('heavy duty apron')) return 'heavy';
  if (n.includes('medium') || n.includes('chainmail') || n.includes('chain') || n.includes('reinforced apron') || n.includes('ringmail')) return 'medium';
  return 'light';
}

export function getShieldType(shieldName) {
  const n = lowerOf(shieldName);
  return SHIELD_TYPES.find((t) => t.match.some((m) => n.includes(m))) || SHIELD_TYPES[SHIELD_TYPES.length - 1];
}

export function getShieldSoakDie(shieldName) {
  return shieldName ? getShieldType(shieldName).blockDie : 4;
}

/** The weapon type for a name, or null if the name isn't a weapon. */
export function getWeaponType(weaponName) {
  const n = lowerOf(weaponName);
  if (!n || isShieldName(n)) return null;
  return WEAPON_TYPES.find((t) => t.match.some((m) => n.includes(m))) || null;
}

const ARMOR_WORDS = /armou?r|mail|plate|robes|cuirass|brigandine|hauberk|chain shirt|chain coat|jerkin|gambeson|apron/i;
export const isArmorName = (name) => ARMOR_WORDS.test(name || '') && !isShieldName(name) && !/helm|greaves|gauntlet|sabaton|boots|gloves/i.test(name || '');

/** Base value for gear with no listed price, or null for non-gear. */
export function gearValue(itemName) {
  if (isShieldName(itemName)) return { valueCp: getShieldType(itemName).valueCp, category: 'armor' };
  const weapon = getWeaponType(itemName);
  if (weapon) return { valueCp: weapon.valueCp, category: 'weapons' };
  return null;
}

const plusOf = (name) => {
  const m = String(name || '').match(/\+(\d+)\b/);
  return m ? Number(m[1]) : 0;
};

/**
 * A one-line description of what a piece of gear does in play, or '' for
 * anything that isn't a weapon, shield or body armour.
 */
export function describeGear(itemName) {
  if (!itemName) return '';
  const plus = plusOf(itemName);
  const bonus = plus ? ` +${plus}` : '';
  if (isShieldName(itemName)) {
    const s = getShieldType(itemName);
    return `Shield: blocks 1d${s.blockDie}${bonus} damage on a successful Blocking roll · one hand`;
  }
  const w = getWeaponType(itemName);
  if (w) {
    const hands = w.hands === 2 ? 'two hands' : 'one hand';
    const offHand = w.hands === 1 && !w.ranged ? ' · can be dual-wielded' : '';
    const ammo = w.ranged ? ' · needs arrows' : '';
    return `${w.dice}${bonus} ${w.damageType} · ${SKILL_LABELS[w.skill]} skill${bonus ? `, +${plus} to hit` : ''} · ${hands}${offHand}${ammo}`;
  }
  if (isArmorName(itemName)) {
    const a = ARMOR_TYPES[getArmorType(itemName)];
    return `${a.label}: absorbs ${a.soak}${bonus} damage (${a.note})`;
  }
  return '';
}

// Dual wielding (Hans 2026-11-17): two one-handed melee weapons give a second
// strike each round, at a penalty on both.
export const DUAL_WIELD = {
  main: { hit: -2, damage: -1 },
  off: { hit: -4, damage: -2 },
};

/** Both hands hold one-handed melee weapons (not a shield, bow or two-hander). */
export function getDualWield(equipment = {}) {
  const right = equipment?.hand_right;
  const left = equipment?.hand_left;
  if (!right || !left) return null;
  const r = getWeaponType(right);
  const l = getWeaponType(left);
  if (!r || !l || r.hands !== 1 || l.hands !== 1 || r.ranged || l.ranged) return null;
  return { main: right, off: left };
}
