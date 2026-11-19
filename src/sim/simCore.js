// Combat model shared by the playtest simulators in this folder (Hans
// 2026-11-18). It mirrors hooks/useGameState.js using the game's own gear
// tables, weight rules, enemy defence and matchup code, so a rule change in
// the game shows up here too.
//
// Model: one player vs one foe (a group foe attacks several times a round),
// player strikes first, each extra defence in a round is -2.

import {
  getWeaponType, getArmorType, getArmorPieces, getShieldRollBonus, getShieldSoakDie, getParryDie,
  getDualWield, getDualWieldPenalty, isTwoHandedMelee, TWO_HAND_DAMAGE_BONUS, getPlayerFightingStyle,
  getMatchupModifiers, isShieldName, traitDamageMods,
} from '../data/gearStats';
import { calculateWeightAndVolume, getItemDetails } from '../utils/items';
import { enemyStyleFromNpc, rollEnemyDefense, mundaneImmunityFromArmor } from '../utils/enemyDefense';
import { rollDiceExpression as roll } from '../utils/dice';
import { levelHpGain } from '../data/progressionRewards';

// Defaults match the game as shipped; the balance playtest can override them.
export const DEFAULT_CFG = { minHit: 1, chainDodge: -1, pieceDiv: 4, lightDodge: 0, metalPts: 2, leatherPts: 1, metalBlock: 0.5 };

export const d = (s) => Math.floor(Math.random() * s) + 1;
export const nd = (n, s) => { let t = 0; for (let i = 0; i < n; i++) t += d(s); return t; };
export const primary = (s) => (s >= 7 ? d(20) + d([4, 6, 8, 10, 12][Math.min(s, 11) - 7] || 12) : d([4, 4, 6, 8, 10, 12, 20][Math.max(1, s)]));
export const secondary = (s) => ({ 1: () => d(2), 2: () => d(2) + 1, 3: () => d(4), 4: () => d(4) + 1, 5: () => d(6), 6: () => d(10) })[Math.min(Math.max(s || 1, 1), 6)]();

// ---------------------------------------------------------------- enemies
const SKILL_KEYS = {
  heavy: { keys: ['HeavyWeapons', 'TwoHandedWeapons'], primary: 'Power', secondary: 'Vigor' },
  light: { keys: ['LightWeapons', 'OneHandedWeapons'], primary: 'Coordination', secondary: 'Power' },
  ranged: { keys: ['Marksmanship'], primary: 'Coordination', secondary: 'Intellect' },
  brawl: { keys: ['Brawling'], primary: 'Power', secondary: 'Vigor' },
};

/** An NPC / patrol foe stat block as a simulated enemy (null if not a gear fight). */
export function enemyFrom(npc, source) {
  const s = npc.stats || {};
  const atk = (s.attacks || [])[0];
  if (!atk || !s.HP || !s.defenses) return null;
  const armorText = s.armor || '';
  if (mundaneImmunityFromArmor(armorText)) return null; // puzzle bosses: not a gear fight
  const kind = /two-handed|heavy/i.test(atk.skill) ? 'heavy' : /marksman|bow/i.test(atk.skill) ? 'ranged' : /brawl|unarmed|claw|bite/i.test(atk.skill) ? 'brawl' : 'light';
  const sk = SKILL_KEYS[kind];
  const attrs = s.attributes || {};
  const ranks = sk.keys.map((k) => (s.skills || {})[k]).find((v) => v !== undefined) ?? 1;
  const dmgMatch = String(atk.damage || '1d6').match(/(\d*d\d+(?:\s*[+-]\s*\d+)?)\s*([a-z]+)?/i);
  const lower = armorText.toLowerCase();
  const soak = /heavy|1d6/.test(lower) ? '1d6' : /medium|1d4/.test(lower) ? '1d4' : '1d3';
  const style = enemyStyleFromNpc(npc);
  return {
    name: `${npc.name} (${source})`,
    hp: s.HP,
    attack: () => primary(attrs[sk.primary] || 2) + secondary(attrs[sk.secondary] || 2) + nd(ranks, 2),
    damage: dmgMatch ? dmgMatch[1].replace(/\s/g, '') : '1d6',
    damageType: (dmgMatch?.[2] || 'edged').toLowerCase(),
    soak,
    defenses: s.defenses,
    style: style.style,
    shield: style.shield,
    attacksPerRound: npc.attacksPerRound || 1,
    roadThreat: (npc.attacksPerRound || 1) > 1 || !!npc.scaling,
  };
}

