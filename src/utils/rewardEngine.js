// Deterministic reward-item engine: cooldowns, active effects, passive gear
// bonuses, and weapon profiles. Extracted from useGameState so the rules can be
// tested without mounting a React hook. Everything here is pure — callers pass a
// character in and get a new character (or a plain result) back.
import { getRewardItemByName } from '../data/rewardItems';

// Canonical empty progression block. DEFAULT_CHARACTER in useGameState spreads
// this so the two cannot drift apart.
export const DEFAULT_PROGRESSION = {
  levelHpBonus: 0,
  boons: [],
  completedRewardClaims: [],
  pendingRewardChoices: [],
  completedObjectives: {},
  completedEndings: {},
  itemCooldowns: {},
  temporarySkillPenalties: {},
  activeItemEffects: [],
  // Resurrection state (see utils/resurrectionEngine.js). Permanent once set.
  undead: false,
  resurrectionCount: 0,
  npcReactionPenalty: 0,
  lostAttributes: [],
  pendingGearRecovery: null
};

export function getWeaponProperties(weaponName) {
  if (!weaponName) return { name: "Unarmed Strike", dice: "1d3", skill: "brawling" };
  const nameLower = weaponName.toLowerCase();
  if (nameLower.includes("greatsword") || nameLower.includes("warhammer") || nameLower.includes("greataxe") || nameLower.includes("heavy")) {
    return { name: weaponName, dice: "2d6", skill: "heavy_weapons" };
  }
  if (nameLower.includes("longsword") || nameLower.includes("spear") || nameLower.includes("axe") || nameLower.includes("mace")) {
    return { name: weaponName, dice: "1d8", skill: "martial_weapons" };
  }
  if (nameLower.includes("dagger") || nameLower.includes("knife") || nameLower.includes("shiv")) {
    return { name: weaponName, dice: "1d4", skill: "light_weapons" };
  }
  return { name: weaponName, dice: "1d6", skill: "light_weapons" }; // default light weapon
}

export function getMagicBonus(itemName) {
  if (!itemName) return 0;
  const match = itemName.match(/\+(\d+)\b/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getGameHourStamp(day, hour) {
  return ((day || 1) - 1) * 24 + (hour || 0);
}

export function getCharacterHourStamp(character) {
  return getGameHourStamp(character?.stats?.day || 1, character?.stats?.hour ?? 13.0);
}

export function getItemCooldownKey(itemName, effectId = 'primary') {
  const rewardItem = getRewardItemByName(itemName);
  return `${rewardItem?.id || itemName}:${effectId}`;
}

export function getCooldownReady(character, itemName, effectId = 'primary') {
  const key = getItemCooldownKey(itemName, effectId);
  const cooldown = character?.progression?.itemCooldowns?.[key];
  if (!cooldown) return true;
  if (cooldown.reset === 'rest') return false;
  return getCharacterHourStamp(character) >= (cooldown.readyAtHours || 0);
}

export function setItemCooldownOnCharacter(character, itemName, effectId = 'primary', reset = 'rest', hours = 0) {
  const key = getItemCooldownKey(itemName, effectId);
  const readyAtHours = reset === '8_hours' ? getCharacterHourStamp(character) + (hours || 8) : null;
  return {
    ...character,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(character.progression || {}),
      itemCooldowns: {
        ...(character.progression?.itemCooldowns || {}),
        [key]: { reset, readyAtHours }
      }
    }
  };
}

export function addActiveItemEffectToCharacter(character, effect) {
  const effects = character.progression?.activeItemEffects || [];
  return {
    ...character,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(character.progression || {}),
      activeItemEffects: [
        ...effects.filter(active => active.id !== effect.id),
        effect
      ]
    }
  };
}

export function removeActiveItemEffectsFromCharacter(character, effectIds) {
  const blockedIds = new Set(effectIds);
  return {
    ...character,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(character.progression || {}),
      activeItemEffects: (character.progression?.activeItemEffects || []).filter(effect => !blockedIds.has(effect.id))
    }
  };
}

// Scene-scoped item effects (stances, underwater breathing, kindled flame) last
// until the scene turns over, not until the next rest. Without this they would
// keep applying for the rest of the day; rest recovery clears everything anyway.
export function clearSceneItemEffectsFromCharacter(character) {
  const effects = character?.progression?.activeItemEffects || [];
  if (!effects.some(effect => effect.expires === 'scene')) return character;
  return {
    ...character,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(character.progression || {}),
      activeItemEffects: effects.filter(effect => effect.expires !== 'scene')
    }
  };
}

export function addTemporarySkillPenaltyToCharacter(character, skillId, amount = 1) {
  return {
    ...character,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(character.progression || {}),
      temporarySkillPenalties: {
        ...(character.progression?.temporarySkillPenalties || {}),
        [skillId]: (character.progression?.temporarySkillPenalties?.[skillId] || 0) + amount
      }
    }
  };
}

export function clearRestItemCooldowns(character) {
  const currentCooldowns = character?.progression?.itemCooldowns || {};
  const itemCooldowns = Object.fromEntries(
    Object.entries(currentCooldowns).filter(([, cooldown]) => cooldown?.reset !== 'rest')
  );
  return {
    ...character,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(character.progression || {}),
      itemCooldowns
    }
  };
}

export function applyRewardRestRecovery(character) {
  const resetCharacter = clearRestItemCooldowns(character);
  return {
    ...resetCharacter,
    progression: {
      ...DEFAULT_PROGRESSION,
      ...(resetCharacter.progression || {}),
      temporarySkillPenalties: {},
      activeItemEffects: []
    }
  };
}

