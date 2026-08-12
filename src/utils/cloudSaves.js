// Cloud save sync.
//
// Design: localStorage remains the WORKING COPY — the game reads and writes it
// synchronously on every turn, so play stays fast and works offline. This module
// mirrors a slot up to the Worker on a debounce (and at key moments), and can
// pull a slot back down. Conflicts are last-write-wins by `updatedAt`, with the
// caller deciding whether to prompt.
//
// Guests / sandbox players have no account, so isBackendConfigured + an active
// session are required for any of this to run; otherwise everything stays local.
import storage from './storage';
import { API_URL, isBackendConfigured, getToken } from './authApi';

// The per-slot storage keys that make up a save. Mirrors useGameState.
export const SLOT_KEYS = [
  'character', 'active_gm_id', 'gm_energies', 'history', 'journal',
  'handoff_state', 'skill_tally', 'active_adventure_id', 'safety_state',
  'next_roll_modifier', 'current_location', 'dropped_items', 'npc_memory',
  'active_enemy', 'counter_opportunities', 'combat_stance', 'region_memory',
  'adventure_summaries', 'pre_adventure_character', 'last_check',
  'enemy_attacks_queue',
];

// `history` is by far the largest field, and old turns have no gameplay value
// once the context window has moved past them (the game caps context at 8/25
// turns). Only the raw transcript is trimmed — everything that carries lasting
// state is synced in full: `journal` (story so far / major events),
// `npc_memory` (relationships, trust/fear, known facts), `region_memory`,
// `adventure_summaries`, and `character.storyEvents`.
const MAX_SYNCED_HISTORY = 100;

// Highest slot index the game supports.
const MAX_SLOTS = 8;

// Gem cost of unlocking an extra character slot. Must match the server, which
// is authoritative — this copy is only used for wording the prompt.
const SLOT_COST = 5;
const SAVE_OWNER_KEY = 'local_save_owner_id';
const GUEST_OWNER = 'guest';

const authHeaders = () => {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};

// Session-bearing requests work with either Better Auth's bearer token
// (email/password) or the cross-subdomain session cookie (Google/Facebook).
const canSync = () => isBackendConfigured;

/** Read a slot out of local storage into a plain object. */
export function collectSlot(slotIndex) {
  const data = {};
  for (const key of SLOT_KEYS) {
    const v = storage.get(`slot_${slotIndex}_${key}`);
    if (v !== null && v !== undefined) data[key] = v;
  }
  if (Array.isArray(data.history) && data.history.length > MAX_SYNCED_HISTORY) {
    data.history = data.history.slice(-MAX_SYNCED_HISTORY);
  }
  return data;
}

/** Write a downloaded slot back into local storage. */
export function applySlot(slotIndex, data) {
  if (!data || typeof data !== 'object') return false;
  for (const key of SLOT_KEYS) {
    if (key in data) storage.set(`slot_${slotIndex}_${key}`, data[key]);
  }
  return true;
}

function clearLocalSlot(slotIndex) {
  for (const key of SLOT_KEYS) {
    storage.remove(`slot_${slotIndex}_${key}`);
    storage.remove(`shatteredsaga_slot_${slotIndex}_${key}`);
  }
  storage.remove(`slot_${slotIndex}_local_updated_at`);
  storage.remove(`slot_${slotIndex}_cloud_synced_at`);
}

export function clearLocalSlots() {
  for (let i = 1; i <= MAX_SLOTS; i++) clearLocalSlot(i);
  storage.remove('active_slot_index');
  storage.remove('shatteredsaga_active_slot_index');
  storage.remove('shatteredsaga_auto_load_game');
  storage.remove('shatteredsaga_auto_start_creation');
}

export function setLocalSaveOwner(ownerId) {
  storage.set(SAVE_OWNER_KEY, ownerId || GUEST_OWNER);
}

export function prepareLocalSlotsForAccount(accountId) {
  if (!accountId) return;
  const currentOwner = storage.get(SAVE_OWNER_KEY);

  // Once a device has been used by a real account, another account must start
  // from its own cloud copy. Unmarked legacy/guest saves are left in place so
  // the login reconciliation can offer to claim them instead of deleting them.
  if (currentOwner && currentOwner !== GUEST_OWNER && currentOwner !== accountId) {
    clearLocalSlots();
  }

  setLocalSaveOwner(accountId);
}

export function prepareLocalSlotsForGuest() {
  setLocalSaveOwner(GUEST_OWNER);
}

/** Slot metadata for every cloud save (small response). */
export async function listCloudSlots() {
  if (!canSync()) return [];
  try {
    const res = await fetch(`${API_URL}/api/saves`, { headers: authHeaders(), credentials: 'include' });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d.slots) ? d.slots : [];
  } catch {
    return [];
  }
}

