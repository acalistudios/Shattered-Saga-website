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

// Found coin is the engine's call, not the GM's (Hans, 2026-11-07): left to
// the GM it was never awarded. A successful search-type check whose action is
// a search pays one find, at most one per location and
// TREASURE_FINDS_PER_ADVENTURE per adventure.
export const SEARCH_SKILLS = ['perception', 'lockpicking', 'thievery', 'appraise'];
const SEARCH_ACTION_RE = /\b(search|searches|searching|look(?:s|ing)? (?:for|through|inside|under|behind)|loot|rummage|ransack|pry|prise|pick(?:s|ing)? the lock|unlock|open(?:s|ing)? the (?:chest|box|strongbox|desk|drawer|coffer|lockbox|safe)|purse|pouch|coin|chest|strongbox|coffer|lockbox|drawer|stash|hoard|hidden compartment|false bottom|valuables?)\b/i;

export const isSearchAction = (text = '') => SEARCH_ACTION_RE.test(String(text));

const normLocation = (location) => String(location || '').trim().toLowerCase();

/**
 * Coin for a successful search, or null. Paid only on a first run of the
 * adventure (replays and free roam after completion find nothing).
 */
export function claimSearchFind(character, { adventureId, campaignOrder, skillId, success, actionText, location }) {
  if (!adventureId || !campaignOrder || !success) return null;
  if (!SEARCH_SKILLS.includes(skillId) || !isSearchAction(actionText)) return null;
  if ((character?.completed_adventures || []).includes(adventureId)) return null;
  const found = character?.progression?.treasureFinds?.[adventureId] || 0;
  if (found >= TREASURE_FINDS_PER_ADVENTURE) return null;
  const place = normLocation(location);
  const searched = character?.progression?.treasureLocations?.[adventureId] || [];
  if (place && searched.includes(place)) return null;
  return { amountCp: treasureFindCp(campaignOrder), count: found + 1, location: place };
}

/** Pay a find returned by claimSearchFind into the purse and record it. */
export function applySearchFind(character, adventureId, find) {
  if (!find) return character;
  const c = character.currency || {};
  const total = (c.gp ?? c.gold ?? 0) * 100 + (c.sp || 0) * 10 + (c.cp || 0) + find.amountCp;
  const gp = Math.floor(total / 100);
  const progression = character.progression || {};
  return {
    ...character,
    currency: { ...c, gp, sp: Math.floor((total % 100) / 10), cp: total % 10, gold: gp },
    progression: {
      ...progression,
      treasureFinds: { ...(progression.treasureFinds || {}), [adventureId]: find.count },
      treasureLocations: {
        ...(progression.treasureLocations || {}),
        [adventureId]: [...(progression.treasureLocations?.[adventureId] || []), ...(find.location ? [find.location] : [])],
      },
    },
  };
}
