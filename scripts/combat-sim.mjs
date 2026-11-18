// Duel simulator for weapon balance (Hans 2026-11-17).
//
//   cd C:\Users\hansi\_ACALI\work\ss-web
//   node scripts/combat-sim.mjs
//
// Mirrors the engine's rolls in hooks/useGameState.js (executeCombatManeuver,
// the defence resolver) using the real gear table in src/data/gearStats.js.
// One player vs one enemy; the player strikes first, the enemy answers once a
// round. Defence: the build defends with whichever of Dodge or Block wins more
// often for it, so the numbers show each style at its best.

import {
  getWeaponType, getShieldSoakDie, getShieldRollBonus, getParryDie, getDualWield, getDualWieldPenalty,
  isTwoHandedMelee, TWO_HAND_DAMAGE_BONUS,
} from '../src/data/gearStats.js';

const N = 20000;
const d = (s) => Math.floor(Math.random() * s) + 1;
const nd = (n, s) => { let t = 0; for (let i = 0; i < n; i++) t += d(s); return t; };
const expr = (e) => e.split('+').reduce((t, p) => {
  const m = p.trim().match(/^(\d*)d(\d+)$/);
  return t + (m ? nd(Number(m[1] || 1), Number(m[2])) : Number(p));
}, 0);
const primary = (s) => [4, 4, 6, 8, 10, 12, 20][Math.min(s, 6)] && d([4, 4, 6, 8, 10, 12, 20][Math.min(s, 6)]);
const secondary = (s) => ({ 1: () => d(2), 2: () => d(2) + 1, 3: () => d(4), 4: () => d(4) + 1, 5: () => d(6), 6: () => d(10) })[Math.min(Math.max(s, 1), 6)]();

const PLAYER = { coord: 3, power: 3, vigor: 3, weaponSkill: 2, blocking: 2, acrobatics: 2, armour: 'light' };
const ARMOUR = { none: () => 0, light: () => d(3), medium: () => d(4), heavy: () => d(6) };
const DODGE_PEN = { none: 0, light: 0, medium: -1, heavy: -2 };

const ENEMIES = {
  'Mine guard (weak)': { attack: () => d(8) + d(2) + 1 + nd(1, 2), dmg: '1d6', dodge: () => d(6) + d(2) + 1, soak: () => d(3), hp: 14 },
  'Mine boss (medium)': { attack: () => d(8) + d(4) + nd(2, 2), dmg: '1d6', dodge: () => d(8) + d(4) + 1, soak: () => d(4), hp: 18 },
  'Brute (strong)': { attack: () => d(12) + d(4) + nd(4, 2), dmg: '1d8+1', dodge: () => d(8) + d(4), soak: () => d(4), hp: 16 },
};

function strikesFor(build, rules) {
  const eq = { hand_right: build.right, hand_left: build.left };
  const dual = getDualWield(eq);
  if (dual) {
    const pen = (w, h) => (rules.oldDual ? (h === 'main' ? { hit: -2, damage: -1 } : { hit: -4, damage: -2 }) : getDualWieldPenalty(w, h));
    return [{ item: dual.main, pen: pen(dual.main, 'main') }, { item: dual.off, pen: pen(dual.off, 'off') }];
  }
  const main = [build.right, build.left].find((i) => i && !/shield/i.test(i));
  return [{ item: main, pen: { hit: 0, damage: 0 } }];
}

function weaponDice(item, rules) {
  const w = getWeaponType(item);
  if (rules.old && w?.key === 'polearm') return { dice: '1d10', bonus: 0 };
  const dice = rules.polearm && w?.key === 'polearm' ? rules.polearm : w.dice;
  const twoHand = rules.twoHand ?? TWO_HAND_DAMAGE_BONUS;
  return { dice, bonus: !rules.old && isTwoHandedMelee(w) ? twoHand : 0 };
}

