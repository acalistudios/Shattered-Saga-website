// Pure rules for confiscated-gear depots. See src/data/supplyDepot.js.
import { getSupplyDepot, DEPOT_MUNDANE_COUNT, DEPOT_GOOD_DIE } from '../data/supplyDepot';
import { getItemDetails } from './items';

// Whether gear left behind at completion stays held at the depot (A9, Hans
// 2026-10-30) instead of being forfeit. Held gear is released by the depot's
// quartermaster for a fee that grows with every day it waits, and is sold off
// after DEPOT_HOLD_DAYS. The 6 + 1d2 bonus finds come only from reaching the
// depot during the adventure.
export const DEPOT_RECLAIM_ON_RETURN = true;
export const DEPOT_BASE_FEE_CP = 200;      // 2 gp
export const DEPOT_DAILY_FEE_CP = 100;     // + 1 gp per in-game day held
export const DEPOT_FEE_VALUE_CAP = 0.5;    // never more than half the gear's value
export const DEPOT_HOLD_DAYS = 30;

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
 * The adventure ended. Gear never recovered moves to the depot's hold
 * (progression.depotHold) for the quartermaster to release later; with
 * reclaimOnReturn = false it is forfeit instead.
 */
export function settleConfiscatedOnCompletion(character, reclaimOnReturn = DEPOT_RECLAIM_ON_RETURN, { adventureId = null, day = 1 } = {}) {
  const lost = [...(character.confiscatedGear || [])];
  if (lost.length === 0) return { character, lost: [], held: [] };
  if (!reclaimOnReturn) return { character: { ...character, confiscatedGear: [] }, lost, held: [] };
  const previous = character.progression?.depotHold;
  const hold = {
    adventureId: previous?.adventureId || adventureId,
    items: [...(previous?.items || []), ...lost],
    heldSinceDay: previous?.heldSinceDay ?? day,
  };
  return {
    character: { ...character, confiscatedGear: [], progression: { ...(character.progression || {}), depotHold: hold } },
    lost: [],
    held: lost,
  };
}

const coinCpOf = (currency = {}) => (currency.gp ?? currency.gold ?? 0) * 100 + (currency.sp || 0) * 10 + (currency.cp || 0);
const withCoinCp = (currency = {}, total) => {
  const gp = Math.floor(total / 100);
  return { ...currency, gp, sp: Math.floor((total % 100) / 10), cp: total % 10, gold: gp };
};
const itemValueCp = (item) => getItemDetails(item)?.valueCp || 0;

/**
 * What the quartermaster holds and what he charges today. null when nothing is
 * held. expired = held past DEPOT_HOLD_DAYS and sold off.
 */
export function getDepotHold(character, valueOf = itemValueCp) {
  const hold = character?.progression?.depotHold;
  if (!hold?.items?.length) return null;
  const today = character?.stats?.day ?? 1;
  const daysHeld = Math.max(0, today - (hold.heldSinceDay ?? today));
  const valueCp = hold.items.reduce((sum, item) => sum + valueOf(item), 0);
  const feeCp = Math.min(DEPOT_BASE_FEE_CP + DEPOT_DAILY_FEE_CP * daysHeld, Math.round(valueCp * DEPOT_FEE_VALUE_CAP));
  return {
    ...hold,
    daysHeld,
    valueCp,
    feeCp: Math.max(0, feeCp),
    daysLeft: Math.max(0, DEPOT_HOLD_DAYS - daysHeld),
    expired: daysHeld > DEPOT_HOLD_DAYS,
  };
}

/**
 * Pay the quartermaster and take the held gear back. Gear held too long is
 * gone: the hold is cleared with nothing returned. Returns the same character
 * when the player cannot pay.
 */
export function reclaimDepotHold(character, valueOf = itemValueCp) {
  const hold = getDepotHold(character, valueOf);
  if (!hold) return { character, recovered: [], paidCp: 0, expired: false };
  const cleared = { ...(character.progression || {}), depotHold: null };
  if (hold.expired) {
    return {
      character: {
        ...character,
        progression: cleared,
        storyEvents: [...(character.storyEvents || []), `The depot quartermaster sold off your held gear: ${hold.items.join(', ')}.`],
      },
      recovered: [],
      paidCp: 0,
      expired: true,
    };
  }
  const coin = coinCpOf(character.currency);
  if (coin < hold.feeCp) return { character, recovered: [], paidCp: 0, expired: false };
  return {
    character: {
      ...character,
      currency: withCoinCp(character.currency, coin - hold.feeCp),
      inventory: [...(character.inventory || []), ...hold.items],
      progression: cleared,
      storyEvents: [...(character.storyEvents || []), `Reclaimed held gear from the depot quartermaster: ${hold.items.join(', ')}.`],
    },
    recovered: hold.items,
    paidCp: hold.feeCp,
    expired: false,
  };
}

/** Free-roam returns are not captivity: never strip the player again. */
export const shouldConfiscateOnEntry = (adventure, isFreeRoam) => !!adventure?.stripEquipment && !isFreeRoam;
