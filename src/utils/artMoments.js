// Fixed paintings shown once per character at standard story beats
// (data/artMoments.js). Pure: given the character and the GM's latest
// narration, returns the paintings due now. The caller attaches them to the
// narration message and records their keys in progression.artSeen.
import manifest from '../data/artManifest.json';
import {
  NPC_PORTRAITS, npcPortraitPath, COMPANION_PORTRAITS, CAMPAIGN_MOMENTS, momentPath,
  ADVENTURE_CLIMAX_ENDINGS, climaxPath, endingPath
} from '../data/artMoments';
import { getArmorType } from '../data/gearStats';
import { getKeystoneCount } from '../data/keystoneShards';

const PAINTED = new Set(manifest);

const escapeRe = (s) => s.replace(/[.*+?^${}()[\]\\]/g, '\\$&');
const mentions = (text, match) => match.split('|').some(m => new RegExp(`(^|[^A-Za-z])${escapeRe(m)}(?![A-Za-z])`).test(text));

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
export function detectArtMoments({ character, adventureId, narration = '' }) {
  const seen = new Set(character?.progression?.artSeen || []);
  const due = [];
  const add = (key, src, caption) => {
    if (seen.has(key) || !PAINTED.has(src) || due.some(d => d.key === key)) return;
    due.push({ key, src, caption });
  };

  // First mention of a named NPC in this adventure, in narration order.
  const npcs = (NPC_PORTRAITS[adventureId] || [])
    .filter(n => mentions(narration, n.match))
    .map(n => ({ n, at: Math.min(...n.match.split('|').map(m => { const i = narration.indexOf(m); return i < 0 ? Infinity : i; })) }))
    .sort((a, b) => a.at - b.at);
  npcs.forEach(({ n }) => add(`npc:${adventureId}:${n.id}`, npcPortraitPath(adventureId, n.id), n.name));

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