// ---------------------------------------------------------------- builds
const KIT = ['Bedroll', 'Rations (5)', 'Tinderbox', 'Waterskin', 'Small Backpack'];
export const WEAPONS = {
  'War Scythe': { hand_right: 'Iron War Scythe' },
  'Battle Axe': { hand_right: 'Battle Axe' },
  'Halberd': { hand_right: 'Halberd' },
  'Warhammer': { hand_right: 'Warhammer' },
  'Sword + Iron Shield': { hand_right: 'Steel Sword', hand_left: 'Iron Shield' },
  'Mace + Iron Shield': { hand_right: 'Mace', hand_left: 'Iron Shield' },
  'Flail + Iron Shield': { hand_right: 'Flail', hand_left: 'Iron Shield' },
  'Spear + Iron Shield': { hand_right: 'Spear', hand_left: 'Iron Shield' },
  'Rapier + Iron Shield': { hand_right: 'Rapier', hand_left: 'Iron Shield' },
  'Sword + Wooden Shield': { hand_right: 'Steel Sword', hand_left: 'Wooden Shield' },
  'Sword + Dagger': { hand_right: 'Steel Sword', hand_left: 'Dagger' },
  'Rapier + Dagger': { hand_right: 'Rapier', hand_left: 'Dagger' },
  'Two Daggers': { hand_right: 'Dagger', hand_left: 'Dagger' },
  'Longbow': { hand_right: 'Longbow' },
  'Short Bow': { hand_right: 'Short Bow' },
  'Crossbow': { hand_right: 'Crossbow' },
  'Sword alone': { hand_right: 'Steel Sword' },
};
export const ARMOUR = {
  'No armour': {},
  'Leather': { body: 'Leather Armor' },
  'Leather + full leather set': { body: 'Leather Armor', head: 'Leather Helmet', legs: 'Leather Pants', feet: 'Leather Boots', hands: 'Leather Gloves' },
  'Chainmail': { body: 'Steel Chainmail' },
  'Chainmail + helm & gauntlets': { body: 'Steel Chainmail', head: 'Plate Helm', hands: 'Plate Gauntlets' },
  'Chainmail + full metal set': { body: 'Steel Chainmail', head: 'Iron Plate Helm', legs: 'Plate Greaves', feet: 'Steel Sabatons', hands: 'Plate Gauntlets' },
};
export const FOCUS = ['dodge-trained', 'block-trained'];

/**
 * A typical character at a level: Coordination/Power/Vigor 3, the weapon
 * skill and the trained defence rising a rank about every two levels (2-4
 * skill points per adventure, a rank costs its number), HP from levelHpGain.
 */
export function playerAt(level = 1) {
  let hp = 16;
  for (let l = 2; l <= level; l++) hp += levelHpGain(l, 3);
  return {
    level, hp,
    attrs: { coordination: 3, power: 3, vigor: 3 },
    weaponSkill: Math.min(5, 2 + Math.floor((level - 1) / 2)),
    mainDefence: Math.min(5, 3 + Math.floor((level - 1) / 3)),
    offDefence: Math.min(5, 1 + Math.floor((level - 1) / 4)),
  };
}

export function makeBuild(wName, aName, fName, player = playerAt(1), CFG = DEFAULT_CFG) {
  const equipment = { ...WEAPONS[wName], ...ARMOUR[aName], backpack: 'Small Backpack' };
  const worn = Object.values(equipment).filter(Boolean);
  const inventory = [...new Set([...worn, ...KIT])];
  const ranged = !!getWeaponType(equipment.hand_right)?.ranged;
  if (ranged) inventory.push('Arrows (20)');
  const enc = calculateWeightAndVolume({ attributes: player.attrs, equipment, inventory });
  const style = getPlayerFightingStyle(equipment, ranged ? 'ranged' : 'melee');
  const dual = getDualWield(equipment);
  const mainItem = [equipment.hand_right, equipment.hand_left].find((i) => i && !isShieldName(i));
  const strikes = dual
    ? [{ item: dual.main, pen: getDualWieldPenalty(dual.main, 'main') }, { item: dual.off, pen: getDualWieldPenalty(dual.off, 'off') }]
    : [{ item: mainItem, pen: { hit: 0, damage: 0 } }];
  const shield = [equipment.hand_right, equipment.hand_left].find((i) => i && isShieldName(i)) || null;
  const armorType = getArmorType(equipment.body);
  const pieces = getArmorPieces(equipment);
  const cost = Object.entries(equipment).filter(([k]) => k !== 'backpack').reduce((t, [, v]) => t + (getItemDetails(v).valueCp || 0), 0);
  const dodgeTrained = fName === 'dodge-trained';
  return {
    name: `${wName} · ${aName} · ${fName}`, wName, aName, fName, equipment, style, ranged, strikes, shield, player,
    skills: {
      weapon: player.weaponSkill,
      acrobatics: dodgeTrained ? player.mainDefence : player.offDefence,
      blocking: dodgeTrained ? player.offDefence : player.mainDefence,
    },
    load: enc.rollModifier || 0, weight: enc.totalWeight, maxWeight: enc.maxWeight,
    bodySoak: equipment.body ? { light: '1d3', medium: '1d4', heavy: '1d6' }[armorType] : null,
    armorType,
    pieceSoak: Math.floor((pieces.metal * CFG.metalPts + pieces.leather * CFG.leatherPts) / CFG.pieceDiv),
    blockPen: -Math.floor((pieces.metal * CFG.metalBlock) / 2),
    dodgePen: (armorType === 'heavy' ? -2 : armorType === 'medium' ? CFG.chainDodge : CFG.lightDodge) + pieces.dodgePenalty,
    cost,
  };
}

