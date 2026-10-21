import { describe, it, expect } from 'vitest';
import { resolveCombatTarget } from './combatTarget';

// Mirrors the authored Saltblood Mines NPC list, in its real order.
const npcs = [
  { name: 'Sera', stats: { HP: 11 } },
  { name: 'Old Bram', stats: { HP: 8 } },
  { name: 'Kael', stats: { HP: 12 } },
  { name: 'Kaelen Iron-Breaker', stats: { HP: 16 } },
  { name: 'Threx', stats: { HP: 18 } },
  { name: 'Saltblood Guard', stats: { HP: 14 } },
  { name: 'Lore Only NPC' },
];

describe('resolveCombatTarget', () => {
  // The exact narration from the 2026-10-20 real-GM playtest that targeted Sera.
  const playtestText = 'Kaelen tears the heavy pick from the rack, while Sera moves between you and the nearest workers. Boots pound from the work passage. The guard raises his club. You have only moments before more Saltblood guards reach the machinery.';

  it('does not make an ally the enemy when several NPCs are mentioned', () => {
    const t = resolveCombatTarget({ npcs, text: playtestText, companionIds: ['kaelen_miner'] });
    expect(t).toBeNull();
  });

  it('uses an explicit name from the GM', () => {
    expect(resolveCombatTarget({ npcs, explicitName: 'Saltblood Guard', text: playtestText }).name).toBe('Saltblood Guard');
  });

  it('matches an explicit name loosely', () => {
    expect(resolveCombatTarget({ npcs, explicitName: 'the Saltblood Guard captain' }).name).toBe('Saltblood Guard');
    expect(resolveCombatTarget({ npcs, explicitName: 'threx' }).name).toBe('Threx');
  });

  it('does not guess from a lone mention either — that is how Sera was picked', () => {
    // Only the ally matches exactly here ("guards" is plural), so any
    // mention-based rule would choose her. No explicit name, no NPC.
    expect(resolveCombatTarget({ npcs, text: 'Sera braces as more Saltblood guards arrive.' })).toBeNull();
  });

  it('never targets a recruited companion, even by explicit name', () => {
    expect(resolveCombatTarget({ npcs, explicitName: 'Kaelen Iron-Breaker', companionIds: ['kaelen_miner'] })).toBeNull();
  });

  it('does not see "Kael" inside "Kaelen"', () => {
    expect(resolveCombatTarget({ npcs, explicitName: 'Kaelen Iron-Breaker' }).name).toBe('Kaelen Iron-Breaker');
  });

  it('ignores NPCs with no combat stats', () => {
    expect(resolveCombatTarget({ npcs, explicitName: 'Lore Only NPC' })).toBeNull();
  });

  it('returns null for an unknown explicit name so the caller uses a placeholder', () => {
    expect(resolveCombatTarget({ npcs, explicitName: 'Cave Troll' })).toBeNull();
  });
});
