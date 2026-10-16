import { applyRewardRestRecovery, getGameHourStamp } from './rewardEngine';
import { getKeystoneStatModifiers } from '../data/keystoneShards';

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

/** A rest changes resources, not HP, undeath, or permanent adventure rewards (unless keystone perks are active). */
export function resolveRest(character) {
  const { hasRations, updatedInventory } = consumeRationFromInventory(character.inventory);
  const stats = { ...character.stats };
  const hours = getGameHourStamp(stats.day ?? 1, stats.hour ?? 13) + 8;
  stats.day = Math.floor(hours / 24) + 1;
  stats.hour = hours % 24;
  if (hasRations) {
    stats.fatigue = stats.maxFatigue ?? 15;
    stats.arcaneSP = stats.maxArcaneSP ?? 0;
    stats.divineSP = stats.maxDivineSP ?? 0;
    stats.elementalAbilityUsed = false;
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
    inventory: hasRations ? updatedInventory : character.inventory,
    daysWithoutFood: hasRations ? 0 : (character.daysWithoutFood || 0) + 1,
  };
  return {
    character: hasRations ? applyRewardRestRecovery(rested) : rested,
    message: hasRations
      ? `*You set up camp and rest for 8 hours, consuming a ration. Your physical energy, spiritual focus, and elemental focus are fully restored.*${keystoneRestMsg}`
      : '*You try to rest for 8 hours, but with no rations to nourish you, you cannot recover your strength. You wake up weak and hungry.*',
  };
}