const typeMod = (armorType, dt) => {
  if (armorType === 'light') return dt === 'piercing' ? -2 : 0;
  if (armorType === 'medium') return dt === 'blunt' ? -2 : dt === 'piercing' ? 2 : 0;
  if (armorType === 'heavy') return dt === 'blunt' ? -2 : dt === 'edged' ? 2 : 0;
  return 0;
};

/** One fight. Returns { win, hp } (hp left). */
export function fight(b, e, defence, CFG = DEFAULT_CFG) {
  const A = b.player.attrs;
  let php = b.player.hp;
  let ehp = e.hp;
  let unloaded = false;
  for (let round = 0; round < 40; round++) {
    for (const s of b.strikes) {
      if (ehp <= 0) break;
      const w = getWeaponType(s.item);
      if (w?.reload && unloaded) { unloaded = false; continue; } // crossbow: this action reloads
      const shots = w?.quick ? w.quick.strikes : 1;
      const mods = traitDamageMods(w, e.soak);
      for (let k = 0; k < shots && ehp > 0; k++) {
        const base = b.ranged ? primary(A.coordination) + primary(A.coordination) : primary(A.coordination) + primary(A.power);
        const atk = base + nd(b.skills.weapon, 2) + s.pen.hit + b.load + (w?.hitMod || 0) + (w?.quick ? w.quick.hit : 0);
        const def = rollEnemyDefense(e, b.style, roll, { ignoreShield: !!w?.ignoresShield });
        const raw = Math.max(0, roll(w.dice) + (isTwoHandedMelee(w) ? TWO_HAND_DAMAGE_BONUS : 0) + s.pen.damage + mods.damage);
        const esoak = Math.max(0, roll(e.soak) - mods.pierce);
        if (atk >= def.roll) ehp -= Math.max(1, raw - esoak);
        else if (def.defence === 'block') ehp -= Math.max(0, raw - esoak - d(def.blockDie));
      }
      if (w?.reload) unloaded = true;
    }
    if (ehp <= 0) return { win: true, hp: php };
    // Enemy turn: each attack after the first in a round is -2 cumulative to defend.
    const reach = getWeaponType(b.strikes[0].item)?.reach || 0;
    for (let a = 0; a < e.attacksPerRound; a++) {
      const m = getMatchupModifiers(e.style, b.style, defence, defence === 'block' && !!b.shield);
      const situational = -2 * a + (a === 0 ? reach : 0);
      let pr;
      if (defence === 'dodge') pr = primary(A.coordination) + secondary(A.vigor) + nd(b.skills.acrobatics, 2) + b.dodgePen + b.load + m.rollBonus + situational;
      else pr = primary(A.power) + secondary(A.coordination) + nd(b.skills.blocking, 2) + Math.floor(getShieldRollBonus(b.shield) * m.shieldFactor) + b.load + m.rollBonus + b.blockPen + situational;
      const er = e.attack();
      const soak = Math.max(0, (b.bodySoak ? roll(b.bodySoak) + typeMod(b.armorType, e.damageType) : 0)) + b.pieceSoak;
      let taken = 0;
      if (pr < er) taken = Math.max(CFG.minHit, roll(e.damage) + Math.floor((er - pr) / 3) - soak);
      else if (defence === 'block') {
        const block = b.shield ? d(Math.max(2, Math.floor(getShieldSoakDie(b.shield) * m.shieldFactor)))
          : (m.canParry && getParryDie(b.strikes[0].item) ? d(getParryDie(b.strikes[0].item)) : 0);
        taken = Math.max(0, roll(e.damage) - soak - block);
      }
      php -= taken;
      if (php <= 0) return { win: false, hp: 0 };
    }
  }
  return { win: false, hp: php };
}

/** Best of Dodge or Block for a build against an enemy over n fights. */
export function winRate(b, e, n, CFG = DEFAULT_CFG) {
  const best = { win: -1 };
  for (const defence of ['dodge', 'block']) {
    if (defence === 'block' && !b.shield && !(getParryDie(b.strikes[0].item))) continue;
    let w = 0; let hpLeft = 0;
    for (let i = 0; i < n; i++) { const r = fight(b, e, defence, CFG); if (r.win) { w++; hpLeft += r.hp; } }
    if (w / n > best.win) Object.assign(best, { win: w / n, hpLeft: w ? hpLeft / w : 0, hpLostPct: w ? 1 - (hpLeft / w) / b.player.hp : 1, defence });
  }
  return best;
}
