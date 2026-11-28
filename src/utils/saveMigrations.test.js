import { describe, expect, it } from 'vitest';
import { validateCharacterSchema } from '../hooks/useGameState';

// Old Mara of Blackroot Hollow is now Old Hedda (Hans, 2026-11-27).
describe('saves holding Mara\'s Smoke Bombs', () => {
  it('get Hedda\'s Smoke Bombs everywhere the item name is stored', () => {
    const out = validateCharacterSchema({
      name: 'Rowan',
      inventory: ["Mara's Smoke Bombs", 'Torch'],
      localEconomy: { merchantStock: { 'Mara Voss': [{ name: "Mara's Smoke Bombs", qty: 2 }] } },
      progression: { adventureTrades: { blackroot_hollow: { 'Mara Voss': { bought: { "Mara's Smoke Bombs": 1 } } } } },
    });
    expect(out.inventory).toEqual(["Hedda's Smoke Bombs", 'Torch']);
    expect(out.localEconomy.merchantStock).toEqual({ 'Kessa Voss': [{ name: "Hedda's Smoke Bombs", qty: 2 }] });
    expect(out.progression.adventureTrades.blackroot_hollow).toEqual({ 'Kessa Voss': { bought: { "Hedda's Smoke Bombs": 1 } } });
  });
});

describe('journal from an older or imported save', async () => {
  const { normalizeJournal } = await import('../hooks/useGameState');
  it('always has storySoFar and a recentTurns list', () => {
    expect(normalizeJournal({ summary: 'Old shape.' })).toMatchObject({ storySoFar: 'Old shape.', recentTurns: [] });
    expect(normalizeJournal(null)).toEqual({ storySoFar: '', recentTurns: [] });
    expect(normalizeJournal({ storySoFar: 'x', recentTurns: ['a'] })).toEqual({ storySoFar: 'x', recentTurns: ['a'] });
  });

  it('strips leaked engine and music tags from storySoFar and recentTurns', () => {
    const out = normalizeJournal({
      storySoFar: 'Entered the keep [location: Great Hall] and chose mercy [choice: spare_goblin] [tension].',
      recentTurns: ['Speak to Skritt [location: Courtyard] [hazard]', 'Hold position [stealth_start]'],
    });
    expect(out).toEqual({
      storySoFar: 'Entered the keep and chose mercy .',
      recentTurns: ['Speak to Skritt', 'Hold position'],
    });
  });
});
