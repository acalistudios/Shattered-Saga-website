// The numbers behind the Combat Stats panel (Hans 2026-11-18).
//
// Everything here comes from the same tables and helpers combat rolls with
// (data/gearStats.js, utils/rewardEngine.js, utils/combatModifiers.js), so the
// panel cannot drift from the dice. Averages are expected values of each roll.

import {
  getArmorType, ARMOR_TYPES, getArmorPieces, getShieldRollBonus, getShieldSoakDie, getParryDie,
  getDualWield, getDualWieldPenalty, getPlayerFightingStyle, FIGHTING_STYLES, isShieldName,
} from '../data/gearStats';
import { getRewardWeaponProfile, getMagicBonus } from './rewardEngine';
import { getAttackPenalty } from './combatModifiers';
import { getEquippedDefenseGear } from './items';
import { getKeystoneStatModifiers } from '../data/keystoneShards';

const PRIMARY_DIE = (s) => [4, 4, 6, 8, 10, 12, 20][Math.min(Math.max(s || 1, 1), 6)];
const primaryAvg = (s) => (s >= 7 ? 10.5 + [0, 0, 0, 0, 0, 0, 0, 2.5, 3.5, 4.5, 5.5][Math.min(s, 10)] : (PRIMARY_DIE(s) + 1) / 2);
const SECONDARY_AVG = { 1: 1.5, 2: 2.5, 3: 2.5, 4: 3.5, 5: 3.5, 6: 5.5 };
const secondaryAvg = (s) => SECONDARY_AVG[Math.min(Math.max(s || 1, 1), 6)];
const ranksAvg = (r) => (r || 0) * 1.5;
const diceAvg = (expr) => String(expr || '0').split('+').reduce((t, p) => {
  const m = p.trim().match(/^(\d*)d(\d+)$/);
  return t + (m ? Number(m[1] || 1) * (Number(m[2]) + 1) / 2 : Number(p) || 0);
}, 0);
const round1 = (n) => Math.round(n * 10) / 10;
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

export function getCombatSheet(character) {
  const eq = character?.equipment || {};
  const attrs = character?.attributes || {};
  const skills = character?.skills || {};
  const pen = getAttackPenalty(character);
  const style = getPlayerFightingStyle(eq, 'melee');

  // Attacks: one strike, or two when dual wielding.
  const dual = getDualWield(eq);
  const mainItem = [eq.hand_right, eq.hand_left].find((i) => i && !isShieldName(i)) || null;
  const strikes = dual
    ? [{ item: dual.main, pen: getDualWieldPenalty(dual.main, 'main'), hand: 'Main hand' }, { item: dual.off, pen: getDualWieldPenalty(dual.off, 'off'), hand: 'Off hand' }]
    : [{ item: mainItem, pen: { hit: 0, damage: 0 }, hand: null }];
  const attacks = strikes.map((s) => {
    const w = getRewardWeaponProfile(s.item, character);
    const quick = w.type?.quick;
    const hitMod = w.attackBonus + (w.traitHit || 0) + s.pen.hit + pen.total + (quick ? quick.hit : 0);
    const ranged = !!w.ranged;
    const hitAvg = (ranged ? primaryAvg(attrs.coordination) * 2 : primaryAvg(attrs.coordination) + primaryAvg(attrs.power))
      + ranksAvg(skills[w.skill]) + hitMod;
    const dmgMod = w.damageBonus + s.pen.damage;
    return {
      hand: s.hand,
      weapon: w.name,
      skill: w.skill,
      ranks: skills[w.skill] || 0,
      hitAvg: round1(hitAvg),
      hitMod,
      damage: `${w.dice}${dmgMod ? signed(dmgMod) : ''}`,
      damageAvg: round1(Math.max(0, diceAvg(w.dice) + dmgMod)),
      shots: quick ? quick.strikes : 1,
      trait: w.type?.trait || '',
    };
  });
  const attacksPerAction = attacks.reduce((t, a) => t + a.shots, 0);

  // Armour soak: body armour die + pieces.
  const armorType = getArmorType(eq.body);
  const armorMagic = getMagicBonus(eq.body);
  const pieces = getArmorPieces(eq);
  const bodyDie = eq.body ? ARMOR_TYPES[armorType].soak : null;
  const soakAvg = (bodyDie ? diceAvg(bodyDie) + armorMagic : 0) + pieces.soak;
  const soakText = [bodyDie && `${bodyDie}${armorMagic ? signed(armorMagic) : ''} ${ARMOR_TYPES[armorType].label.toLowerCase()}`, pieces.soak && `+${pieces.soak} helm/legs/feet/hands`]
    .filter(Boolean).join(' ') || 'none';

  // Defences (before the -2 per extra defence in a round and stances).
  const keystone = getKeystoneStatModifiers(character);
  const defPen = -(pen.starvation + pen.exhaustion);
  const load = -pen.load;
  const bodyDodgePen = armorType === 'heavy' ? -2 : armorType === 'medium' ? -1 : 0;
  const dodgeMod = bodyDodgePen + pieces.dodgePenalty + (keystone.dodgeBonus || 0) + defPen + load;
  const { shieldName, weaponName } = getEquippedDefenseGear(eq);
  const shieldBonus = shieldName ? getShieldRollBonus(shieldName) + getMagicBonus(shieldName) : 0;
  const blockMod = shieldBonus + pieces.blockPenalty + defPen + load;
  const canBlock = !!(shieldName || weaponName);
  const blockSoak = shieldName
    ? `1d${getShieldSoakDie(shieldName)}${getMagicBonus(shieldName) ? signed(getMagicBonus(shieldName)) : ''} shield`
    : (weaponName && getParryDie(weaponName) ? `1d${getParryDie(weaponName)} parry` : 'none');
  const wardRanks = Math.max(skills.divine_communion || 0, skills.arcane_drawing || 0);

  return {
    style: { key: style, ...(FIGHTING_STYLES[style] || FIGHTING_STYLES.none) },
    attacksPerAction,
    attacks,
    penalties: pen.text,
    soak: { text: soakText, avg: round1(soakAvg) },
    dodge: {
      avg: round1(primaryAvg(attrs.coordination) + secondaryAvg(attrs.vigor) + ranksAvg(skills.acrobatics) + dodgeMod),
      mod: dodgeMod,
      note: 'Success avoids all damage',
    },
    block: canBlock ? {
      avg: round1(primaryAvg(attrs.power) + secondaryAvg(attrs.coordination) + ranksAvg(skills.blocking) + blockMod),
      mod: blockMod,
      soak: blockSoak,
      note: shieldName ? 'Success: the blow minus armour and shield' : 'Parry: the blow minus armour and parry',
    } : null,
    resist: {
      avg: round1(primaryAvg(attrs.willpower) + secondaryAvg(attrs.empathy) + ranksAvg(wardRanks) + defPen),
      note: 'Against curses, terror and mind attacks; armour does not help',
    },
  };
}
