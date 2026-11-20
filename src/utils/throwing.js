// Resolving one throw (Hans 2026-11-20). The hook rolls the attack and the
// foe's defence; this decides what lands. Profiles come from
// utils/ammoRecovery.js getThrownProfile (weapons and data/gearStats.js
// THROWN_ITEMS).
//
// - Nothing thrown affects an incorporeal foe except holy water, which also
//   weakens it (steel can harm it afterwards).
// - Holy water deals its dice only to undead, demons and spirits; 1 otherwise.
// - Acid and holy water ignore armour; other throws are soaked as usual.
// - A shield that wins the defence still lets part through (same rule as
//   arrows); a net cannot be blocked, only dodged.

import { rollDiceExpression } from './dice';
import { mundaneDamageFactor } from './enemyDefense';

const UNHOLY = /\b(undead|demon\w*|wraith|ghost|ghoul|spectr\w*|specter|skeleton|zombie|fiend|lich|vampire|shade|phantom|spirit|revenant|possess\w*|malachar|abyssal|infernal|hellhound)/i;

/** Undead, demons and spirits, by name, role or description, or an incorporeal foe. */
export function isUnholy(enemy) {
  if (enemy?.mundaneImmunity === 'immune') return true;
  return UNHOLY.test([enemy?.name, enemy?.role, enemy?.desc, enemy?.special].filter(Boolean).join(' '));
}

export function isIncorporeal(enemy) {
  return enemy?.mundaneImmunity === 'immune' && !enemy?.weakened;
}

/** 0-3 rounds in the net. */
export const rollEntangleRounds = (rollDie) => rollDie(4) - 1;

/**
 * @param profile   thrown profile
 * @param enemy     the foe
 * @param hit       the attack beat the foe's defence
 * @param blocked   the foe's shield won (only when it can block this throw)
 * @param blockDie  the shield's die when blocked
 * @param bonusDamage morality/magic/keystone bonus for weapon throws
 * Returns { outcome: 'hit'|'blocked'|'miss'|'no_effect', raw, soak, damage, entangleRounds, weakens, note }
 */
export function resolveThrow({ profile, enemy, hit, blocked = false, blockDie = 0, bonusDamage = 0, critical = 0, roll = rollDiceExpression, rollDie }) {
  const out = { outcome: 'miss', raw: 0, soak: 0, damage: 0, entangleRounds: 0, weakens: false, critical: 0, note: '' };
  if (isIncorporeal(enemy) && !profile.holy) {
    return { ...out, outcome: 'no_effect', note: `It passes straight through ${enemy.name}: only holy water touches an incorporeal foe` };
  }
  if (!hit && !blocked) return out;

  if (profile.effect === 'entangle') {
    if (!hit) return out;
    const rounds = rollEntangleRounds(rollDie);
    return { ...out, outcome: 'hit', entangleRounds: rounds, note: rounds > 0 ? `${enemy.name} is entangled for ${rounds} round${rounds === 1 ? '' : 's'}` : `${enemy.name} shrugs the net off at once` };
  }

  const unholy = isUnholy(enemy);
  const raw = profile.holy
    ? (unholy ? roll(profile.dice) : 1)
    : roll(profile.dice) + (profile.consumed ? 0 : bonusDamage);
  const soak = profile.ignoresArmor ? 0 : Math.max(0, roll(enemy?.armorSoak || '1d3') - (profile.pierce || 0));
  const shield = blocked ? rollDie(blockDie) : 0;
  // A critical hit (utils/criticals.js) adds its bonus to a clean hit.
  const crit = hit ? critical : 0;
  let damage = hit ? Math.max(1, raw - soak) + crit : Math.max(0, raw - soak - shield);
  // Foes that only shrug off mundane harm (not incorporeal) take half from
  // anything but holy water.
  if (!profile.holy) {
    const f = mundaneDamageFactor(enemy, { magical: false });
    if (f.factor !== 1) damage = Math.floor(damage * f.factor);
  }
  const weakens = Boolean(profile.holy && hit && enemy?.mundaneImmunity && !enemy?.weakened);
  const note = [
    profile.holy && !unholy ? 'Holy water only stings the living: 1 damage' : '',
    profile.ignoresArmor && !profile.holy ? 'Acid ignores armour' : '',
    weakens ? `The holy water burns ${enemy.name}: it is weakened, and steel can now harm it` : '',
    blocked ? `Caught on the shield (1d${blockDie}: ${shield})` : '',
  ].filter(Boolean).join('. ');
  return { ...out, outcome: hit ? 'hit' : 'blocked', raw, soak, damage, weakens, critical: crit, note };
}

/** Smoke: the number of rounds the choking cloud lasts. */
export const SMOKE_ROUNDS = 3;
