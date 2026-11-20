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
// Skill rule: one-handed melee weapons use One-Handed Weapons, two-handed ones
// Two-Handed Weapons, bows and crossbows Marksmanship.

// Weapon traits (Hans 2026-11-18): each weapon has one thing that makes it good
// in some fights and worse in others, so no die size simply wins.
//   hitMod        +/- to hit (finesse rapier, clumsy flail, unwieldy battle axe)
//   quick         { strikes, hit }: several shots per action at a penalty (short bow)
//   reload        shoots every other action; the next one reloads (crossbow)
//   armorPierce   ignores that much enemy armour soak (crossbow)
//   crushing      + damage against medium or heavy armour (mace, warhammer)
//   ignoresShield the enemy's shield adds nothing to its block (flail)
//   reach         + to your first defence each round (spear)
//   parryDie      parries with this die instead of the usual (halberd haft)
// Tuned with the balance playtest (src/sim/balance.playtest.test.js).
export const WEAPON_TYPES = [
  // Throwing weapons (Hans 2026-11-20) come first so "Throwing Knife" and
  // "Throwing Axe" are not read as a plain dagger or axe. `thrown` is what the
  // Throw action rolls (Thrown Weapons skill); daggers, hatchets and spears
  // below can be thrown too, less well. Thrown weapons are always recovered.
  { key: 'throwingknife', match: ['throwing knife', 'throwing knives', 'throwing dagger'], label: 'Throwing knife', dice: '1d4', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'small', valueCp: 25, thrown: { dice: '1d4+1', hit: 1, made: true }, trait: 'Made to throw: thrown 1d4+1, +1 to hit' },
  { key: 'throwingaxe', match: ['throwing axe', 'tomahawk', 'francisca'], label: 'Throwing axe', dice: '1d6', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 70, thrown: { dice: '1d8+1', hit: -1, made: true }, trait: 'Made to throw: thrown 1d8+1, -1 to hit' },
  { key: 'javelin', match: ['javelin'], label: 'Javelin', dice: '1d6', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 60, thrown: { dice: '1d6+1', hit: 0, pierce: 1, made: true }, trait: 'Made to throw: thrown 1d6+1, ignores 1 armour' },
  // Two-handed melee weapons are 1d10 (2d6 out-damaged every other style in
  // scripts/combat-matchups.mjs); the battle axe trades accuracy for a d12.
  { key: 'greatsword', match: ['greatsword'], label: 'Greatsword', dice: '1d10', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 500, trait: 'Balanced: no drawback' },
  { key: 'battleaxe', match: ['battle axe', 'battleaxe', 'greataxe'], label: 'Battle axe', dice: '1d12', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 550, hitMod: -1, trait: 'Unwieldy: -1 to hit' },
  { key: 'warhammer', match: ['warhammer', 'maul', 'sledge', 'pickaxe', 'mining pick', 'war pick'], label: 'Warhammer', dice: '1d10', damageType: 'blunt', skill: 'heavy_weapons', hands: 2, valueCp: 500, crushing: 1, trait: 'Crushing: +1 damage against medium or heavy armour' },
  { key: 'halberd', match: ['halberd', 'glaive', 'poleaxe', 'bardiche'], label: 'Halberd', dice: '1d10', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 550, parryDie: 6, trait: 'Long haft: parries 1d6' },
  { key: 'polearm', match: ['scythe'], label: 'War scythe', dice: '1d10', damageType: 'edged', skill: 'heavy_weapons', hands: 2, valueCp: 500, trait: 'Balanced: no drawback' },
  { key: 'staff', match: ['quarterstaff', 'staff'], label: 'Staff', dice: '1d6', damageType: 'blunt', skill: 'heavy_weapons', hands: 2, valueCp: 20 },
  { key: 'crossbow', match: ['crossbow'], label: 'Crossbow', dice: '1d10+1', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 600, ranged: true, reload: true, armorPierce: 2, trait: 'Slow: shoots every other action (the next reloads); bolts ignore 2 armour' },
  { key: 'longbow', match: ['longbow'], label: 'Longbow', dice: '1d8', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 400, ranged: true, hitMod: 1, trait: 'Steady: +1 to hit' },
  { key: 'shortbow', match: ['short bow', 'shortbow'], label: 'Short bow', dice: '1d6', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 250, ranged: true, quick: { strikes: 2, hit: -2 }, trait: 'Quick: two shots each action, each at -2 to hit' },
  { key: 'bow', match: ['bow'], label: 'Bow', dice: '1d6', damageType: 'piercing', skill: 'marksmanship', hands: 2, valueCp: 300, ranged: true },
  { key: 'dagger', match: ['dagger', 'knife', 'shiv'], label: 'Dagger', dice: '1d4+1', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'small', valueCp: 20, thrown: { dice: '1d4', hit: -1 } },
  { key: 'rapier', match: ['rapier', 'estoc'], label: 'Rapier', dice: '1d6', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 150, hitMod: 1, trait: 'Finesse: +1 to hit' },
  { key: 'shortsword', match: ['shortsword', 'cutlass'], label: 'Shortsword', dice: '1d6', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 100 },
  { key: 'hatchet', match: ['hatchet'], label: 'Hatchet', dice: '1d6', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 50, thrown: { dice: '1d6', hit: -1 } },
  { key: 'sickle', match: ['sickle'], label: 'Sickle', dice: '1d6', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 50 },
  { key: 'club', match: ['club', 'cudgel'], label: 'Club', dice: '1d4', damageType: 'blunt', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 10 },
  { key: 'flail', match: ['flail', 'morning star', 'morningstar'], label: 'Flail', dice: '1d8', damageType: 'blunt', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 200, hitMod: -1, ignoresShield: true, trait: 'Wraps the guard: enemy shields add nothing to their block; clumsy, -1 to hit' },
  { key: 'mace', match: ['mace', 'hammer'], label: 'Mace', dice: '1d6', damageType: 'blunt', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 150, crushing: 2, trait: 'Crushing: +2 damage against medium or heavy armour' },
  { key: 'spear', match: ['spear', 'trident', 'pike'], label: 'Spear', dice: '1d6', damageType: 'piercing', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 100, reach: 1, thrown: { dice: '1d6', hit: -1 }, trait: 'Reach: +1 to your first defence each round' },
  { key: 'axe', match: ['axe'], label: 'Axe', dice: '1d8', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 200 },
  { key: 'sword', match: ['longsword', 'sword', 'blade', 'sabre', 'saber'], label: 'Sword', dice: '1d8', damageType: 'edged', skill: 'light_weapons', hands: 1, size: 'medium', valueCp: 200 },
  { key: 'torch', match: ['torch'], label: 'Torch', dice: '1d4', damageType: 'fire', skill: 'light_weapons', hands: 1, size: 'small', valueCp: 1 },
];

