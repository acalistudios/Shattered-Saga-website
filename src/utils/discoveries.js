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

export const getLoan = (itemName) => LOANED_ITEMS[itemName] || null;

/** Record newly obtained authored items of this adventure. Same object if nothing is new. */
export function recordDiscoveries(character, adventureId, day = character?.stats?.day ?? 1) {
  const adventure = adventureId ? getAdventureById(adventureId) : null;
  if (!adventure?.items?.length) return character;
  const progression = character.progression || {};
  const known = progression.discoveries?.[adventureId] || [];
  const knownNames = new Set(known.map((d) => d.item));
  const fresh = adventure.items.filter((item) => (character.inventory || []).includes(item) && !knownNames.has(item));
  if (fresh.length === 0) return character;

  const loans = { ...(progression.loans || {}) };
  fresh.forEach((item) => {
    if (getLoan(item) && !loans[item]) loans[item] = { status: 'active', adventureId, since: day };
  });
  return {
    ...character,
    progression: {
      ...progression,
      loans,
      discoveries: {
        ...(progression.discoveries || {}),
        [adventureId]: [
          ...known,
          ...fresh.map((item) => ({ item, note: ITEM_NOTES[item] || null, day })),
        ],
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
  const rooms = (Array.isArray(location) ? location : [location]).map(norm);
  let next = character;
  for (const item of removedItems) {
    const loan = getLoan(item);
    const state = next.progression?.loans?.[item];
    if (!loan || !state) continue;
    const atOwner = rooms.includes(norm(loan.ownerLocation));
    if (state.status === 'active') {
      next = settleLoan(next, item, atOwner ? 'returned' : 'used');
    } else if (state.status === 'kept' && atOwner) {
      next = settleLoan(next, item, 'lateReturn');
    }
  }
  return next;
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
    if (state.status === 'active' && state.adventureId === adventureId && (next.inventory || []).includes(item)) {
      next = settleLoan(next, item, 'kept');
    }
  }
  return next;
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
