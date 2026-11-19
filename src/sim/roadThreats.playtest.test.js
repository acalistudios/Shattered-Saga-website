// Road-threat scaling playtest (Hans 2026-11-18): "never too hard, just
// wearing". For each character level, each scaled road threat
// (utils/patrolEngine.js scaleRoadThreat) fights a spread of typical builds of
// a character who levels normally (simCore playerAt). Reports win rate and the
// share of HP lost by the winners. Skipped in normal runs:
//
//   cd C:\Users\hansi\_ACALI\work\ss-web
//   $env:BALANCE = '1'; npx vitest run src/sim/roadThreats.playtest.test.js; Remove-Item Env:BALANCE
//
// Target: typical builds win about 90%+ while losing roughly a quarter to a
// half of their HP; even a poorly suited build should usually survive.

/* global process */
import { describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { PATROL_FOES, scaleRoadThreat } from '../utils/patrolEngine';
import { enemyFrom, makeBuild, playerAt, winRate } from './simCore';

const RUN = !!process.env.BALANCE;
const N = Number(process.env.BALANCE_N || 300);
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 10];

// A spread of what players actually carry: light and heavy, every style.
const TYPICAL = [
  ['Sword + Iron Shield', 'Chainmail', 'block-trained'],
  ['Sword + Dagger', 'Leather + full leather set', 'dodge-trained'],
  ['War Scythe', 'Leather', 'dodge-trained'],
  ['Battle Axe', 'Chainmail', 'block-trained'],
  ['Mace + Iron Shield', 'Leather', 'block-trained'],
  ['Short Bow', 'Leather', 'dodge-trained'],
  ['Spear + Iron Shield', 'Chainmail + helm & gauntlets', 'block-trained'],
];
// A deliberately poor fit: no armour, no shield.
const POOR = ['Sword alone', 'No armour', 'dodge-trained'];

describe.skipIf(!RUN)('road threat scaling', () => {
  it('keeps road threats wearing but winnable at every level', () => {
    const threats = Object.entries(PATROL_FOES).filter(([, f]) => f.scaling);
    const pct = (v) => `${Math.round(v * 100)}%`;
    const rows = [];
    for (const level of LEVELS) {
      const player = playerAt(level);
      for (const [id, foe] of threats) {
        const scaled = scaleRoadThreat(foe, level);
        const e = enemyFrom(scaled, id);
        const typical = TYPICAL.map((t) => winRate(makeBuild(...t, player), e, N));
        const poor = winRate(makeBuild(...POOR, player), e, N);
        rows.push({
          level, id, attackers: scaled.attacksPerRound, hp: scaled.stats.HP, damage: scaled.stats.attacks[0].damage,
          win: typical.reduce((t, r) => t + r.win, 0) / typical.length,
          minWin: Math.min(...typical.map((r) => r.win)),
          hpLost: typical.reduce((t, r) => t + r.hpLostPct, 0) / typical.length,
          poorWin: poor.win, poorHpLost: poor.hpLostPct,
        });
      }
    }
    const lines = [
      '# Road threat scaling playtest', '',
      `${N} fights per build. Typical builds: ${TYPICAL.map((t) => t.join(' / ')).join('; ')}. Poor fit: ${POOR.join(' / ')}.`, '',
      '| Level | Threat | Attackers | Group HP | Damage | Typical win | Worst typical | HP lost (winners) | Poor-fit win | Poor-fit HP lost |',
      '|---|---|---|---|---|---|---|---|---|---|',
      ...rows.map((r) => `| ${r.level} | ${r.id} | ${r.attackers} | ${r.hp} | ${r.damage} | ${pct(r.win)} | ${pct(r.minWin)} | ${pct(r.hpLost)} | ${pct(r.poorWin)} | ${pct(r.poorHpLost)} |`),
    ];
    writeFileSync(new URL('./road-threats-report.md', import.meta.url), lines.join('\n'));
    // Compact console view: per level, averaged over the four threats.
    for (const level of LEVELS) {
      const rs = rows.filter((r) => r.level === level);
      const avg = (k) => rs.reduce((t, r) => t + r[k], 0) / rs.length;
      console.log(`L${level}: win ${pct(avg('win'))} (worst ${pct(Math.min(...rs.map((r) => r.minWin)))}), HP lost ${pct(avg('hpLost'))}, poor-fit win ${pct(avg('poorWin'))} | ${rs.map((r) => `${r.id.split('_')[0]} ${r.attackers}x ${pct(r.win)}/${pct(r.hpLost)}`).join(' · ')}`);
    }
  }, 1_800_000);
});
