import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { detectArtMoments, markArtSeen } from './artMoments';
import { NPC_PORTRAITS, ADVENTURE_CLIMAX_ENDINGS, COMPANION_PORTRAITS } from '../data/artMoments';
import { ADVENTURES_LIST } from '../data/adventures';
import manifest from '../data/artManifest.json';
import { applyRewardRestRecovery } from './rewardEngine';

const base = (over = {}) => ({ name: 'T', stats: { level: 1 }, progression: {}, companions: [], equipment: {}, ...over });
const keys = (list) => list.map(m => m.key);

describe('artwork moments', () => {
  it('every manifest entry is a real file', () => {
    manifest.forEach(src => expect(fs.existsSync(path.join('public', src))).toBe(true));
  });

  it('shows Vance and Martha on first mention, in narration order, once', () => {
    const c = base();
    const due = detectArtMoments({ character: c, adventureId: 'ashveil_keep', narration: 'Martha sobs. Vance looks up from the anvil.' });
    expect(keys(due)).toEqual(['npc:ashveil_keep:martha', 'npc:ashveil_keep:vance']);
    const seen = { ...c, progression: markArtSeen(c.progression, due) };
    expect(detectArtMoments({ character: seen, adventureId: 'ashveil_keep', narration: 'Vance nods.' })).toEqual([]);
  });

  it('matches whole words only and only in the active adventure', () => {
    expect(detectArtMoments({ character: base(), adventureId: 'ashveil_keep', narration: 'Advance carefully.' })).toEqual([]);
    expect(detectArtMoments({ character: base(), adventureId: 'saltblood_mines', narration: 'Vance' })).toEqual([]);
  });

  it('fires state moments: level up, awakening, first rest, endings with the climax', () => {
    const rested = applyRewardRestRecovery(base());
    expect(rested.progression.restsTaken).toBe(1);
    const c = base({ stats: { level: 2, elementalAbility: 'fire' }, progression: { completedEndings: { ashveil_keep: ['heroic'] } } });
    const due = keys(detectArtMoments({ character: c, adventureId: 'ashveil_keep' }));
    expect(due).toEqual(expect.arrayContaining(['moment:awaken_fire', 'climax:ashveil_keep', 'ending:ashveil_keep:heroic']));
  });

  it('skips moments whose painting does not exist yet', () => {
    const c = base({ progression: { completedEndings: { ashveil_keep: ['no_such_ending'] } } });
    expect(keys(detectArtMoments({ character: c, adventureId: 'ashveil_keep' }))).not.toContain('ending:ashveil_keep:no_such_ending');
  });

  it('declared data lines up with the adventures', () => {
    const byId = Object.fromEntries(ADVENTURES_LIST.map(a => [a.id, a]));
    Object.keys(NPC_PORTRAITS).forEach(id => expect(byId[id]).toBeTruthy());
    Object.entries(ADVENTURE_CLIMAX_ENDINGS).forEach(([id, endings]) => {
      const known = Object.keys(byId[id].rewards || {}).map(k => k.toLowerCase());
      endings.forEach(e => expect(known).toContain(e));
    });
    Object.values(COMPANION_PORTRAITS).forEach(p => expect(NPC_PORTRAITS[p.adventureId].some(n => n.id === p.npcId)).toBe(true));
  });
});
