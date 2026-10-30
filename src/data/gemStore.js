// Gem store catalogue (Hans, 2026-10-28, A4). DISPLAY ONLY: the Worker's
// api-worker/src/store.ts owns the real prices and a test keeps them equal.
// Prices are provisional pending Hans's confirmation (15 gems = $3.00).
import { UNDEATH_CURE_ITEM, DIVINE_INTERVENTION_ITEMS } from './resurrection';

export const GEM_STORE_ITEMS = [
  {
    id: 'rite_of_quiet_return',
    item: UNDEATH_CURE_ITEM,
    gems: 10,
    blurb: 'Ends the risen condition and its social penalty. The attribute lost on death does not return.',
  },
  {
    id: 'breath_of_the_creator',
    item: 'Breath of the Creator',
    gems: 8,
    blurb: DIVINE_INTERVENTION_ITEMS['Breath of the Creator'].description,
  },
  {
    id: 'thread_of_returning',
    item: 'Thread of Returning',
    gems: 5,
    blurb: DIVINE_INTERVENTION_ITEMS['Thread of Returning'].description,
  },
];

/**
 * Guest (no account) purchase against the local balance. Signed-in players
 * always go through the server (utils/cloudSaves.js buyStoreItem).
 */
export function buyWithLocalGems(itemId, gems) {
  const entry = GEM_STORE_ITEMS.find(i => i.id === itemId);
  if (!entry || gems < entry.gems) return null;
  return { gems: gems - entry.gems, item: entry.item };
}
