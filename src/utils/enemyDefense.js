// How an enemy defends against the player's weapon attacks, with the fighting
// style matchups from data/gearStats.js (Hans 2026-11-17).
//
// An enemy with a shield and a Block defence blocks; everything else dodges,
// as before. A successful block still lets part of the blow through, the same
// rule the player's own Blocking follows.

import { getMatchupModifiers, getShieldRollBonus, getShieldSoakDie, inferFightingStyle, isShieldName } from '../data/gearStats';
import { rollDiceExpression } from './dice';

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
export function rollEnemyDefense(enemy, attackerStyle, roll = rollDiceExpression) {
  const style = enemy?.style || 'none';
  const defenses = enemy?.defenses || {};
  const blocks = style === 'shield' && !!enemy?.shield && !!defenses.block;
  const defence = blocks ? 'block' : 'dodge';
  const m = getMatchupModifiers(attackerStyle, style, defence, blocks);
  const base = roll(blocks ? defenses.block : (defenses.dodge || defenses.block || '10'));
  const shieldBonus = blocks ? Math.floor(getShieldRollBonus(enemy.shield) * m.shieldFactor) : 0;
  return {
    roll: base + (enemy?.defenseModifier || 0) + shieldBonus + m.rollBonus,
    defence,
    blockDie: blocks ? Math.max(2, Math.floor(getShieldSoakDie(enemy.shield) * m.shieldFactor)) : 0,
    notes: m.notes,
  };
}
