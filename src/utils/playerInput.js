// Engine control tags are the GM's channel to the game engine: the hook parses
// them out of the MODEL's response to grant gold, items, companions, objectives
// and so on. Players have no legitimate reason to type them.
//
// They matter on the input side because player text is sent to the model
// verbatim. A player who types "[add_gold: 1000]" or
// "[objective_complete: rescue_children]" is asking the model to echo it back,
// and a compliant model often will — at which point the engine grants it. This
// is prompt injection used to bypass engine-authoritative rewards.
//
// Keep this list in sync with the tag regexes in useGameState.js. A test in
// playerInput.test.js reads that file and fails if a parsed tag is missing here.
export const ENGINE_TAG_NAMES = [
  'add_companion', 'add_gold', 'add_item', 'add_quest', 'advance_day', 'axis',
  'bleed', 'choice', 'combat_end', 'combat_start', 'companion_joined',
  'complete_quest', 'currency', 'damage', 'elemental_ability_unlock',
  'elemental_ability_used', 'ending_selected', 'enemy_attack', 'event',
  'fatigue', 'heal', 'image', 'location', 'milestone', 'morality', 'npc_fact',
  'npc_fear', 'npc_trust', 'objective_complete', 'patrol_end', 'recruit_companion',
  'region_fact', 'remove_gold', 'remove_item', 'remove_quest', 'rest',
  'roleplay_modifier', 'scene_end', 'skill_up', 'status', 'victory',
];

// Matches "[name]" or "[name: anything]" for engine tag names only, so
// legitimate brackets such as the OOC wrapper "[OOC: ...]" survive.
const ENGINE_TAG_RE = new RegExp(
  `\\[\\s*(?:${ENGINE_TAG_NAMES.join('|')})\\s*(?::[^\\]]*)?\\]`,
  'gi'
);

/**
 * Remove engine control tags from text the PLAYER typed or clicked.
 * Never apply this to engine-generated payloads (combat maneuvers append their
 * own [combat_end]); call it only at the UI boundary.
 */
export function stripEngineTags(text) {
  if (typeof text !== 'string') return text;
  return text.replace(ENGINE_TAG_RE, '').replace(/[ \t]{2,}/g, ' ').trim();
}
