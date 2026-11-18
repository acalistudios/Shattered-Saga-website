// Penalties that apply to the player's weapon attacks (Hans 2026-11-18).
//
// Hunger, exhaustion and a heavy load already slowed skill checks and (hunger,
// exhaustion) defences; attack rolls ignored all three. They now apply to
// melee strikes, ranged shots and counter-attacks too.

import { calculateWeightAndVolume } from './items';

export function getAttackPenalty(character) {
  const starvation = character?.daysWithoutFood || 0;
  const stats = character?.stats || {};
  const fatigue = stats.fatigue !== undefined ? stats.fatigue : stats.maxFatigue;
  const exhaustion = fatigue < 0 ? Math.floor(Math.abs(fatigue) * 2) : 0;
  const load = -(calculateWeightAndVolume(character).rollModifier || 0); // rollModifier is <= 0
  const parts = [];
  if (starvation) parts.push(`hunger -${starvation}`);
  if (exhaustion) parts.push(`exhaustion -${exhaustion}`);
  if (load) parts.push(`heavy load -${load}`);
  return { total: -(starvation + exhaustion + load) || 0, text: parts.join(', '), starvation, exhaustion, load };
}