// Flat damage bonus for two-handed melee weapons. Tested at +1 (Hans
// 2026-11-17) but scripts/combat-matchups.mjs showed it made two-handers beat
// every style, so it is 0; the bigger dice and the matchup rules carry them.
export const TWO_HAND_DAMAGE_BONUS = 0;
export const isTwoHandedMelee = (type) => !!type && type.hands === 2 && !type.ranged;

// Parrying: a successful Blocking roll with a weapon and no shield turns part
// of the blow aside. A heavy two-handed haft parries better than a light blade.
export const PARRY_DIE = { 1: 2, 2: 4 };
export function getParryDie(weaponName) {
  const w = getWeaponType(weaponName);
  if (!w || w.ranged) return 0;
  return w.parryDie || PARRY_DIE[w.hands] || 0;
}

/** Enemy armour weight from its soak die (what crushing weapons care about). */
export const enemyArmorWeight = (armorSoak) => (/1d6/.test(armorSoak || '') ? 'heavy' : /1d4/.test(armorSoak || '') ? 'medium' : 'light');

/** Trait damage against an enemy: crushing bonus and armour pierce. */
export function traitDamageMods(weaponType, enemyArmorSoak) {
  if (!weaponType) return { damage: 0, pierce: 0 };
  const heavyish = enemyArmorWeight(enemyArmorSoak) !== 'light';
  return { damage: weaponType.crushing && heavyish ? weaponType.crushing : 0, pierce: weaponType.armorPierce || 0 };
}

