// Pure rules for confiscated-gear depots. See src/data/supplyDepot.js.
import { getSupplyDepot, DEPOT_MUNDANE_COUNT, DEPOT_GOOD_DIE } from '../data/supplyDepot';

// Whether gear left behind can be reclaimed by returning to a completed
// adventure in free-roam. false = strict "depot or nothing": completing the
// adventure without reaching the depot forfeits the gear. (Pending Hans's
// call, 2026-10-23; flipping this is the whole change.)
export const DEPOT_RECLAIM_ON_RETURN = false;

const norm = (s) => String(s || '').toLowerCase().trim();

// Draw n distinct entries from a pool.
function drawDistinct(pool, n, rng) {
  const left = [...pool];
  const out = [];
  while (out.length < n && left.length > 0) {
    out.push(left.splice(Math.floor(rng() * left.length) % left.length, 1)[0]);
  }
  return out;
}

export const isAtDepot = (adventureId, location) => {
  const depot = getSupplyDepot(adventureId);
  return !!depot && norm(location) === norm(depot.location);
};

/**
 * The player reached the depot. Returns their confiscated gear and, on the
 * FIRST visit only, 6 ordinary items plus 1d2 good ones. Returns the same
 * character object when there is nothing to do, so callers can skip writes.
 */
export function claimDepot(character, adventureId, rng = Math.random) {
  const depot = getSupplyDepot(adventureId);
  if (!depot) return { character, recovered: [], found: [] };

  const claimed = character?.progression?.depotClaimed || {};
  const recovered = [...(character.confiscatedGear || [])];
  const firstVisit = !claimed[adventureId];
  const found = firstVisit
    ? [
        ...drawDistinct(depot.mundane, DEPOT_MUNDANE_COUNT, rng),
        ...drawDistinct(depot.good, 1 + Math.floor(rng() * DEPOT_GOOD_DIE), rng),
      ]
    : [];

  if (recovered.length === 0 && found.length === 0) return { character, recovered, found };

  return {
    recovered,
    found,
    character: {
      ...character,
      inventory: [...(character.inventory || []), ...recovered, ...found],
      confiscatedGear: [],
      progression: { ...(character.progression || {}), depotClaimed: { ...claimed, [adventureId]: true } },
    },
  };
}

/**
 * The adventure ended. Under strict rules, gear never recovered is forfeit.
 * With DEPOT_RECLAIM_ON_RETURN it stays held at the depot for a later visit.
 */
export function settleConfiscatedOnCompletion(character, reclaimOnReturn = DEPOT_RECLAIM_ON_RETURN) {
  const lost = [...(character.confiscatedGear || [])];
  if (lost.length === 0 || reclaimOnReturn) return { character, lost: [] };
  return { character: { ...character, confiscatedGear: [] }, lost };
}

/** Free-roam returns are not captivity: never strip the player again. */
export const shouldConfiscateOnEntry = (adventure, isFreeRoam) => !!adventure?.stripEquipment && !isFreeRoam;
