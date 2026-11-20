import { applyRewardRestRecovery, getGameHourStamp } from './rewardEngine';
import { getKeystoneStatModifiers } from '../data/keystoneShards';
import { thrownSpent, returnItems } from './ammoRecovery';

export function consumeRationFromInventory(inventory = []) {
  let hasRations = false;
  const updatedInventory = inventory.map(item => {
    const match = item.match(/Rations(?:\s*\((\d+)\))?/i);
    if (!match || hasRations) return item;
    const count = match[1] === undefined ? 1 : Number(match[1]);
    if (count <= 0) return item;
    hasRations = true;
    return count > 1 ? `Rations (${count - 1})` : null;
  }).filter(Boolean);
  return { hasRations, updatedInventory };
}

// Resting with food heals a quarter of max HP plus 1 per Healing rank; resting
// hungry heals nothing but gives back half your fatigue (Hans 2026-11-18).
// Used by the Rest button and by the GM's [rest] tag, so both agree.
export const REST_HEAL_FRACTION = 0.25;

export function restHealAmount(character) {
  const maxHp = character?.stats?.maxHp ?? 10;
  return Math.ceil(maxHp * REST_HEAL_FRACTION) + (character?.skills?.healing || 0);
}

export function hungryRestFatigue(stats = {}) {
  const maxFatigue = stats.maxFatigue ?? 15;
  return Math.min(maxFatigue, (stats.fatigue ?? 0) + Math.ceil(maxFatigue / 2));
}

/** A rest restores resources and some HP; it never touches undeath or permanent adventure rewards. */
export function resolveRest(character) {
  const stats = { ...character.stats };
  // Arrows left lying after a fight are gone once you have moved on and slept;
  // thrown weapons are always picked up (utils/ammoRecovery.js).
  let restInventory = character.inventory || [];
  for (const [name, n] of Object.entries(thrownSpent(stats.spentAmmo))) restInventory = returnItems(restInventory, name, n);
  stats.spentAmmo = {};
  const { hasRations, updatedInventory } = consumeRationFromInventory(restInventory);
  const hours = getGameHourStamp(stats.day ?? 1, stats.hour ?? 13) + 8;
  stats.day = Math.floor(hours / 24) + 1;
  stats.hour = hours % 24;
  let healed = 0;
  if (hasRations) {
    stats.fatigue = stats.maxFatigue ?? 15;
    stats.arcaneSP = stats.maxArcaneSP ?? 0;
    stats.divineSP = stats.maxDivineSP ?? 0;
    stats.elementalAbilityUsed = false;
    // The dying (0 HP or below) need real healing, not sleep.
    if ((stats.hp ?? 0) > 0) {
      const before = stats.hp ?? 0;
      stats.hp = Math.min(stats.maxHp ?? 10, before + restHealAmount(character));
      healed = stats.hp - before;
    }
  } else {
    stats.fatigue = hungryRestFatigue(stats);
  }
  const keystoneMods = getKeystoneStatModifiers(character);
  let keystoneRestMsg = '';
  if (hasRations && keystoneMods.restHpBonus > 0) {
    const healHp = Math.min(stats.maxHp ?? 10, (stats.hp ?? 0) + keystoneMods.restHpBonus);
    stats.hp = healHp;
    if ((stats.bleedingTier || 0) > 0) {
      stats.bleedingTier = Math.max(0, (stats.bleedingTier || 0) - (keystoneMods.restBleedStaunch || 4));
    }
    keystoneRestMsg = ' The Tide Seal keystone circulates soothing waters through your body, restoring +4 HP and staunching bleeding wounds.';
  }

  const rested = {
    ...character, stats,
    inventory: hasRations ? updatedInventory : restInventory,
    daysWithoutFood: hasRations ? 0 : (character.daysWithoutFood || 0) + 1,
  };
  return {
    character: hasRations ? applyRewardRestRecovery(rested) : rested,
    message: hasRations
      ? `*You set up camp and rest for 8 hours, consuming a ration. Your physical energy, spiritual focus, and elemental focus are fully restored${healed > 0 ? `, and you recover ${healed} HP` : ''}.*${keystoneRestMsg}`
      : '*You try to rest for 8 hours, but with no rations to nourish you, you recover only half your strength and no health. You wake up weak and hungry.*',
  };
}
