/** Retry narration for a prepared engine action, never reroll/recharge the action. */
export function createPreparedNarrationTurn(run) {
  let accepted = false;
  let inFlight = null;
  return () => {
    if (accepted) return Promise.resolve();
    if (inFlight) return inFlight;
    inFlight = Promise.resolve()
      .then(() => run(() => { accepted = true; }))
      .finally(() => { inFlight = null; });
    return inFlight;
  };
}

// A simple conversation has no committed dice/combat outcome to preserve.
// Bleeding, statuses and dying timers are engine actions, not refundable narration.
export function canDeferNarrationCosts(skillId, enemy, stats) {
  return !skillId && !enemy && stats.hp > 0 && !stats.bleedingTier
    && stats.deathCountdown == null && !(stats.statuses || []).length;
}
