// Style-vs-style duel simulator (Hans 2026-11-17).
//
//   cd <your ss-web checkout>
//   node scripts/combat-matchups.mjs
//
// Two fighters with identical stats (Coord/Power/Vigor 3, skills 2, light
// armour, 16 HP) and different gear fight to the end, alternating who strikes
// first. Rolls mirror hooks/useGameState.js; gear and matchup rules come from
// src/data/gearStats.js. Target: two-handed > shield > dual > two-handed,
// ranged strong except against shields, each edge close (about 55-65%).

import {
  getWeaponType, getShieldSoakDie, getShieldRollBonus, getParryDie, getDualWieldPenalty,
  isTwoHandedMelee, TWO_HAND_DAMAGE_BONUS, getPlayerFightingStyle, getMatchupModifiers,
  MATCHUP, SHIELD_TYPES, DUAL_WIELD, WEAPON_TYPES,
} from '../src/data/gearStats.js';

// Optional overrides for tuning: node scripts/combat-matchups.mjs '{"twoHand":0,"polearm":"1d12"}'
const T = JSON.parse(process.argv[2] || '{}');
Object.assign(MATCHUP, T.matchup || {});
if (T.ironBonus !== undefined) SHIELD_TYPES.find((s) => s.key === 'metal').rollBonus = T.ironBonus;
if (T.dualMedium) DUAL_WIELD.medium = T.dualMedium;
if (T.dualSmall) DUAL_WIELD.small = T.dualSmall;
if (T.polearm) WEAPON_TYPES.find((w) => w.key === 'polearm').dice = T.polearm;
for (const [key, dice] of Object.entries(T.dice || {})) WEAPON_TYPES.find((w) => w.key === key).dice = dice;
const TWO_HAND = T.twoHand ?? TWO_HAND_DAMAGE_BONUS;
const N = T.n || 20000;
const d = (s) => Math.floor(Math.random() * s) + 1;
const nd = (n, s) => { let t = 0; for (let i = 0; i < n; i++) t += d(s); return t; };
const expr = (e) => e.split('+').reduce((t, p) => {
  const m = p.trim().match(/^(\d*)d(\d+)$/);
  return t + (m ? nd(Number(m[1] || 1), Number(m[2])) : Number(p));
}, 0);
const primary = (s) => d([4, 4, 6, 8, 10, 12, 20][Math.min(s, 6)]);
const secondary = (s) => ({ 1: () => d(2), 2: () => d(2) + 1, 3: () => d(4), 4: () => d(4) + 1, 5: () => d(6), 6: () => d(10) })[Math.min(Math.max(s, 1), 6)]();
const STATS = { coord: 3, power: 3, vigor: 3, skill: 2, blocking: 2, acrobatics: 2 };

const BUILDS = {
  'Two-handed (War Scythe)': { hand_right: 'Iron War Scythe' },
  'Two-handed (Greatsword)': { hand_right: 'Greatsword' },
  'Sword + Iron Shield': { hand_right: 'Steel Sword', hand_left: 'Iron Shield' },
  'Dual (Sword + Dagger)': { hand_right: 'Steel Sword', hand_left: 'Dagger' },
  'Dual (Two Daggers)': { hand_right: 'Dagger', hand_left: 'Dagger' },
  'Ranged (Longbow)': { hand_right: 'Longbow' },
};

function fighter(eq) {
  const ranged = getWeaponType(eq.hand_right)?.ranged;
  const style = getPlayerFightingStyle(eq, ranged ? 'ranged' : 'melee');
  const shield = [eq.hand_right, eq.hand_left].find((i) => i && /shield/i.test(i)) || null;
  const strikes = style === 'dual'
    ? [{ item: eq.hand_right, pen: getDualWieldPenalty(eq.hand_right, 'main') }, { item: eq.hand_left, pen: getDualWieldPenalty(eq.hand_left, 'off') }]
    : [{ item: eq.hand_right, pen: { hit: 0, damage: 0 } }];
  return { eq, style, shield, strikes, weapon: eq.hand_right, defence: shield ? 'block' : 'dodge' };
}

