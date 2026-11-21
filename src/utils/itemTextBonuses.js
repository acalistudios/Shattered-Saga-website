// Skill bonuses read from item text (Hans 2026-11-20): an item whose text says
// "Grants +1 to Perception or Insight checks ..." now really adds +1 to those
// checks. The text is the single source, so the shop, inventory and adventure
// descriptions always match what the dice do.
//
// Where an item applies:
// - Reward relics (data/rewardItems.js) apply when equipped, in any adventure.
// - Adventure items (an adventure's itemsDetail) apply while carried. Most of
//   their bonuses are for that adventure's situation ("to identify masked
//   guests", "in the crypt"), so those apply only during their own adventure;
//   the Game Master is told what each one is meant for.
// - "Once per adventure" charms are portable: once in each adventure.
// - Text that says "when equipped" needs the item equipped.
// Not read here: consumables and one-use items (they work when used), and
// combat skills, which weapon and shield bonuses already cover.
import { SKILLS_LIST } from '../data/gms';
import { ADVENTURES_LIST } from '../data/adventures';
import { ATTAINABLE_REWARD_ITEM_LIST } from '../data/rewardItems';

const COMBAT_SKILLS = new Set(['blocking', 'light_weapons', 'heavy_weapons', 'marksmanship', 'thrown_weapons', 'brawling']);
const USED_UP = /\b(one-use|consumable|three uses|two uses|break to|can grant|each grants)\b/i;

const SKILL_BY_NAME = new Map();
for (const s of SKILLS_LIST) SKILL_BY_NAME.set(s.name.toLowerCase(), s.id);
SKILL_BY_NAME.set('heavy weapons', 'heavy_weapons');
SKILL_BY_NAME.set('light weapons', 'light_weapons');

// Where the list of skills ends and the situation begins.
const CLAUSE_END = /\s(?:checks?\b|rolls?\b|when\b|while\b|in\b|during\b|involving\b|against\b|to\b|by\b|about\b|for\b)|[.;:]/i;

/**
 * Read the skill bonuses an item's text grants. Returns null when it grants
 * none the engine applies, else { skills: {id: amount}, situation, oncePerAdventure, needsEquip }.
 */
export function parseSkillBonus(text) {
  if (!text || USED_UP.test(text)) return null;
  const skills = {};
  let situation = null;
  let needsEquip = false;
  for (const m of text.matchAll(/\+(\d+)\s+(?:to\s+)?/g)) {
    const amount = Number(m[1]);
    const rest = text.slice(m.index + m[0].length);
    const end = rest.search(CLAUSE_END);
    const clause = end === -1 ? rest : rest.slice(0, end);
    let found = false;
    for (const raw of clause.split(/,|\bor\b|\band\b/i)) {
      const name = raw.replace(/^\s*\+\d+\s*/, '').replace(/^\s*(one|any)\s+/i, '').trim().toLowerCase();
      const id = SKILL_BY_NAME.get(name);
      if (!id || COMBAT_SKILLS.has(id)) continue;
      skills[id] = Math.max(skills[id] || 0, amount);
      found = true;
    }
    if (!found || situation !== null) continue;
    const after = (end === -1 ? '' : rest.slice(end)).replace(/^\s*checks?\b/i, '').replace(/^\s*rolls?\b/i, '');
    const sentence = after.split(/[.;]/)[0].trim();
    if (/^when equipped\b/i.test(sentence)) needsEquip = true;
    else if (sentence) situation = sentence.replace(/^(to|for)\s+/i, '');
  }
  if (!Object.keys(skills).length) return null;
  return { skills, situation, oncePerAdventure: /once per adventure/i.test(text), needsEquip };
}

const keyOf = (name) => String(name || '').replace(/\s*\(\d+\)\s*$/, '').trim().toLowerCase();

// name -> { name, source: 'reward' | 'adventure', adventureId, ...parsed }
let index = null;
function buildIndex() {
  const out = new Map();
  for (const r of ATTAINABLE_REWARD_ITEM_LIST) {
    const p = parseSkillBonus(r.baseEffect);
    if (p) out.set(keyOf(r.name), { name: r.name, source: 'reward', adventureId: null, ...p });
  }
  for (const a of ADVENTURES_LIST) {
    for (const d of a.itemsDetail || []) {
      const k = keyOf(d.name);
      if (out.has(k)) continue; // a reward relic's own rule wins
      const p = parseSkillBonus(d.properties);
      if (p) out.set(k, { name: d.name, source: 'adventure', adventureId: a.id, ...p });
    }
  }
  return out;
}

/** The text bonus an item carries, or null. */
export function getItemTextBonus(itemName) {
  if (!index) index = buildIndex();
  return index.get(keyOf(itemName)) || null;
}

/**
 * The item-text bonuses that apply to a check with `skillId`.
 * `adventureId` is the adventure being played; `used` is
 * progression.itemBonusUses ({itemKey: adventureId}) for once-per-adventure charms.
 * Returns { bonus, labels, notes, onceUsed: [itemKey] }.
 */
export function getItemTextSkillBonus(character, skillId, { adventureId = null } = {}) {
  const result = { bonus: 0, labels: [], notes: [], onceUsed: [] };
  if (!skillId) return result;
  const equipped = new Set(Object.values(character?.equipment || {}).filter(Boolean).map(keyOf));
  const carried = new Set([...equipped, ...(character?.inventory || []).map(i => keyOf(typeof i === 'string' ? i : i?.name))]);
  const used = character?.progression?.itemBonusUses || {};
  for (const k of carried) {
    const b = getItemTextBonus(k);
    const amount = b?.skills[skillId];
    if (!amount) continue;
    if ((b.source === 'reward' || b.needsEquip) && !equipped.has(k)) continue;
    if (b.oncePerAdventure) {
      if (!adventureId || used[k] === adventureId) continue;
      result.onceUsed.push(k);
    } else if (b.source === 'adventure' && b.situation && b.adventureId !== adventureId) {
      continue;
    }
    result.bonus += amount;
    result.labels.push(`${b.name} +${amount}`);
    if (b.situation) result.notes.push(`${b.name}: meant for checks ${b.situation}`);
  }
  return result;
}
