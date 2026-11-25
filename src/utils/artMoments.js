// Fixed paintings shown once per character at standard story beats
// (data/artMoments.js). Pure: given the character and where they are,
// returns the paintings due now. Nothing here reads the GM's narration.
// The caller attaches them to the latest narration message and records their
// keys in progression.artSeen.
import manifest from '../data/artManifest.json';
import {
  npcPortraitPath, COMPANION_PORTRAITS, CAMPAIGN_MOMENTS, momentPath,
  ADVENTURE_CLIMAX_ENDINGS, climaxPath, endingPath
} from '../data/artMoments';
import { getArmorType } from '../data/gearStats';
import { getKeystoneCount } from '../data/keystoneShards';
import { ADVENTURES_LIST } from '../data/adventures';
import { merchantsAtLocation } from './adventureTrade';

const PAINTED = new Set(manifest);

const norm = (s) => String(s || '').trim().toLowerCase();

/** Story NPCs whose portrait is tagged to this room in data/adventures.js. */
export function storyNpcsInRoom(adventureId, location) {
  const here = norm(location);
  if (!here) return [];
  const adventure = ADVENTURES_LIST.find(a => a.id === adventureId);
  return (adventure?.npcs || []).filter(n => n.portrait && norm(n.portrait.room) === here);
}

/** Painted portraits of the merchants standing in this room (room panel). */
export function vendorPortraits(adventureId, location) {
  return merchantsAtLocation(adventureId, location)
    .filter(m => m.portrait && PAINTED.has(npcPortraitPath(adventureId, m.portrait)))
    .map(m => ({ name: m.name, role: m.role, src: npcPortraitPath(adventureId, m.portrait) }));
}

// Campaign-wide moments whose condition holds for this character.
function campaignMomentIds(character) {
  const stats = character?.stats || {};
  const prog = character?.progression || {};
  const ids = [];
  if ((prog.restsTaken || 0) >= 1) ids.push('first_rest');
  if ((stats.level || 1) >= 2) ids.push('level_up');
  if (stats.elementalAbility) ids.push(`awaken_${String(stats.elementalAbility).toLowerCase()}`);
  if ((prog.resurrectionCount || 0) >= 1) ids.push('resurrection');
  if (getKeystoneCount(character) >= 1) ids.push('keystone');
  if (getArmorType(character?.equipment?.body) === 'heavy') ids.push('heavy_armour');
  if (prog.activePatrol) ids.push('first_patrol');
  if (prog.activeArena) ids.push('first_arena');
  return ids.filter(id => CAMPAIGN_MOMENTS[id]);
}

/**
 * @returns {{key:string, src:string, caption:string}[]} paintings to show now,
 *   in story order, skipping ones already seen or not yet painted.
 */
export function detectArtMoments({ character, adventureId, location = '' }) {
  const seen = new Set(character?.progression?.artSeen || []);
  const due = [];
  const add = (key, src, caption) => {
    if (seen.has(key) || !PAINTED.has(src) || due.some(d => d.key === key)) return;
    due.push({ key, src, caption });
  };

  // Story NPCs tagged to the room the player is in (first visit only).
  storyNpcsInRoom(adventureId, location)
    .forEach(n => add(`npc:${adventureId}:${n.portrait.id}`, npcPortraitPath(adventureId, n.portrait.id), n.name));

  (character?.companions || []).forEach(c => {
    const id = c?.id || c;
    const p = COMPANION_PORTRAITS[id];
    if (!p) return;
    // A companion already met as an NPC still gets the "joins you" card.
    add(`companion:${id}`, npcPortraitPath(p.adventureId, p.npcId), p.caption);
  });

  campaignMomentIds(character).forEach(id => add(`moment:${id}`, momentPath(id), CAMPAIGN_MOMENTS[id].caption));

  if (adventureId) {
    const endings = character?.progression?.completedEndings?.[adventureId] || [];
    endings.forEach(endingId => {
      const id = String(endingId).toLowerCase();
      if ((ADVENTURE_CLIMAX_ENDINGS[adventureId] || []).includes(id)) {
        add(`climax:${adventureId}`, climaxPath(adventureId), 'The climax');
      }
      add(`ending:${adventureId}:${id}`, endingPath(adventureId, id), 'The adventure ends');
    });
  }
  return due;
}

export const markArtSeen = (progression, moments) => ({
  ...(progression || {}),
  artSeen: [...new Set([...(progression?.artSeen || []), ...moments.map(m => m.key)])]
});
