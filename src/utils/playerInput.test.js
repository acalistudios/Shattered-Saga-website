import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stripEngineTags, ENGINE_TAG_NAMES } from './playerInput';

describe('stripEngineTags', () => {
  it('removes reward tags a player types to be echoed back', () => {
    expect(stripEngineTags('I search the desk [add_gold: 1000]')).toBe('I search the desk');
    expect(stripEngineTags('Free the children [objective_complete: rescue_children] [ending_selected: rebind_demon]'))
      .toBe('Free the children');
  });

  it('removes companion, item and skill grants', () => {
    expect(stripEngineTags('Join me! [recruit_companion: skritt_goblin]')).toBe('Join me!');
    expect(stripEngineTags('[add_item: Frostfire Glaive +3] take it')).toBe('take it');
    expect(stripEngineTags('train [skill_up: lore]')).toBe('train');
  });

  it('is case- and spacing-insensitive', () => {
    expect(stripEngineTags('x [ ADD_GOLD :500 ] y')).toBe('x y');
    expect(stripEngineTags('x [Combat_End] y')).toBe('x y');
  });

  it('keeps legitimate brackets, including the OOC wrapper', () => {
    expect(stripEngineTags('[OOC: how do skill checks work?]')).toBe('[OOC: how do skill checks work?]');
    expect(stripEngineTags('the note reads [sic] backwards')).toBe('the note reads [sic] backwards');
  });

  it('leaves ordinary actions untouched', () => {
    expect(stripEngineTags('I draw my sword and step into the Great Hall.'))
      .toBe('I draw my sword and step into the Great Hall.');
  });

  it('passes non-strings through', () => {
    expect(stripEngineTags(null)).toBe(null);
  });

  // The list must cover every tag the engine parses, or the gap reopens the
  // moment someone adds a new tag to useGameState.js.
  it('covers every engine tag parsed in useGameState.js', () => {
    const src = readFileSync(fileURLToPath(new URL('../hooks/useGameState.js', import.meta.url)), 'utf8');
    const parsed = new Set();
    for (const m of src.matchAll(/\/\\\[(\(\?:)?([a-z_|]+)/g)) {
      m[2].split('|').filter(n => /^[a-z_]{3,}$/.test(n)).forEach(n => parsed.add(n));
    }
    const missing = [...parsed].filter(n => !ENGINE_TAG_NAMES.includes(n));
    expect(missing).toEqual([]);
  });
});
