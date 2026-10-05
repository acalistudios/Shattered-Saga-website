import { applyRewardRestRecovery, getGameHourStamp } from './rewardEngine';

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

/** A rest changes resources, not HP, undeath, or permanent adventure rewards. */
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
  const rested = {
    ...character, stats,
    inventory: hasRations ? updatedInventory : character.inventory,
    daysWithoutFood: hasRations ? 0 : (character.daysWithoutFood || 0) + 1,
  };
  return {
    character: hasRations ? applyRewardRestRecovery(rested) : rested,
    message: hasRations
      ? '*You set up camp and rest for 8 hours, consuming a ration. Your physical energy, spiritual focus, and elemental focus are fully restored.*'
      : '*You try to rest for 8 hours, but with no rations to nourish you, you cannot recover your strength. You wake up weak and hungry.*',
  };
}
