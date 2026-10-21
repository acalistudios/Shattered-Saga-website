// Decide which authored NPC a fight is against.
//
// Authored NPCs carry no ally/enemy marker, so "first NPC whose name appears in
// the narration" is a guess — and a bad one. In a real-GM Saltblood playtest
// (2026-10-20) the GM wrote "Sera moves between you and the workers" as a guard
// raised the alarm; Sera is listed first, so the engine made the party's own
// ally the combat enemy.
//
// So only an EXPLICIT name from the GM is trusted: [combat_start: Name] or the
// first [enemy_attack: Name | ...], matched exactly, then on whole words.
// With no name the caller uses a generic placeholder foe, and a later named
// [enemy_attack] upgrades it.
//
// A name-mention scan was tried and rejected. Even restricted to "exactly one
// NPC mentioned", that same playtest line picked Sera again: the real foe was
// written as "Saltblood guards" (plural), so the ally was the only exact match.
// Mentions cannot tell friend from foe however they are tuned.
// Recruited companions are never a candidate.

const norm = (s) => String(s || '').toLowerCase().trim();

const isCompanion = (npc, companionIds) => {
  const name = norm(npc.name);
  return companionIds.some(id => {
    const c = norm(id).replace(/_/g, ' ');
    if (!c) return false;
    // Companion ids look like "kaelen_miner"; match on the leading name token.
    const first = c.split(' ')[0];
    return name === c || (first.length > 2 && name.split(/[\s-]+/)[0] === first);
  });
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Whole-word containment: a plain substring test sees "Kael" inside "Kaelen".
const containsWord = (hay, needle) => new RegExp(`\\b${escape(needle)}\\b`).test(hay);

// `text` is accepted for call-site compatibility but deliberately unused.
// eslint-disable-next-line no-unused-vars
export function resolveCombatTarget({ npcs = [], explicitName = '', text = '', companionIds = [] } = {}) {
  const wanted = norm(explicitName);
  if (!wanted) return null;

  const withStats = npcs.filter(npc => npc?.stats?.HP || npc?.HP);
  const match =
    withStats.find(npc => norm(npc.name) === wanted) ||
    withStats.find(npc => containsWord(wanted, norm(npc.name)) || containsWord(norm(npc.name), wanted));

  // A companion the GM names as the target is still not attackable here; the
  // caller falls back to a placeholder rather than turning on the party.
  return match && !isCompanion(match, companionIds) ? match : null;
}
