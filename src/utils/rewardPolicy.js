// What the GM is allowed to change about the player's possessions.
//
// Design rule (Hans, 2026-10-21): the AI does not hand out rewards. Rewards
// are predefined — the reward tables pay out on adventure completion, and the
// only things the GM may put in the player's hands mid-adventure are:
//   - items AUTHORED for the current adventure (adventures.js `items`), each
//     at most once, e.g. Threx's Ledger in the Saltblood Mines; and
//   - the player's own confiscated gear, returned rather than copied.
// Gold and currency can only be taken away by the GM (bribes, tolls,
// purchases), never granted. Anything else is dropped and logged.
//
// In the 2026-10-20 real-GM playtest the GM minted a "Pack" that does not
// exist in the game, which then caused an encumbrance penalty.

const norm = (s) => String(s || '').toLowerCase().trim();

/**
 * Split GM [add_item] grants into allowed and blocked.
 * Returns which allowed items come back from confiscated gear, so the caller
 * can move them instead of minting copies.
 */
export function filterGmItemGrants({ items = [], adventureItems = [], confiscatedGear = [], inventory = [] } = {}) {
  const authored = new Map(adventureItems.map(i => [norm(i), i]));
  const confiscated = [...confiscatedGear];
  const owned = new Set(inventory.map(norm));
  const allowed = [];
  const returned = [];
  const blocked = [];

  for (const raw of items) {
    const key = norm(raw);
    const cIdx = confiscated.findIndex(c => norm(c) === key);
    if (cIdx !== -1) {
      returned.push(confiscated[cIdx]);
      allowed.push(confiscated[cIdx]);
      confiscated.splice(cIdx, 1);
      continue;
    }
    if (authored.has(key) && !owned.has(key)) {
      const canonical = authored.get(key);
      allowed.push(canonical);
      owned.add(key); // a second grant of the same authored item in one reply is blocked
      continue;
    }
    blocked.push(raw);
  }

  return { allowed, returned, blocked, remainingConfiscated: confiscated };
}

/** The GM may charge the player, never pay them. Keeps only deductions. */
export function filterGmCurrencyChanges(changes = []) {
  const allowed = changes.filter(c => Number(c.amount) < 0);
  const blocked = changes.filter(c => Number(c.amount) >= 0);
  return { allowed, blocked };
}

/**
 * Elemental abilities are awakened in the Elemental Crucible, and only for the
 * character's own affinity. Anywhere else, or for another element, the GM's
 * unlock is ignored.
 */
export function isElementalUnlockAllowed({ element, characterElement, activeAdventureId }) {
  return activeAdventureId === 'elemental_crucible' && norm(element) === norm(characterElement);
}