export function getEquippedItemNames(character) {
  return Object.values(character?.equipment || {}).filter(Boolean);
}

export function characterHasAffinity(character, affinity) {
  return !!affinity && (character?.element || '').toLowerCase() === affinity;
}

export function getPassiveRewardSkillBonus(character, skillId) {
  if (!skillId) return { bonus: 0, labels: [] };
  const equipped = getEquippedItemNames(character);
  let bonus = 0;
  const labels = [];

  equipped.forEach(itemName => {
    const lower = itemName.toLowerCase();
    let itemBonus = 0;
    if (lower.includes("saint orra's veil +3") && ['insight', 'divine_communion'].includes(skillId)) itemBonus = 3;
    else if (lower.includes('masterwork tool kit +2') && ['crafting', 'smithing'].includes(skillId)) itemBonus = 2;
    else if (lower.includes('amulet of tide-taming') && ['survival', 'sailing'].includes(skillId)) itemBonus = 1;
    else if (lower.includes('living thorn charm') && ['survival', 'tracking', 'animal_rapport'].includes(skillId)) itemBonus = 1;

    if (itemBonus > 0) {
      bonus += itemBonus;
      labels.push(`${itemName} +${itemBonus}`);
    }
  });

  return { bonus, labels };
}

export function getRewardWeaponProfile(weaponName, character, enemy = null, activeAdventureId = null) {
  const base = getWeaponProperties(weaponName);
  const lower = (weaponName || '').toLowerCase();
  const equippedAndCarried = [
    ...Object.values(character?.equipment || {}).filter(Boolean),
    ...(character?.inventory || [])
  ].map(itemName => itemName.toLowerCase());
  const hasStarfallBowstring = equippedAndCarried.some(itemName => itemName.includes('starfall bowstring +3'));
  const effects = [];
  let dice = base.dice;
  let skill = base.skill;
  // Prefer the reward table's declared bonus over parsing "+N" out of the display
  // name: not every rewarded weapon spells its bonus in its name (Black-Crown
  // Longbow and Glass Thorn Dagger are both +1 but read as +0 by name alone).
  const rewardEntry = getRewardItemByName(weaponName);
  let attackBonus = Math.max(getMagicBonus(weaponName), rewardEntry?.bonus || 0);
  let damageBonus = 0;

  if (lower.includes('champion maul +2')) {
    dice = '1d10+1';
    skill = 'heavy_weapons';
  } else if (lower.includes('frostfire glaive +3')) {
    dice = '1d10';
    skill = 'heavy_weapons';
    if (getCooldownReady(character, weaponName, 'frostfire_strike')) {
      damageBonus += 3;
      effects.push({ type: 'cooldown', itemName: weaponName, effectId: 'frostfire_strike', reset: 'rest', text: '+3 frostfire damage' });
    }
  } else if (lower.includes('dawnbound sickle +3')) {
    dice = '1d6';
    skill = 'light_weapons';
    const targetText = `${activeAdventureId || ''} ${enemy?.name || ''} ${enemy?.role || ''} ${enemy?.desc || ''}`.toLowerCase();
    if (/(harvest_hill_hunger|hunger|root|vine|famine|pact-bound|pact)/.test(targetText)) {
      damageBonus += 2;
      effects.push({ type: 'passive', text: '+2 damage vs pact-bound growth' });
    }
  } else if (lower.includes('basalt warhammer +2')) {
    dice = '1d8';
    skill = 'heavy_weapons';
    if (getCooldownReady(character, weaponName, 'fire_core_strike')) {
      damageBonus += 2;
      effects.push({
        type: 'cooldown',
        itemName: weaponName,
        effectId: 'fire_core_strike',
        reset: characterHasAffinity(character, 'fire') ? '8_hours' : 'rest',
        text: '+2 fire damage'
      });
    }
  } else if (lower.includes('black-crown longbow')) {
    dice = '1d6';
    skill = 'marksmanship';
    damageBonus += 1;
    if (characterHasAffinity(character, 'fire') && getCooldownReady(character, weaponName, 'fire_arrow')) {
      damageBonus += 2;
      effects.push({ type: 'cooldown', itemName: weaponName, effectId: 'fire_arrow', reset: '8_hours', text: '+2 fire damage' });
    }
  } else if (lower.includes('sky-stalker composite bow +2')) {
    dice = '1d8+1';
    skill = 'marksmanship';
  } else if (lower.includes('glass thorn dagger')) {
    dice = '1d4';
    skill = 'light_weapons';
    effects.push({
      type: 'poison',
      chance: characterHasAffinity(character, 'water') ? 0.75 : 0.5,
      text: characterHasAffinity(character, 'water') ? '75% poison chance' : '50% poison chance'
    });
  }

  if (hasStarfallBowstring && /\b(bow|longbow|shortbow|composite bow)\b/.test(lower)) {
    attackBonus = Math.max(attackBonus, 3);
    const targetText = `${activeAdventureId || ''} ${enemy?.name || ''} ${enemy?.role || ''} ${enemy?.desc || ''}`.toLowerCase();
    if (/(astral|flying|airborne|incorporeal|spirit|wraith|ghost)/.test(targetText) && getCooldownReady(character, 'Starfall Bowstring +3', 'starfall_shot')) {
      damageBonus += 3;
      effects.push({
        type: 'cooldown',
        itemName: 'Starfall Bowstring +3',
        effectId: 'starfall_shot',
        reset: 'rest',
        text: characterHasAffinity(character, 'air') ? '+3 starfall damage; ignores cover' : '+3 starfall damage vs astral/flying/incorporeal target'
      });
    }
  }

  return { ...base, dice, skill, attackBonus, damageBonus, effects };
}
