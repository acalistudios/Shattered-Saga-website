// Balance playtest (Hans 2026-11-18): every gear build against every hostile
// NPC in the adventures, using the game's own gear tables, weight rules, enemy
// defence and matchup code. Skipped in normal test runs; run it with
//
//   cd C:\Users\hansi\_ACALI\work\ss-web
//   $env:BALANCE = '1'; npx vitest run src/sim/balance.playtest.test.js; Remove-Item Env:BALANCE
//
// Writes a report to src/sim/balance-report.md.
//
// Model: one player vs one foe, player strikes first, foe answers once a round.
// The player picks whichever of Dodge or Block works better for that build.
// Enemy attack rolls come from each NPC's own attributes and skills (in play
// the GM picks the dice, guided by the same stat block).

/* global process */
import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { ADVENTURES_LIST } from '../data/adventures';
import {
  getWeaponType, getArmorType, getArmorPieces, getShieldRollBonus, getShieldSoakDie, getParryDie,
  getDualWield, getDualWieldPenalty, isTwoHandedMelee, TWO_HAND_DAMAGE_BONUS, getPlayerFightingStyle,
  getMatchupModifiers, isShieldName, traitDamageMods,
} from '../data/gearStats';
import { calculateWeightAndVolume, getItemDetails } from '../utils/items';
import { enemyStyleFromNpc, rollEnemyDefense, mundaneImmunityFromArmor } from '../utils/enemyDefense';
import { rollDiceExpression as roll } from '../utils/dice';
import { PATROL_FOES } from '../utils/patrolEngine';
import { ARENA_BRACKETS } from '../utils/arenaEngine';
import { MATCHUP, SHIELD_TYPES, DUAL_WIELD } from '../data/gearStats';

const RUN = !!process.env.BALANCE;
const N = Number(process.env.BALANCE_N || 400);
// Tuning knobs for trying rule changes before they go in the game:
//   minHit:      least damage an enemy hit does after your armour (game: 0)
//   chainDodge:  dodge penalty of medium armour (game: -1)
//   pieceDiv:    armour-piece points per +1 soak (game: 4)
//   lightDodge:  dodge bonus with light or no body armour (game: 0)
//   matchup / shields / dual: overrides for the gearStats tables
//   metalPts / leatherPts: points per piece (game: 2 / 1)
//   metalBlock:  block penalty per two metal pieces (game: 0)
// Defaults match the game as shipped (2026-11-18).
const CFG = { minHit: 1, chainDodge: -1, pieceDiv: 4, lightDodge: 0, metalPts: 2, leatherPts: 1, metalBlock: 0.5, ...JSON.parse(process.env.BALANCE_CFG || '{}') };
Object.assign(MATCHUP, CFG.matchup || {});
for (const [key, v] of Object.entries(CFG.shields || {})) Object.assign(SHIELD_TYPES.find((s) => s.key === key), v);
Object.assign(DUAL_WIELD, CFG.dual || {});

// Foes a player actually fights (not townsfolk or companions), plus the
// repeatable road patrols and arena bouts. Huge story bosses are kept apart.
const FOES = new Set(['Skritt', 'Threx', 'Saltblood Guard', 'Redvein-Possessed Prisoner', 'Mother Silken', 'Deep Molt Horror',
  'Briar-Eyed Leth', 'The Vesper Knife', 'The Cinder Stag', 'The Granite Matron', 'The Mirror of Affinity', 'Tamsin Crowe',
  'Rusk Fen', 'Drowned Guardian', 'Tide Bailiff', 'Unit-7 (Nanny)', 'Volcanic Warden', 'Durn Ashjaw', 'Cassia Redhand',
  'Matron 12', 'The Silver Contrary', 'Vortex Elemental', 'Gravity-Warped Guardian', 'Frostbite Spiders', 'The Guardian Golem',
  'Zephyr Gale-Rider', 'Lothar the Smelter']);

const d = (s) => Math.floor(Math.random() * s) + 1;
const nd = (n, s) => { let t = 0; for (let i = 0; i < n; i++) t += d(s); return t; };
const primary = (s) => (s >= 7 ? d(20) + d([4, 6, 8, 10, 12][Math.min(s, 11) - 7] || 12) : d([4, 4, 6, 8, 10, 12, 20][Math.max(1, s)]));
const secondary = (s) => ({ 1: () => d(2), 2: () => d(2) + 1, 3: () => d(4), 4: () => d(4) + 1, 5: () => d(6), 6: () => d(10) })[Math.min(Math.max(s || 1, 1), 6)]();