// Shields (Hans 2026-11-17): rollBonus is added to the Blocking roll, so a
// shield makes a block more likely to succeed. Without it Dodge (which avoids
// all damage) rolled the same odds and shields did nothing in play.
// blockDie is the damage soaked when a Blocking defence succeeds.
export const SHIELD_TYPES = [
  // Roll bonuses raised by 1 after the balance playtest (src/sim): at +2 an
  // iron shield did no better than a sword alone against the adventures' foes.
  { key: 'tower', match: ['tower', 'heavy', 'reinforced'], label: 'Heavy shield', blockDie: 8, rollBonus: 4, valueCp: 500 },
  { key: 'light', match: ['buckler', 'targe'], label: 'Buckler', blockDie: 4, rollBonus: 1, valueCp: 60 },
  { key: 'wooden', match: ['wood', 'hide', 'leather'], label: 'Wooden shield', blockDie: 4, rollBonus: 2, valueCp: 100 },
  { key: 'metal', match: [], label: 'Shield', blockDie: 6, rollBonus: 3, valueCp: 250 }, // iron, steel, unnamed
];

export function getShieldRollBonus(shieldName) {
  return shieldName ? getShieldType(shieldName).rollBonus : 0;
}

// Armour soak, and how each weight handles damage types (useGameState).
export const ARMOR_TYPES = {
  light: { label: 'Light armour', soak: '1d3', note: '-2 vs piercing' },
  medium: { label: 'Medium armour', soak: '1d4', note: '+2 vs piercing, -2 vs blunt' },
  heavy: { label: 'Heavy armour', soak: '1d6', note: '+2 vs edged, -2 vs blunt' },
};

// Helmets, leggings, boots and gloves (Hans 2026-11-18). Each metal piece is
// worth 2 points and each leather piece 1; every 4 points soak 1 more damage,
// so a full metal set adds +2 soak and a full leather set +1. Every two metal
// pieces cost -1 on dodges. Kept small: scripts/combat-sim.mjs showed +1 soak
// per piece made heavy armour nearly unbeatable against 1d6-1d8 enemy hits.
export const ARMOR_PIECE_SLOTS = ['head', 'legs', 'feet', 'hands'];
const METAL_PIECE = /plate|iron|steel|chain|mail|sabaton|gauntlet|greave|helm\b/i;
const LEATHER_PIECE = /leather|hide|studded|boots|gloves|pants|helmet|cap\b|bracer/i;

const PIECE_WORDS = /helm|helmet|\bcap\b|coif|greaves|pants|leggings|boots|sabatons?|gloves|gauntlets?|bracers/i;

export function getArmorPieceType(itemName) {
  if (!itemName || !PIECE_WORDS.test(itemName)) return null;
  if (METAL_PIECE.test(itemName)) return 'metal';
  if (LEATHER_PIECE.test(itemName)) return 'leather';
  return null; // hoods, veils, charms: no protection
}

export function getArmorPieces(equipment = {}) {
  let metal = 0;
  let leather = 0;
  for (const slot of ARMOR_PIECE_SLOTS) {
    const type = getArmorPieceType(equipment?.[slot]);
    if (type === 'metal') metal++;
    else if (type === 'leather') leather++;
  }
  // A full metal set also stiffens a block (-1), so stacking every piece of
  // metal is a trade, not a free upgrade (balance playtest, src/sim).
  return {
    metal, leather,
    soak: Math.floor((metal * 2 + leather) / 4),
    dodgePenalty: -Math.floor(metal / 2) || 0,
    blockPenalty: -Math.floor(metal / 4) || 0,
  };
}

