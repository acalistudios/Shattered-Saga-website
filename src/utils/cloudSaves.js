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

// History is by far the largest field and old turns have no gameplay value once
// the context window has moved past them (the game itself caps context at 8/25
// turns). Trim before upload so saves stay well under the server's size cap.
const MAX_SYNCED_HISTORY = 60;

const authHeaders = () => {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};

const canSync = () => isBackendConfigured && !!getToken();

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

/**
 * Decide, per slot, whether the cloud copy is newer than what's on this device.
 * Returns slots where cloud > local so the caller can offer to restore.
 */
export async function findNewerCloudSlots() {
  const cloud = await listCloudSlots();
  const newer = [];
  for (const s of cloud) {
    const localAt = Number(storage.get(`slot_${s.slot_index}_cloud_synced_at`) || 0);
    const localChar = storage.get(`slot_${s.slot_index}_character`);
    // Newer cloud data, or nothing on this device at all.
    if (!localChar?.name || s.updated_at > localAt + 1000) {
      newer.push(s);
    }
  }
  return newer;
}
