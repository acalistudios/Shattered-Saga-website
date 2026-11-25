import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { detectArtMoments, markArtSeen, vendorPortraits } from './artMoments';
import { ADVENTURE_CLIMAX_ENDINGS, COMPANION_PORTRAITS } from '../data/artMoments';
import { getAdventureMerchants } from './adventureTrade';
import { ADVENTURES_LIST } from '../data/adventures';
import manifest from '../data/artManifest.json';
import { applyRewardRestRecovery } from './rewardEngine';

const base = (over = {}) => ({ name: 'T', stats: { level: 1 }, progression: {}, companions: [], equipment: {}, ...over });
const keys = (list) => list.map(m => m.key);

describe('artwork moments', () => {
  it('every manifest entry is a real file', () => {
    manifest.forEach(src => expect(fs.existsSync(path.join('public', src))).toBe(true));
  });

  it('shows story NPCs tagged to the room, once, and never from narration', () => {
    const c = base();
    const due = detectArtMoments({ character: c, adventureId: 'ashveil_keep', location: 'Prison Sub-Level' });
    expect(keys(due)).toEqual(['npc:ashveil_keep:aldric_voss', 'npc:ashveil_keep:malachar']);
    const seen = { ...c, progression: markArtSeen(c.progression, due) };
    expect(detectArtMoments({ character: seen, adventureId: 'ashveil_keep', location: 'prison sub-level' })).toEqual([]);
    // Naming an NPC elsewhere does nothing; only the room counts.
    expect(detectArtMoments({ character: base(), adventureId: 'ashveil_keep', location: 'Chapel', narration: 'Malachar whispers.' })).toEqual([]);
  });

  it('vendors are not story cards; their portrait shows in their room', () => {
    expect(detectArtMoments({ character: base(), adventureId: 'ashveil_keep', location: 'Ashveil Village Square' })).toEqual([]);
    expect(vendorPortraits('ashveil_keep', 'Ashveil Village Square').map(v => v.src)).toEqual([
      '/images/npcs/ashveil_keep/martha.webp', '/images/npcs/ashveil_keep/vance.webp'
    ]);
    expect(vendorPortraits('ashveil_keep', 'Chapel')).toEqual([]);
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
    // Every portrait tag names a real room, and every story/vendor portrait is painted.
    ADVENTURES_LIST.forEach(a => (a.npcs || []).filter(n => n.portrait).forEach(n => {
      expect(a.settings, `${a.id}: ${n.name}`).toContain(n.portrait.room);
      expect(manifest, `${a.id}: ${n.portrait.id}`).toContain(`/images/npcs/${a.id}/${n.portrait.id}.webp`);
    }));
    ADVENTURES_LIST.forEach(a => getAdventureMerchants(a.id).filter(m => m.portrait).forEach(m => {
      expect(manifest).toContain(`/images/npcs/${a.id}/${m.portrait}.webp`);
    }));
    Object.entries(ADVENTURE_CLIMAX_ENDINGS).forEach(([id, endings]) => {
      const known = Object.keys(byId[id].rewards || {}).map(k => k.toLowerCase());
      endings.forEach(e => expect(known).toContain(e));
    });
    Object.values(COMPANION_PORTRAITS).forEach(p => expect(byId[p.adventureId].npcs.some(n => n.portrait?.id === p.npcId)).toBe(true));
  });
});