const SKILL_LABELS ={ light_weapons: 'One-Handed Weapons', heavy_weapons: 'Two-Handed Weapons', marksmanship: 'Marksmanship', blocking: 'Blocking' };

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
    return `Shield: +${s.rollBonus} to Blocking rolls, blocks 1d${s.blockDie}${bonus} damage · one hand`;
  }
  const w = getWeaponType(itemName);
  if (w) {
    const hands = w.hands === 2 ? 'two hands' : 'one hand';
    const twoHand = isTwoHandedMelee(w) && TWO_HAND_DAMAGE_BONUS ? `+${TWO_HAND_DAMAGE_BONUS}` : '';
    const parry = w.ranged || w.parryDie ? '' : ` · parries 1d${PARRY_DIE[w.hands]}`;
    const dw = DUAL_WIELD[w.size === 'small' ? 'small' : 'medium'];
    const signed = (n) => (n ? `${n}` : '±0');
    const offHand = w.hands === 1 && !w.ranged ? ` · dual-wield ${signed(dw.main.hit)} main / ${signed(dw.off.hit)} off hand to hit` : '';
    const ammo = w.ranged ? (w.key === 'crossbow' ? ' · needs bolts or arrows' : ' · needs arrows') : '';
    const trait = w.trait ? ` · ${w.trait}` : '';
    const thrown = !w.thrown ? ''
      : w.thrown.made ? ' · thrown with the Thrown Weapons skill; always recovered after the fight'
        : ` · can be thrown (Thrown Weapons skill): ${w.thrown.dice}, ${w.thrown.hit} to hit`;
    return `${w.dice}${twoHand}${bonus} ${w.damageType} · ${SKILL_LABELS[w.skill]} skill${bonus ? `, +${plus} to hit` : ''} · ${hands}${parry}${offHand}${ammo}${trait}${thrown}`;
  }
  if (isArmorName(itemName)) {
    const a = ARMOR_TYPES[getArmorType(itemName)];
    return `${a.label}: absorbs ${a.soak}${bonus} damage (${a.note})`;
  }
  const piece = getArmorPieceType(itemName);
  if (piece === 'metal') return 'Metal armour piece (helm, legs, feet or hands): every 2 add +1 soak and -1 to dodge; a full set of 4 is also -1 to block';
  if (piece === 'leather') return 'Leather armour piece (helm, legs, feet or hands): every 4 add +1 soak';
  return '';
}

// Dual wielding (Hans 2026-11-17): two one-handed melee weapons give a second
// strike each round, at a penalty on both. The penalty scales with the weight
// of the weapon in that hand, so a pair of daggers is a fair choice while two
// swords cost more.
export const DUAL_WIELD = {
  small: { main: { hit: 0, damage: 0 }, off: { hit: -1, damage: 0 } },
  medium: { main: { hit: -1, damage: 0 }, off: { hit: -2, damage: -1 } },
};

/** The dual-wield penalty for the weapon in one hand ('main' or 'off'). */
export function getDualWieldPenalty(weaponName, hand) {
  const w = getWeaponType(weaponName);
  return DUAL_WIELD[w?.size === 'small' ? 'small' : 'medium'][hand];
}

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

// ---------------------------------------------------------------------------
// Fighting styles and matchups (Hans 2026-11-17)
//
// Each style has an edge on one other and a weakness to another, so the right
// weapon depends on the foe:
//   two-handed > shield > dual wield > two-handed
//   ranged does well, except against a shield (a weapon can't parry an arrow)
// The rules work the same whether the player or the enemy is attacking.
// Tuned with scripts/combat-sim.mjs.
// ---------------------------------------------------------------------------

export const FIGHTING_STYLES = {
  two_handed: { label: 'Two-handed fighter', icon: '🪓' },
  shield: { label: 'Shield fighter', icon: '🛡️' },
  dual: { label: 'Dual wielder', icon: '⚔️' },
  ranged: { label: 'Ranged fighter', icon: '🏹' },
  none: { label: 'No fighting style', icon: '' },
};

