// Builds src/data/GAME_RULES.md from the rules the game actually uses
// (Hans 2026-11-20). The manual used to be a hand-kept copy and drifted: wrong
// profession skills, morality thresholds, armour dice, inn healing. Now:
// - the rules text comes from the in-game Rules page (data/rulesHelp.js);
// - professions, skills and attributes come from data/gms.js.
// gameRulesDoc.test.js fails when the file is out of date; regenerate with
//   $env:UPDATE_RULES='1'; npx vitest run src/data/gameRulesDoc.test.js

import { GAME_RULES_SECTIONS } from './rulesHelp';
import { SKILLS_LIST, PROFESSIONS_LIST } from './gms';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function buildGameRulesMarkdown() {
  const skillName = (id) => SKILLS_LIST.find((s) => s.id === id)?.name || id;
  const out = [
    '# Shattered Saga — Player\'s Game Manual',
    '',
    '> Generated from the game\'s own rules (`src/data/rulesHelp.js` and `src/data/gms.js`) by `src/data/gameRulesDoc.js`. Do not edit by hand: change the rules there and regenerate.',
    '',
  ];

  for (const section of GAME_RULES_SECTIONS) {
    out.push(`## ${section.icon ? `${section.icon} ` : ''}${section.title}`, '');
    for (const sub of section.subsections || []) {
      out.push(`### ${sub.title}`, '');
      for (const line of sub.content || []) out.push(`- ${line}`);
      out.push('');
    }
    if (section.id === 'character_creation') {
      out.push('### Professions and their starting skills', '');
      for (const p of PROFESSIONS_LIST) out.push(`- **${p.name}:** ${p.skills.map(skillName).join(', ')}`);
      out.push('');
      out.push('### Morality in combat', '');
      out.push('- Morality +15 or higher: +1 to hit and +1 damage against demons, undead, cultists, bandits and other evil foes; +2 from +30, +3 from +45.');
      out.push('- Morality -15 or lower: the same bonuses against priests, guards, knights and innocents; +2 from -30, +3 from -45.');
      out.push('');
    }
    if (section.id === 'opposed_rolls') {
      out.push('### Skills (primary + secondary attribute)', '');
      for (const s of [...SKILLS_LIST].sort((a, b) => a.name.localeCompare(b.name))) {
        out.push(`- **${s.name}** (${cap(s.primary)} + ${cap(s.secondary)}): ${s.desc}`);
      }
      out.push('');
    }
  }
  return `${out.join('\n').trimEnd()}\n`;
}
