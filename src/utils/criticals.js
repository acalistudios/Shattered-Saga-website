// Critical hits and fumbles in combat (Hans 2026-11-20).
//
// The Rules page promised a Critical Triumph at +8 and a Catastrophic Fumble at
// -8, but in combat a hit by 12 dealt the same as a hit by 1. Kept small so a
// lucky roll tilts a fight without deciding it:
// - your attack beats the foe's defence by CRIT_MARGIN or more: +CRIT_BONUS damage;
// - it misses by CRIT_MARGIN or more: you are Off Balance (-2 to your
//   dodges and blocks) until your next action;
// - you defend against a foe by CRIT_MARGIN or more: the foe has fumbled and
//   you get a counter-attack for certain.
// A foe that beats your defence by a lot already deals extra damage (a third of
// its margin) and may cause bleeding, so the foe has no separate critical.

export const CRIT_MARGIN = 8;
export const CRIT_BONUS = 3;

/** 'critical' | 'fumble' | null for an attack total against a defence total. */
export function attackOutcome(attackTotal, defenceTotal) {
  const margin = attackTotal - defenceTotal;
  if (margin >= CRIT_MARGIN) return 'critical';
  if (margin <= -CRIT_MARGIN) return 'fumble';
  return null;
}

/** Extra damage for a critical hit (0 otherwise). */
export const critBonus = (attackTotal, defenceTotal) => (attackOutcome(attackTotal, defenceTotal) === 'critical' ? CRIT_BONUS : 0);

export const isFumble = (attackTotal, defenceTotal) => attackOutcome(attackTotal, defenceTotal) === 'fumble';

/** True when the player's defence beat the foe's attack by enough to open it up. */
export const foeFumbled = (defenceTotal, attackTotal) => defenceTotal - attackTotal >= CRIT_MARGIN;

export const CRIT_NOTE = ` Critical hit! +${CRIT_BONUS} damage.`;
export const FUMBLE_NOTE = ' Fumble! You are Off Balance: -2 to dodges and blocks until your next action.';
