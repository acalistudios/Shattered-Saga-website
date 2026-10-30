// Coin payouts scale with campaign position (A8, Hans 2026-10-30).
// n is the adventure's campaignOrder (1..18). Amounts are in copper:
// 100 cp = 1 gp (data/economy.js).
//
//   completion payout  P(n) = 8 gp x 1.15^(n-1), rounded to whole gp
//   in-adventure coin       = half of P(n), found in up to 3 equal finds
//   patrol coin cap         = 10% of P(next adventure), at least 5 sp
//   arena fees              = 5/10/20/40% of P(14), purse 3x the fee

export const PAYOUT_BASE_GP = 8;
export const PAYOUT_GROWTH = 1.15;
export const TREASURE_SHARE = 0.5;
export const TREASURE_FINDS_PER_ADVENTURE = 3;
export const PATROL_SHARE = 0.1;
export const PATROL_MIN_CP = 50;
export const ARENA_REFERENCE_ADVENTURE = 14;
export const ARENA_FEE_SHARES = [0.05, 0.1, 0.2, 0.4];
export const ARENA_PURSE_MULTIPLIER = 3;

const position = (n) => Math.max(1, Math.floor(Number(n) || 1));

export const completionPayoutGp = (n) => Math.round(PAYOUT_BASE_GP * PAYOUT_GROWTH ** (position(n) - 1));
export const completionPayoutCp = (n) => completionPayoutGp(n) * 100;
export const treasureBudgetCp = (n) => Math.round(completionPayoutCp(n) * TREASURE_SHARE);
export const treasureFindCp = (n) => Math.floor(treasureBudgetCp(n) / TREASURE_FINDS_PER_ADVENTURE);
export const patrolCoinCapCp = (nextN) => Math.max(PATROL_MIN_CP, Math.round(completionPayoutCp(nextN) * PATROL_SHARE));

export const arenaFeeGp = (bracketIndex) => Math.max(1, Math.round(
  completionPayoutGp(ARENA_REFERENCE_ADVENTURE) * (ARENA_FEE_SHARES[bracketIndex] ?? ARENA_FEE_SHARES[0])
));
export const arenaPurseGp = (bracketIndex) => arenaFeeGp(bracketIndex) * ARENA_PURSE_MULTIPLIER;

/** "8 gp 3 sp" style label for a copper amount. */
export const formatCoin = (amountCp = 0) => {
  const total = Math.max(0, Math.round(amountCp));
  const parts = [];
  const gp = Math.floor(total / 100);
  const sp = Math.floor((total % 100) / 10);
  const cp = total % 10;
  if (gp) parts.push(`${gp} gp`);
  if (sp) parts.push(`${sp} sp`);
  if (cp || parts.length === 0) parts.push(`${cp} cp`);
  return parts.join(' ');
};

/**
 * The GM says the player found coin ([treasure_found]); the engine decides how
 * much. Paid only on a first run of the adventure and at most
 * TREASURE_FINDS_PER_ADVENTURE times. Returns null when nothing is paid.
 */
export function claimTreasureFind(character, adventureId, campaignOrder) {
  if (!adventureId || !campaignOrder) return null;
  if ((character?.completed_adventures || []).includes(adventureId)) return null;
  const found = character?.progression?.treasureFinds?.[adventureId] || 0;
  if (found >= TREASURE_FINDS_PER_ADVENTURE) return null;
  return { amountCp: treasureFindCp(campaignOrder), count: found + 1 };
}