function fight(build, enemy, defence, rules) {
  let php = 10 + PLAYER.vigor * 2;
  let ehp = enemy.hp;
  const strikes = strikesFor(build, rules);
  const shield = [build.right, build.left].find((i) => i && /shield/i.test(i));
  const parryWeapon = strikes[0].item;
  for (let round = 1; round <= 40; round++) {
    for (const s of strikes) {
      if (ehp <= 0) break;
      const roll = primary(PLAYER.coord) + primary(PLAYER.power) + nd(PLAYER.weaponSkill, 2) + s.pen.hit;
      if (roll >= enemy.dodge()) {
        const { dice, bonus } = weaponDice(s.item, rules);
        const raw = Math.max(0, expr(dice) + bonus + s.pen.damage);
        ehp -= Math.max(1, raw - enemy.soak());
      }
    }
    if (ehp <= 0) return { win: true, round, php };

    const atk = enemy.attack();
    let def;
    if (defence === 'dodge') def = primary(PLAYER.coord) + secondary(PLAYER.vigor) + nd(PLAYER.acrobatics, 2) + DODGE_PEN[PLAYER.armour];
    else def = primary(PLAYER.power) + secondary(PLAYER.coord) + nd(PLAYER.blocking, 2) + (shield && !rules.old ? (rules.shieldRoll ?? getShieldRollBonus(shield)) : 0);
    const armour = ARMOUR[PLAYER.armour]();
    let taken = 0;
    if (def < atk) {
      taken = Math.max(0, expr(enemy.dmg) + Math.floor((atk - def) / 3) - armour);
    } else if (defence === 'block') {
      let block = 0;
      if (shield) block = d(getShieldSoakDie(shield));
      else if (!rules.old && getParryDie(parryWeapon)) block = d(getParryDie(parryWeapon));
      taken = Math.max(0, expr(enemy.dmg) - armour - block);
    }
    php -= taken;
    if (php <= 0) return { win: false, round, php: 0 };
  }
  return { win: false, round: 40, php };
}

function run(build, enemy, rules) {
  const results = {};
  for (const defence of ['dodge', 'block']) {
    let wins = 0, rounds = 0, hpLeft = 0;
    for (let i = 0; i < N; i++) {
      const r = fight(build, enemy, defence, rules);
      if (r.win) { wins++; hpLeft += r.php; }
      rounds += r.round;
    }
    results[defence] = { win: wins / N, rounds: rounds / N, hpLeft: wins ? hpLeft / wins : 0 };
  }
  const best = results.block.win > results.dodge.win ? 'block' : 'dodge';
  return { ...results[best], defence: best };
}

const BUILDS = [
  { name: 'Sword + Iron Shield', right: 'Steel Sword', left: 'Iron Shield', cost: 450 },
  { name: 'War Scythe (2H)', right: 'Iron War Scythe', left: null, cost: 500 },
  { name: 'Two Daggers', right: 'Dagger', left: 'Dagger', cost: 40 },
  { name: 'Sword + Dagger', right: 'Steel Sword', left: 'Dagger', cost: 220 },
  { name: 'Two Swords', right: 'Steel Sword', left: 'Steel Sword', cost: 400 },
  { name: 'Sword alone', right: 'Steel Sword', left: null, cost: 200 },
];

const armourArg = process.argv[2];
if (armourArg) PLAYER.armour = armourArg;

const SCENARIOS = [
  ['BEFORE (live today)', { old: true, oldDual: true }],
  ['AFTER (gear table as committed)', {}],
  ['Variant: two-handers without the +1', { twoHand: 0 }],
  ['Variant: scythe 1d12, no +1', { twoHand: 0, polearm: '1d12' }],
];
const only = process.argv[3];
for (const [label, rules] of SCENARIOS.filter((s, i) => !only || only.split(',').includes(String(i)))) {
  console.log(`\n=== ${label} · player Coord/Power/Vigor 3, skills 2, ${PLAYER.armour} armour, ${10 + PLAYER.vigor * 2} HP ===`);
  for (const [ename, enemy] of Object.entries(ENEMIES)) {
    console.log(`\n${ename}`);
    for (const b of BUILDS) {
      const r = run(b, enemy, rules);
      console.log(`  ${b.name.padEnd(22)} win ${(r.win * 100).toFixed(0).padStart(3)}%  HP left ${r.hpLeft.toFixed(1).padStart(4)}  rounds ${r.rounds.toFixed(1).padStart(4)}  (${r.defence})`);
    }
  }
}