// ---------------------------------------------------------------- enemies
const SKILL_KEYS = {
  heavy: { keys: ['HeavyWeapons', 'TwoHandedWeapons'], primary: 'Power', secondary: 'Vigor' },
  light: { keys: ['LightWeapons', 'OneHandedWeapons'], primary: 'Coordination', secondary: 'Power' },
  ranged: { keys: ['Marksmanship'], primary: 'Coordination', secondary: 'Intellect' },
  brawl: { keys: ['Brawling'], primary: 'Power', secondary: 'Vigor' },
};
function enemyFrom(npc, adventure) {
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
    name: `${npc.name} (${adventure})`,
    hp: s.HP,
    attack: () => primary(attrs[sk.primary] || 2) + secondary(attrs[sk.secondary] || 2) + nd(ranks, 2),
    attackAvg: 0,
    damage: dmgMatch ? dmgMatch[1].replace(/\s/g, '') : '1d6',
    damageType: (dmgMatch?.[2] || 'edged').toLowerCase(),
    soak,
    defenses: s.defenses,
    style: style.style,
    shield: style.shield,
    attacksPerRound: npc.attacksPerRound || 1,
    roadThreat: (npc.attacksPerRound || 1) > 1,
  };
}

// ---------------------------------------------------------------- builds
const KIT = ['Bedroll', 'Rations (5)', 'Tinderbox', 'Waterskin', 'Small Backpack'];
const WEAPONS = {
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
const ARMOUR = {
  'No armour': {},
  'Leather': { body: 'Leather Armor' },
  'Leather + full leather set': { body: 'Leather Armor', head: 'Leather Helmet', legs: 'Leather Pants', feet: 'Leather Boots', hands: 'Leather Gloves' },
  'Chainmail': { body: 'Steel Chainmail' },
  'Chainmail + helm & gauntlets': { body: 'Steel Chainmail', head: 'Plate Helm', hands: 'Plate Gauntlets' },
  'Chainmail + full metal set': { body: 'Steel Chainmail', head: 'Iron Plate Helm', legs: 'Plate Greaves', feet: 'Steel Sabatons', hands: 'Plate Gauntlets' },
};
// Same 4 defence ranks spent two ways.
const FOCUS = { 'dodge-trained': { acrobatics: 3, blocking: 1 }, 'block-trained': { acrobatics: 1, blocking: 3 } };

function makeBuild(wName, aName, fName) {
  const equipment = { ...WEAPONS[wName], ...ARMOUR[aName], backpack: 'Small Backpack' };
  const worn = Object.values(equipment).filter(Boolean);
  const inventory = [...new Set([...worn, ...KIT])];
  const ranged = !!getWeaponType(equipment.hand_right)?.ranged;
  if (ranged) inventory.push('Arrows (20)');
  const character = { attributes: { coordination: 3, power: 3, vigor: 3 }, equipment, inventory };
  const enc = calculateWeightAndVolume(character);
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
  return {
    name: `${wName} · ${aName} · ${fName}`, wName, aName, fName, equipment, style, ranged, strikes, shield,
    skills: { weapon: 2, ...FOCUS[fName] },
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

function fight(b, e, defence) {
  let php = 16;
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
        const atk = primary(3) + primary(3) + nd(b.skills.weapon, 2) + s.pen.hit + b.load + (w?.hitMod || 0) + (w?.quick ? w.quick.hit : 0);
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
      if (defence === 'dodge') pr = primary(3) + secondary(3) + nd(b.skills.acrobatics, 2) + b.dodgePen + b.load + m.rollBonus + situational;
      else pr = primary(3) + secondary(3) + nd(b.skills.blocking, 2) + Math.floor(getShieldRollBonus(b.shield) * m.shieldFactor) + b.load + m.rollBonus + b.blockPen + situational;
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

function winRate(b, e) {
  const best = { win: -1 };
  for (const defence of ['dodge', 'block']) {
    if (defence === 'block' && !b.shield && !(getParryDie(b.strikes[0].item))) continue;
    let w = 0; let hp = 0;
    for (let i = 0; i < N; i++) { const r = fight(b, e, defence); if (r.win) { w++; hp += r.hp; } }
    if (w / N > best.win) Object.assign(best, { win: w / N, hpLeft: w ? hp / w : 0, defence });
  }
  return best;
}

describe.skipIf(!RUN)('balance playtest', () => {
  it('runs every build against every hostile NPC', () => {
    const enemies = [
      ...ADVENTURES_LIST.flatMap((a) => (a.npcs || []).filter((n) => FOES.has(n.name)).map((n) => enemyFrom(n, a.id))),
      ...Object.values(PATROL_FOES).map((f) => enemyFrom(f, 'patrol')),
      ...ARENA_BRACKETS.slice(0, 2).map((b) => enemyFrom(b.opponent, 'arena')),
    ].filter(Boolean);
    const builds = [];
    for (const w of Object.keys(WEAPONS)) for (const a of Object.keys(ARMOUR)) for (const f of Object.keys(FOCUS)) {
      if (getWeaponType(WEAPONS[w].hand_right)?.ranged && f === 'block-trained') continue;
      builds.push(makeBuild(w, a, f));
    }
    const rows = builds.map((b) => {
      const res = enemies.map((e) => winRate(b, e));
      const avg = res.reduce((t, r) => t + r.win, 0) / res.length;
      const worst = Math.min(...res.map((r) => r.win));
      return { b, res, avg, worst };
    });
    // How often each build is the best (or within 3 points of the best) against an enemy.
    enemies.forEach((_, i) => {
      const top = Math.max(...rows.map((r) => r.res[i].win));
      rows.forEach((r) => { r.nearBest = (r.nearBest || 0) + (r.res[i].win >= top - 0.03 ? 1 : 0); });
    });
    rows.sort((x, y) => y.avg - x.avg);
    const pct = (v) => `${Math.round(v * 100)}%`;
    const lines = [
      `# Balance playtest`, '',
      `${enemies.length} hostile NPCs from the adventures (puzzle-immune bosses excluded), ${builds.length} builds, ${N} fights per build per enemy.`,
      `Player: Coordination/Power/Vigor 3, weapon skill 2, 4 defence ranks (dodge-trained 3/1 or block-trained 1/3), 16 HP.`, '',
      '| Build | Avg win | Worst | Near-best vs | Cost | Weight | Load penalty |',
      '|---|---|---|---|---|---|---|',
      ...rows.map((r) => `| ${r.b.name} | ${pct(r.avg)} | ${pct(r.worst)} | ${r.nearBest}/${enemies.length} | ${(r.b.cost / 100).toFixed(1)} gp | ${r.b.weight}/${r.b.maxWeight} lb | ${r.b.load} |`),
      '', '## Enemies', '',
      '| Enemy | Style | HP | Damage | Best build | Best win | Worst build | Worst win |', '|---|---|---|---|---|---|---|---|',
      ...enemies.map((e, i) => {
        const sorted = [...rows].sort((x, y) => y.res[i].win - x.res[i].win);
        return `| ${e.name} | ${e.style} | ${e.hp} | ${e.damage} | ${sorted[0].b.name} | ${pct(sorted[0].res[i].win)} | ${sorted.at(-1).b.name} | ${pct(sorted.at(-1).res[i].win)} |`;
      }),
    ];
    // Summaries: the best each weapon style and each armour can do, and how
    // many different styles sit near the top (more = more viable choices).
    const bestBy = (key) => {
      const m = {};
      for (const r of rows) if (!m[r.b[key]] || r.avg > m[r.b[key]].avg) m[r.b[key]] = r;
      return Object.entries(m).sort((x, y) => y[1].avg - x[1].avg);
    };
    const top = rows[0].avg;
    const viable = rows.filter((r) => r.avg >= top - 0.05);
    // The level 2+ road threats (multi-attack mobs): which armour does best there?
    const roadIdx = enemies.map((e, i) => (e.roadThreat ? i : -1)).filter((i) => i >= 0);
    const roadAvg = (r) => roadIdx.reduce((t, i) => t + r.res[i].win, 0) / (roadIdx.length || 1);
    const roadByArmour = {};
    for (const r of rows) roadByArmour[r.b.aName] = Math.max(roadByArmour[r.b.aName] || 0, roadAvg(r));
    const roadByWeapon = {};
    for (const r of rows) roadByWeapon[r.b.wName] = Math.max(roadByWeapon[r.b.wName] || 0, roadAvg(r));
    const summary = [
      `CFG ${JSON.stringify(CFG)}  enemies ${enemies.length}  N ${N}`,
      'Best by weapon: ' + bestBy('wName').map(([k, r]) => `${k} ${pct(r.avg)} (${r.b.aName}, ${r.b.fName})`).join(' | '),
      'Best by armour: ' + bestBy('aName').map(([k, r]) => `${k} ${pct(r.avg)}`).join(' | '),
      `Within 5 pts of top (${pct(top)}): ${viable.length} builds, weapons: ${[...new Set(viable.map((r) => r.b.wName))].join(', ')}; armour: ${[...new Set(viable.map((r) => r.b.aName))].join(', ')}`,
      'Top 6: ' + rows.slice(0, 6).map((r) => `${r.b.name} ${pct(r.avg)}`).join(' | '),
      `Road threats (${roadIdx.length}) best by armour: ` + Object.entries(roadByArmour).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${pct(v)}`).join(' | '),
      'Road threats best by weapon: ' + Object.entries(roadByWeapon).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${pct(v)}`).join(' | '),
    ];
    lines.splice(4, 0, ...summary.map((l) => `- ${l}`), '');
    writeFileSync(new URL('./balance-report.md', import.meta.url), lines.join('\n'));
    console.log(summary.join('\n'));
  }, 1_800_000);
});