// Kept small on purpose (Hans 2026-11-17): each edge is worth roughly 55-60%
// in an even duel, so a player can stick with one style and still win.
// A shield also beats dual wielding without a rule of its own: it blocks each
// of the two lighter strikes.
export const MATCHUP = {
  heavyBlowShieldFactor: 0.75, // two-handed vs shield: shield bonus and block die x0.75
  shieldVsQuickBlows: 0, // shield blocking a dual wielder (was +1; the stronger shield bonus covers it)
  slowVsDual: 0, // two-handed fighter defending against a dual wielder (two strikes already win it)
  shieldVsArrows: 0, // shield blocking an arrow: + to the block roll
  arrowsVsNoShield: -2, // defending against an arrow without a shield
};

/** The style a player fights with for a melee or ranged attack. */
export function getPlayerFightingStyle(equipment = {}, attackKind = 'melee') {
  if (attackKind === 'ranged') return 'ranged';
  const hands = [equipment?.hand_right, equipment?.hand_left].filter(Boolean);
  if (hands.some(isShieldName)) return 'shield';
  if (getDualWield(equipment)) return 'dual';
  if (hands.some((h) => isTwoHandedMelee(getWeaponType(h)))) return 'two_handed';
  return 'none';
}

const DUAL_WORDS = /\b(twin|paired|pair of|two|dual|both)\b|\band\b.*\b(dagger|knife|sword|axe|hatchet|sickle|blade)s?\b/i;

/**
 * The style an enemy fights with, from its gear and attack names (authored
 * NPCs) or the weapon the GM names in [enemy_attack]. Anything unclear is
 * 'none', and then no matchup rule applies.
 */
export function inferFightingStyle(...sources) {
  const words = sources.flat().filter(Boolean).map(String);
  const text = words.join(' | ');
  if (!text) return 'none';
  if (words.some(isShieldName)) return 'shield';
  const weapons = words.map(getWeaponType).filter(Boolean);
  if (weapons.some((w) => isTwoHandedMelee(w))) return 'two_handed';
  const melee1h = weapons.filter((w) => w.hands === 1 && !w.ranged);
  if (melee1h.length >= 2 || (melee1h.length && DUAL_WORDS.test(text))) return 'dual';
  if (weapons.some((w) => w.ranged) || /\b(sling|javelin|thrown|throwing)\b/i.test(text)) return 'ranged';
  return 'none';
}

/**
 * How a matchup changes one defence. attacker/defender are style keys;
 * defence is 'block' or 'dodge'; hasShield is whether the defender blocks with
 * a shield. Returns roll and soak adjustments plus notes for the combat log.
 */
export function getMatchupModifiers(attacker, defender, defence, hasShield) {
  const out = { rollBonus: 0, shieldFactor: 1, canParry: true, notes: [] };
  if (defence === 'block' && hasShield) {
    if (attacker === 'two_handed' && MATCHUP.heavyBlowShieldFactor !== 1) {
      out.shieldFactor = MATCHUP.heavyBlowShieldFactor;
      out.notes.push('Heavy blow: the shield blocks less');
    } else if (attacker === 'dual' && MATCHUP.shieldVsQuickBlows) {
      out.rollBonus += MATCHUP.shieldVsQuickBlows;
      out.notes.push(`Shield catches quick blows: +${MATCHUP.shieldVsQuickBlows} to block`);
    } else if (attacker === 'ranged' && MATCHUP.shieldVsArrows) {
      out.rollBonus += MATCHUP.shieldVsArrows;
      out.notes.push(`Shield stops arrows: +${MATCHUP.shieldVsArrows} to block`);
    }
  }
  if (!hasShield && attacker === 'ranged' && MATCHUP.arrowsVsNoShield) {
    out.rollBonus += MATCHUP.arrowsVsNoShield;
    if (defence === 'block') {
      out.canParry = false;
      out.notes.push(`A weapon can't parry an arrow (${MATCHUP.arrowsVsNoShield} to defend)`);
    } else {
      out.notes.push(`No shield against arrows: ${MATCHUP.arrowsVsNoShield} to dodge`);
    }
  }
  if (defender === 'two_handed' && attacker === 'dual' && MATCHUP.slowVsDual) {
    out.rollBonus += MATCHUP.slowVsDual;
    out.notes.push(`Too slow for two blades: ${MATCHUP.slowVsDual} to defend`);
  }
  return out;
}
