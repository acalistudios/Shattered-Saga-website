// How an enemy defends against the player's weapon attacks, with the fighting
// style matchups from data/gearStats.js (Hans 2026-11-17).
//
// An enemy with a shield and a Block defence blocks; everything else dodges,
// as before. A successful block still lets part of the blow through, the same
// rule the player's own Blocking follows.

import { getMatchupModifiers, getShieldRollBonus, getShieldSoakDie, inferFightingStyle, isShieldName } from '../data/gearStats';
import { rollDiceExpression } from './dice';
import { conditionMods, conditionText } from './conditions';

/**
 * An attack the GM marks "vs Will" (curse, terror, mind control) is resisted
 * with Willpower; dodging, blocking and armour don't apply.
 */
export function isMentalAttack(attack) {
  return /will|mind|mental|ward|resolve|spirit|soul|fear|terror/i.test(attack?.vsSkill || '');
}

/**
 * How much of a weapon's damage reaches an enemy whose armour text says it is
 * incorporeal or immune to mundane harm (Malachar, ghosts, projections).
 * Magic weapons (+N or reward weapons), spells and divine power hurt it
 * normally, as does anything once the GM emits [enemy_weakened].
 * Returns { factor: 1 | 0.5 | 0, note }.
 */
export function mundaneDamageFactor(enemy, { magical = false } = {}) {
  const immunity = enemy?.mundaneImmunity;
  if (!immunity || enemy?.weakened || magical) return { factor: 1, note: '' };
  if (immunity === 'resistant') return { factor: 0.5, note: `${enemy.name} shrugs off mundane steel: half damage until it is weakened` };
  return { factor: 0, note: `Mundane steel passes through ${enemy.name}: no damage until it is weakened (holy water, rites, the story's key)` };
}

/** Read the immunity from an NPC's armour text. */
export function mundaneImmunityFromArmor(armorText) {
  const t = String(armorText || '').toLowerCase();
  if (!t) return null;
  if (/(mundane|physical)[^.;]*\b(reduced|mostly irrelevant|halved)/.test(t)) return 'resistant';
  if (/immune to (mundane|physical)|ignores mundane|cannot be harmed|incorporeal|projection/.test(t)) return 'immune';
  return null;
}

/** Style and shield for an authored NPC (its gear and attack names). */
export function enemyStyleFromNpc(npc) {
  const stats = npc?.stats || {};
  const equipment = stats.equipment || npc?.equipment || [];
  const attacks = (stats.attacks || npc?.attacks || []).map((a) => a?.name).filter(Boolean);
  return {
    style: inferFightingStyle(equipment, attacks),
    shield: equipment.find((e) => isShieldName(e)) || null,
  };
}

/** Style and shield from the weapon the GM names in [enemy_attack]. */
export function enemyStyleFromWeapon(weapon) {
  if (!weapon) return { style: 'none', shield: null };
  return { style: inferFightingStyle(weapon), shield: isShieldName(weapon) ? weapon : null };
}

/**
 * Roll the enemy's defence against a player attack made with attackerStyle.
 * Returns { roll, defence: 'block'|'dodge', blockDie, notes }.
 */
export function rollEnemyDefense(enemy, attackerStyle, roll = rollDiceExpression, { ignoreShield = false } = {}) {
  const style = enemy?.style || 'none';
  const defenses = enemy?.defenses || {};
  const blocks = style === 'shield' && !!enemy?.shield && !!defenses.block;
  const defence = blocks ? 'block' : 'dodge';
  const m = getMatchupModifiers(attackerStyle, style, defence, blocks);
  const base = roll(blocks ? defenses.block : (defenses.dodge || defenses.block || '10'));
  // A flail wraps around the shield: no shield bonus to the block roll.
  const shieldBonus = blocks && !ignoreShield ? Math.floor(getShieldRollBonus(enemy.shield) * m.shieldFactor) : 0;
  const notes = blocks && ignoreShield ? [...m.notes, 'The flail wraps around the shield: no shield bonus'] : [...m.notes];
  // Stunned, blinded or prone foes defend worse (utils/conditions.js).
  const cond = conditionMods(enemy?.conditions).defence;
  if (cond) notes.push(`${enemy.name} is ${conditionText(enemy.conditions, 'defence')} to defend`);
  return {
    roll: base + (enemy?.defenseModifier || 0) + shieldBonus + m.rollBonus + cond,
    defence,
    blockDie: blocks ? Math.max(2, Math.floor(getShieldSoakDie(enemy.shield) * m.shieldFactor)) : 0,
    notes,
  };
}
