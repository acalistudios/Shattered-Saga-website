/* global process */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildGameRulesMarkdown } from './gameRulesDoc';

const FILE = fileURLToPath(new URL('./GAME_RULES.md', import.meta.url));

describe('GAME_RULES.md', () => {
  it('matches the rules the game uses (regenerate with UPDATE_RULES=1)', () => {
    const built = buildGameRulesMarkdown();
    if (process.env.UPDATE_RULES === '1') fs.writeFileSync(FILE, built);
    expect(fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n')).toBe(built);
  });
});
