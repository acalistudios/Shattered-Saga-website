// Bend Luck (Hans 2026-11-21): a character with Luck ranks can bend chance
// before a roll. The next skill check, attack or defence is rolled twice and
// the better result kept; the second roll gets +1 for every 2 ranks of Luck.
// Uses per rest also grow with rank:
//   Luck 1: 1 use, +0    Luck 2: 1 use, +1    Luck 3: 2 uses, +1
//   Luck 4: 2 uses, +2   Luck 5: 3 uses, +2   Luck 6: 3 uses, +3
// While dying, a use instead holds the death countdown for one action.
// State lives in character.progression: bendLuckUsed (count since rest) and
// bendLuckArmed (true until the next roll spends it). Rest clears both.

export const luckRank = (character) => character?.skills?.luck || 0;

/** Uses per rest: 1 at Luck 1-2, 2 at 3-4, 3 at 5-6. */
export const bendLuckUses = (rank) => (rank > 0 ? Math.ceil(rank / 2) : 0);

/** Bonus on the second roll: +1 for every 2 ranks. */
export const bendLuckBonus = (rank) => Math.floor(Math.max(0, rank) / 2);

export function bendLuckLeft(character) {
  return Math.max(0, bendLuckUses(luckRank(character)) - (character?.progression?.bendLuckUsed || 0));
}

export const isLuckArmed = (character) => Boolean(character?.progression?.bendLuckArmed);

/**
 * Bend a roll. `firstDice` is the random part already rolled; `rollAgain`
 * rolls the same dice again. Returns the dice to use and a note for the log.
 */
export function bendRoll(firstDice, rollAgain, bonus = 0) {
  const second = rollAgain() + bonus;
  const kept = Math.max(firstDice, second);
  const note = `Bend Luck: rolled ${firstDice}, then ${second - bonus}${bonus ? ` +${bonus}` : ''} = ${second}; kept ${kept}`;
  return { dice: kept, gain: kept - firstDice, second, note };
}

/** Arm Bend Luck for the next roll; returns the new progression, or null if none is left. */
export function armBendLuck(character) {
  if (isLuckArmed(character) || bendLuckLeft(character) <= 0) return null;
  return { ...(character.progression || {}), bendLuckArmed: true, bendLuckUsed: (character.progression?.bendLuckUsed || 0) + 1 };
}

/** Disarm without refunding (the roll spent it). */
export const spendArmedLuck = (progression) => ({ ...(progression || {}), bendLuckArmed: false });

/** Disarm and refund (the player changed their mind before rolling). */
export const cancelBendLuck = (progression) => ({
  ...(progression || {}),
  bendLuckArmed: false,
  bendLuckUsed: Math.max(0, (progression?.bendLuckUsed || 0) - 1),
});
