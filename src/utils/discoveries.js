// Journal discoveries and loaned items (Hans, 2026-11-12).
//
// When an adventure's authored item first reaches the inventory, the journal
// records it with a plain note on what it is for (data/itemObjectives.js).
// Items an NPC lends (LOANED_ITEMS) are tracked to the end: setting them to
// their purpose, returning them, or walking off with them each changes the
// owner's standing (localEconomy.relationships, which also sets shop prices).
import { getAdventureById } from '../data/adventureLookup';
import { ITEM_NOTES, LOANED_ITEMS } from '../data/itemObjectives';

const norm = (s) => String(s || '').trim().toLowerCase();
const count = (list, item) => (list || []).filter((i) => i === item).length;

export const getLoan = (itemName) => LOANED_ITEMS[itemName] || null;

const atOwner = (loan, location) => {
  const rooms = (Array.isArray(location) ? location : [location]).map(norm);
  return loan.ownerLocations.some((room) => rooms.includes(norm(room)));
};

// Copies of an item bought from this adventure's merchants (e.g. Water-Breathing
// Elixirs) are the player's own; only a copy beyond those is a loan.
const boughtThisRun = (character, adventureId, item) => Object.values(
  character.progression?.adventureTrades?.[adventureId] || {},
).reduce((n, log) => n + (log.bought?.[item] || 0), 0);

/** Whether the lent copy is still in the pack (more copies than were bought). */
const holdsLoan = (character, adventureId, item) =>
  count(character.inventory, item) > boughtThisRun(character, adventureId, item);

/** Start tracking loaned items of this adventure now in the pack. */
function startLoans(character, adventureId, day) {
  const loans = character.progression?.loans || {};
  const fresh = Object.entries(LOANED_ITEMS).filter(([item, loan]) => loan.adventureId === adventureId
    && !loans[item]
    && holdsLoan(character, adventureId, item));
  if (fresh.length === 0) return character;
  const next = { ...loans };
  fresh.forEach(([item]) => { next[item] = { status: 'active', adventureId, since: day }; });
  return { ...character, progression: { ...(character.progression || {}), loans: next } };
}

/**
 * Record newly obtained authored items of this adventure, and start any loans.
 * Returns the same object if nothing is new.
 */
export function recordDiscoveries(character, adventureId, day = character?.stats?.day ?? 1) {
  const adventure = adventureId ? getAdventureById(adventureId) : null;
  if (!adventure?.items?.length) return character;
  const withLoans = startLoans(character, adventureId, day);
  const progression = withLoans.progression || {};
  const known = progression.discoveries?.[adventureId] || [];
  const knownNames = new Set(known.map((d) => d.item));
  const fresh = adventure.items.filter((item) => (withLoans.inventory || []).includes(item) && !knownNames.has(item));
  if (fresh.length === 0) return withLoans;
  return {
    ...withLoans,
    progression: {
      ...progression,
      discoveries: {
        ...(progression.discoveries || {}),
        [adventureId]: [...known, ...fresh.map((item) => ({ item, note: ITEM_NOTES[item] || null, day }))],
      },
    },
  };
}

/** Change the loan's status, the owner's standing, and the story log. */
function settleLoan(character, itemName, outcome) {
  const loan = getLoan(itemName);
  if (!loan) return character;
  const amount = loan.reputation[outcome] ?? 0;
  const rels = { ...(character.localEconomy?.relationships || {}) };
  rels[loan.owner] = Math.max(-100, Math.min(100, (rels[loan.owner] || 0) + amount));
  const progression = character.progression || {};
  return {
    ...character,
    localEconomy: { ...(character.localEconomy || {}), relationships: rels },
    storyEvents: [...(character.storyEvents || []), loan.outcomes[outcome]],
    progression: {
      ...progression,
      loans: { ...(progression.loans || {}), [itemName]: { ...(progression.loans?.[itemName] || {}), status: outcome } },
    },
  };
}

/**
 * The GM removed items ([remove_item]). A loaned item given up where its owner
 * stands was returned; anywhere else it was used for its purpose. `location`
 * may be a list (the room the turn started in and the room it moved to).
 */
export function resolveLoanRemovals(character, removedItems = [], location = '') {
  let next = character;
  for (const item of removedItems) {
    const loan = getLoan(item);
    const state = next.progression?.loans?.[item];
    if (!loan || !state) continue;
    if (state.status === 'active') {
      next = settleLoan(next, item, atOwner(loan, location) ? 'returned' : 'used');
    } else if (state.status === 'kept' && atOwner(loan, location)) {
      next = settleLoan(next, item, 'lateReturn');
    }
  }
  return next;
}

/**
 * A borrowed item left the pack some other way (drunk, used from the
 * inventory, taken by the GM): settle it as above. Items the player only
 * dropped (`dropped`) or has equipped are still theirs, so are skipped.
 */
export function settleMissingLoans(character, adventureId, location = '', dropped = []) {
  const equipped = Object.values(character.equipment || {});
  const gone = Object.entries(character.progression?.loans || {})
    .filter(([item, state]) => state.status === 'active' && state.adventureId === adventureId
      && !holdsLoan(character, adventureId, item) && !equipped.includes(item) && !dropped.includes(item))
    .map(([item]) => item);
  return gone.length ? resolveLoanRemovals(character, gone, location) : character;
}

/** Hand a loaned item back to its owner (Trade screen). Same object if not possible. */
export function returnLoan(character, itemName) {
  const loan = getLoan(itemName);
  const state = character.progression?.loans?.[itemName];
  const idx = (character.inventory || []).indexOf(itemName);
  if (!loan || !state || idx === -1 || !['active', 'kept'].includes(state.status)) return character;
  const without = { ...character, inventory: character.inventory.filter((_, i) => i !== idx) };
  return settleLoan(without, itemName, state.status === 'kept' ? 'lateReturn' : 'returned');
}

/** Leaving the adventure while still holding a loaned item: it is kept. */
export function settleLoansOnLeave(character, adventureId) {
  let next = character;
  for (const [item, state] of Object.entries(character.progression?.loans || {})) {
    if (state.status === 'active' && state.adventureId === adventureId && holdsLoan(next, adventureId, item)) {
      next = settleLoan(next, item, 'kept');
    }
  }
  return next;
}

/** Items the player is currently borrowing (or kept), which are not theirs to sell. */
export function itemsOnLoan(character) {
  return Object.entries(character?.progression?.loans || {})
    .filter(([, state]) => ['active', 'kept'].includes(state.status))
    .map(([item]) => item);
}

/** Loaned items this merchant owns that the player can hand back. */
export function returnableLoans(character, merchantName) {
  return Object.entries(character.progression?.loans || {})
    .filter(([item, state]) => getLoan(item)?.owner === merchantName
      && ['active', 'kept'].includes(state.status) && (character.inventory || []).includes(item))
    .map(([item]) => item);
}

export const LOAN_STATUS_LABEL = {
  active: 'Borrowed',
  used: 'Used as intended',
  returned: 'Returned',
  kept: 'Kept (not returned)',
  lateReturn: 'Returned late',
};
