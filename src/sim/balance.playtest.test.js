// Balance playtest (Hans 2026-11-18): every gear build against every hostile
// NPC in the adventures, using the game's own gear tables, weight rules, enemy
// defence and matchup code (combat model in ./simCore.js). Skipped in normal
// test runs; run it with
//
//   cd C:\Users\hansi\_ACALI\work\ss-web
//   $env:BALANCE = '1'; npx vitest run src/sim/balance.playtest.test.js; Remove-Item Env:BALANCE
//
// Writes a report to src/sim/balance-report.md. The player is a level 1
// character; road threats appear in their level 2 shape.

/* global process */
import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { ADVENTURES_LIST } from '../data/adventures';
import { getWeaponType, MATCHUP, SHIELD_TYPES, DUAL_WIELD } from '../data/gearStats';
import { PATROL_FOES } from '../utils/patrolEngine';
import { ARENA_BRACKETS } from '../utils/arenaEngine';
import { DEFAULT_CFG, WEAPONS, ARMOUR, FOCUS, enemyFrom, makeBuild, playerAt, winRate as simWinRate } from './simCore';

const RUN = !!process.env.BALANCE;
const N = Number(process.env.BALANCE_N || 400);
// Tuning knobs for trying rule changes before they go in the game:
//   minHit:      least damage an enemy hit does after your armour (game: 1)
//   chainDodge:  dodge penalty of medium armour (game: -1)
//   pieceDiv:    armour-piece points per +1 soak (game: 4)
//   lightDodge:  dodge bonus with light or no body armour (game: 0)
//   metalPts / leatherPts: points per piece (game: 2 / 1)
//   metalBlock:  block penalty per two metal pieces (game: 0.5, i.e. -1 for 4)
//   matchup / shields / dual: overrides for the gearStats tables
const CFG = { ...DEFAULT_CFG, ...JSON.parse(process.env.BALANCE_CFG || '{}') };
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

const winRate = (b, e) => simWinRate(b, e, N, CFG);

describe.skipIf(!RUN)('balance playtest', () => {
  it('runs every build against every hostile NPC', () => {
    const enemies = [
      ...ADVENTURES_LIST.flatMap((a) => (a.npcs || []).filter((n) => FOES.has(n.name)).map((n) => enemyFrom(n, a.id))),
      ...Object.values(PATROL_FOES).map((f) => enemyFrom(f, 'patrol')),
      ...ARENA_BRACKETS.slice(0, 2).map((b) => enemyFrom(b.opponent, 'arena')),
    ].filter(Boolean);
    const builds = [];
    const player = playerAt(1);
    for (const w of Object.keys(WEAPONS)) for (const a of Object.keys(ARMOUR)) for (const f of FOCUS) {
      if (getWeaponType(WEAPONS[w].hand_right)?.ranged && f === 'block-trained') continue;
      builds.push(makeBuild(w, a, f, player, CFG));
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