function defend(def, attackerStyle) {
  const m = getMatchupModifiers(attackerStyle, def.style, def.defence, !!def.shield);
  let roll;
  if (def.defence === 'dodge') roll = primary(STATS.coord) + secondary(STATS.vigor) + nd(STATS.acrobatics, 2);
  else roll = primary(STATS.power) + secondary(STATS.coord) + nd(STATS.blocking, 2) + Math.floor(getShieldRollBonus(def.shield) * m.shieldFactor);
  return { roll: roll + m.rollBonus, m };
}

function strike(att, def, s) {
  const atk = primary(STATS.coord) + primary(STATS.power) + nd(STATS.skill, 2) + s.pen.hit;
  const { roll, m } = defend(def, att.style);
  const w = getWeaponType(s.item);
  const dmg = Math.max(0, expr(w.dice) + (isTwoHandedMelee(w) ? TWO_HAND : 0) + s.pen.damage);
  const armour = d(3);
  if (roll < atk) return Math.max(0, dmg + Math.floor((atk - roll) / 3) - armour);
  if (def.defence === 'dodge') return 0;
  let block = 0;
  if (def.shield) block = d(Math.max(2, Math.floor(getShieldSoakDie(def.shield) * m.shieldFactor)));
  else if (m.canParry) block = d(getParryDie(def.weapon) || 1);
  return Math.max(0, dmg - armour - block);
}

// Each fighter picks Dodge or Block for the matchup: b's best answer to a's
// default, then a's best answer to that (a player would learn this quickly).
function winRate(a, b, n = N) {
  let w = 0; for (let i = 0; i < n; i++) if (duel(a, b)) w++;
  return w / n;
}
function withBestDefences(a, b) {
  const opts = (f) => (f.style === 'ranged' ? ['dodge'] : ['dodge', 'block']).map((defence) => ({ ...f, defence }));
  const bBest = opts(b).reduce((best, o) => (1 - winRate(a, o, 1500) > 1 - winRate(a, best, 1500) ? o : best));
  const aBest = opts(a).reduce((best, o) => (winRate(o, bBest, 1500) > winRate(best, bBest, 1500) ? o : best));
  return [aBest, bBest];
}

function duel(a, b) {
  const hp = [16, 16];
  const order = Math.random() < 0.5 ? [[a, b, 1], [b, a, 0]] : [[b, a, 0], [a, b, 1]];
  for (let round = 0; round < 60; round++) {
    for (const [att, def, target] of order) {
      for (const s of att.strikes) {
        hp[target] -= strike(att, def, s);
        if (hp[target] <= 0) return target === 1; // true = a won
      }
    }
  }
  return hp[0] > hp[1];
}

const names = Object.keys(BUILDS);
const pad = 24;
if (T.score) {
  // Compact output for tuning: the six matchups that define the cycle.
  const pairs = [['Two-handed (War Scythe)', 'Sword + Iron Shield'], ['Sword + Iron Shield', 'Dual (Sword + Dagger)'],
    ['Dual (Sword + Dagger)', 'Two-handed (War Scythe)'], ['Ranged (Longbow)', 'Two-handed (War Scythe)'],
    ['Ranged (Longbow)', 'Dual (Sword + Dagger)'], ['Sword + Iron Shield', 'Ranged (Longbow)'], ['Dual (Two Daggers)', 'Two-handed (War Scythe)']];
  const res = pairs.map(([x, y]) => {
    const [a, b] = withBestDefences(fighter(BUILDS[x]), fighter(BUILDS[y]));
    return `${Math.round(100 * winRate(a, b))}${a.defence[0]}${b.defence[0]}`;
  });
  console.log(`2H>Sh ${res[0]}  Sh>Du ${res[1]}  Du>2H ${res[2]}  R>2H ${res[3]}  R>Du ${res[4]}  Sh>R ${res[5]}  Dg>2H ${res[6]}   ${process.argv[2]}`);
  process.exit(0);
}
console.log(`Win % of the ROW build against the COLUMN build (${N} duels each)\n`);
console.log(''.padEnd(pad) + names.map((n) => n.split(' (')[0].padStart(11)).join(''));
for (const an of names) {
  const row = names.map((bn) => {
    if (an === bn) return '     -     ';
    const [a, b] = withBestDefences(fighter(BUILDS[an]), fighter(BUILDS[bn]));
    return `${(100 * winRate(a, b)).toFixed(0)}%`.padStart(11);
  });
  console.log(an.padEnd(pad) + row.join(''));
}