/** Push one slot to the cloud. Returns true on success. */
export async function pushSlot(slotIndex) {
  if (!canSync()) return false;
  const data = collectSlot(slotIndex);
  if (!data.character?.name) return false; // nothing worth syncing yet
  try {
    const res = await fetch(`${API_URL}/api/saves/${slotIndex}`, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ data, charName: data.character.name }),
    });
    if (res.ok) {
      storage.set(`slot_${slotIndex}_cloud_synced_at`, Date.now());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Pull one slot from the cloud into local storage. */
export async function pullSlot(slotIndex) {
  if (!canSync()) return false;
  try {
    const res = await fetch(`${API_URL}/api/saves/${slotIndex}`, {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return false;
    const d = await res.json();
    const applied = applySlot(slotIndex, d.data);
    if (applied) storage.set(`slot_${slotIndex}_cloud_synced_at`, d.updatedAt || Date.now());
    return applied;
  } catch {
    return false;
  }
}

export async function deleteCloudSlot(slotIndex) {
  if (!canSync()) return false;
  try {
    const res = await fetch(`${API_URL}/api/saves/${slotIndex}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Spend gems server-side. Returns the new balance, or null if refused. */
export async function spendGems(amount, reason = '') {
  if (!canSync()) return null;
  try {
    const res = await fetch(`${API_URL}/api/gems/spend`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ amount, reason }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return typeof d.gems === 'number' ? d.gems : null;
  } catch {
    return null;
  }
}

/** Unlock a save slot with gems (server validates cost and balance). */
export async function unlockSlot(slotIndex) {
  if (!canSync()) return null;
  try {
    const res = await fetch(`${API_URL}/api/slots/unlock`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ slot: slotIndex }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- debounced background sync -------------------------------------------

const timers = new Map();

/**
 * Queue a slot for upload. Repeated calls reset the timer, so a burst of turns
 * results in one upload once play settles rather than one request per keystroke.
 */
export function queueSync(slotIndex, delayMs = 15000) {
  if (!canSync()) return;
  clearTimeout(timers.get(slotIndex));
  timers.set(slotIndex, setTimeout(() => {
    timers.delete(slotIndex);
    pushSlot(slotIndex);
  }, delayMs));
}

/** Force any pending upload to happen now (adventure end, exit, logout). */
export async function flushSync(slotIndex) {
  clearTimeout(timers.get(slotIndex));
  timers.delete(slotIndex);
  return pushSlot(slotIndex);
}

const forceTimers = new Map();
const forceInFlight = new Set();

/**
 * Persist a gameplay checkpoint as soon as possible. If several state slices
 * change in the same turn, collapse them into one upload; if an upload is
 * already running, schedule one more pass so the latest local state wins.
 */
export function queueImmediateSync(slotIndex, delayMs = 250) {
  if (!canSync()) return;
  clearTimeout(forceTimers.get(slotIndex));
  forceTimers.set(slotIndex, setTimeout(async () => {
    forceTimers.delete(slotIndex);
    if (forceInFlight.has(slotIndex)) {
      queueImmediateSync(slotIndex, delayMs);
      return;
    }
    forceInFlight.add(slotIndex);
    try {
      await flushSync(slotIndex);
    } finally {
      forceInFlight.delete(slotIndex);
    }
  }, delayMs));
}

// --- login reconciliation -------------------------------------------------

const localCharName = (i) => storage.get(`slot_${i}_character`)?.name || null;
const localUpdatedAt = (i) => Number(storage.get(`slot_${i}_local_updated_at`) || 0);
const isSynced = (i) => !!storage.get(`slot_${i}_cloud_synced_at`);

const fmtDate = (ms) =>
  ms ? new Date(Number(ms)).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'unknown date';

/** Move a slot's local data to another slot index (used to make room). */
function moveLocalSlot(from, to) {
  for (const key of SLOT_KEYS) {
    const v = storage.get(`slot_${from}_${key}`);
    if (v !== null && v !== undefined) storage.set(`slot_${to}_${key}`, v);
    storage.remove(`slot_${from}_${key}`);
  }
  const stamp = storage.get(`slot_${from}_local_updated_at`);
  if (stamp) storage.set(`slot_${to}_local_updated_at`, stamp);
  storage.remove(`slot_${from}_local_updated_at`);
  storage.remove(`slot_${from}_cloud_synced_at`);
}

/**
 * Reconcile local saves against the cloud, once per login.
 *
 * ORDER MATTERS: every local character that has never been backed up is
 * uploaded FIRST, before anything is pulled down. An earlier version pulled
 * first, which meant a player with local characters signing into an account
 * holding different characters either destroyed their local ones (unrecoverable
 * — they had never been synced) or kept them and never synced them at all.
 * Nothing is overwritten here until it exists in the cloud.
 *
 * `confirm` is injected so this module stays UI-agnostic and testable.
 */
export async function reconcileOnLogin({ confirm, unlockedSlots = [1, 2], gems = 0, onBuySlot }) {
  if (!canSync()) return { restored: [], uploaded: [], relocated: [], unsaved: [] };

  const cloud = await listCloudSlots();
  const cloudByIndex = new Map(cloud.map((s) => [s.slot_index, s]));
  const occupied = new Set(cloud.map((s) => s.slot_index));
  const result = { restored: [], uploaded: [], relocated: [], unsaved: [] };

  // Slots the player actually owns. Extra slots are bought with gems, so we
  // never silently place a character into one they haven't paid for.
  let owned = new Set(unlockedSlots);
  let gemBalance = gems;

  const freeOwnedSlot = () => {
    for (let i = 1; i <= MAX_SLOTS; i++) {
      if (owned.has(i) && !occupied.has(i) && !localCharName(i)) return i;
    }
    for (let i = 1; i <= MAX_SLOTS; i++) if (owned.has(i) && !occupied.has(i)) return i;
    return null;
  };

  /**
   * Called when a character has nowhere to go. Never deletes anything — offers
   * to buy a slot, and otherwise leaves the character on this device so the
   * player can decide (delete someone, or buy a slot) from the menu.
   */
  const tryMakeRoom = async (name) => {
    const nextLocked = (() => {
      for (let i = 1; i <= MAX_SLOTS; i++) if (!owned.has(i)) return i;
      return null;
    })();

    if (nextLocked == null) {
      await confirm(
        `"${name}" can't be saved to your account — all ${MAX_SLOTS} character slots are full.\n\n` +
        `It stays safe on this device. To sync it, delete a character you no longer want from the main menu.`
      );
      return null;
    }

    if (gemBalance < SLOT_COST) {
      await confirm(
        `"${name}" needs another character slot to sync, which costs ${SLOT_COST} gems — you have ${gemBalance}.\n\n` +
        `It stays safe on this device. Buy gems or free a slot from the main menu, then sign in again.`
      );
      return null;
    }

    const buy = await confirm(
      `"${name}" needs another character slot to save to your account.\n\n` +
      `Unlock a new slot for ${SLOT_COST} gems? (You have ${gemBalance}.)\n` +
      `Choose Cancel to leave it on this device instead — nothing will be deleted.`
    );
    if (!buy || !onBuySlot) return null;

    const res = await onBuySlot(nextLocked);
    if (!res?.ok) return null;
    if (Array.isArray(res.unlockedSlots)) owned = new Set(res.unlockedSlots);
    if (typeof res.gems === 'number') gemBalance = res.gems;
    return freeOwnedSlot();
  };

  // --- Phase 1: back up local-only characters before anything is replaced ---
  for (let i = 1; i <= MAX_SLOTS; i++) {
    const name = localCharName(i);
    if (!name || isSynced(i)) continue;

    const cloudHere = cloudByIndex.get(i);

    if (!cloudHere) {
      const okToUpload = await confirm(
        `Save "${name}" (slot ${i}, last played ${fmtDate(localUpdatedAt(i))}) to your account?\n\n` +
        `It currently exists only on this device.`
      );
      if (okToUpload && (await pushSlot(i))) {
        occupied.add(i);
        result.uploaded.push({ slot: i, name });
      }
      continue;
    }

    if (cloudHere.char_name === name) continue; // same character, nothing to protect

    // Slot taken in the cloud by a DIFFERENT character. Relocate the local one
    // to a free slot so both survive.
    let free = freeOwnedSlot();
    if (free == null) free = await tryMakeRoom(name);
    if (free == null) {
      result.unsaved.push({ slot: i, name });
      continue;
    }
    const okToMove = await confirm(
      `Slot ${i} holds "${name}" here (last played ${fmtDate(localUpdatedAt(i))}), ` +
      `but your account has "${cloudHere.char_name}" (saved ${fmtDate(cloudHere.updated_at)}) in that slot.\n\n` +
      `Move "${name}" to slot ${free} and save it to your account? Both characters are kept.`
    );
    if (!okToMove) continue;

    moveLocalSlot(i, free);
    if (await pushSlot(free)) {
      occupied.add(free);
      result.relocated.push({ from: i, to: free, name });
    }
  }

  // --- Phase 2: restore cloud saves that are newer than this device ---
  for (const s of cloud) {
    const i = s.slot_index;
    const name = localCharName(i);
    const localAt = localUpdatedAt(i);

    // Nothing here now (possibly just relocated away) — restore silently.
    if (!name) {
      if (await pullSlot(i)) result.restored.push({ slot: i, name: s.char_name });
      continue;
    }
    // Same character and the cloud isn't newer — leave it alone.
    if (s.char_name === name && s.updated_at <= localAt + 1000) continue;

    const okToPull = await confirm(
      `Slot ${i}: your account has "${s.char_name}" saved ${fmtDate(s.updated_at)}.\n` +
      `This device has "${name}" last played ${fmtDate(localAt)}.\n\n` +
      `Load the version from your account? The copy on this device will be replaced.`
    );
    if (okToPull && (await pullSlot(i))) result.restored.push({ slot: i, name: s.char_name });
  }

  return result;
}
