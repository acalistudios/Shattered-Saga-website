import { Preferences } from '@capacitor/preferences';

let memoryCache = {};
let isInitialized = false;

const normalizeKey = (key) => {
  if (key.startsWith('shatteredsaga_') || key.startsWith('shattered_') || key === 'supabase_session_token') {
    return key;
  }
  return `shatteredsaga_${key}`;
};

const mapPortraitIndex = (index) => {
  if (index >= 474 && index <= 545) {
    return index - 108; // Map duplicate Sheets 13 & 14 (474-545) back to original Sheets 10 & 11 (366-437)
  }
  if (index >= 690 && index <= 725) {
    return index - 252; // Map duplicate Sheet 19 (690-725) back to original Sheet 12 (438-473)
  }
  return index;
};

const normalizePortraitUrl = (url) => {
  if (typeof url !== 'string') return url;
  const match = url.match(/\/portraits\/portrait_(\d+)\.(jpg|png)/);
  if (match) {
    const index = parseInt(match[1], 10);
    const mappedIndex = mapPortraitIndex(index);
    if (mappedIndex !== index) {
      return `/portraits/portrait_${mappedIndex}.jpg`;
    }
  }
  return url;
};

const normalizePortraitData = (val) => {
  if (val && typeof val === 'object') {
    if (val.portraitUrl) {
      val.portraitUrl = normalizePortraitUrl(val.portraitUrl);
    }
    if (val.portraitSeed !== undefined) {
      val.portraitSeed = mapPortraitIndex(val.portraitSeed);
    }
  }
  return val;
};

const storage = {
  /**
   * Exposes whether the storage has finished loading.
   */
  isInitialized: () => isInitialized,

  /**
   * Initializes the storage by loading all relevant keys from Capacitor Preferences
   * and localStorage into a fast in-memory cache.
   */
  init: async () => {
    if (isInitialized) return;
    try {
      // 1. Fetch all keys from Capacitor Preferences
      const { keys } = await Preferences.getKeys();
      for (const key of keys) {
        const cleanKey = key.startsWith('_cap_') ? key.substring(5) : key;
        if (cleanKey.startsWith('shatteredsaga_') || cleanKey.startsWith('shattered_') || cleanKey === 'supabase_session_token') {
          const { value } = await Preferences.get({ key: cleanKey });
          try {
            memoryCache[cleanKey] = value !== null ? JSON.parse(value) : null;
          } catch {
            memoryCache[cleanKey] = value;
          }
        }
      }

      // 2. Fallback / Sync from localStorage (for web-only execution or migration)
      Object.keys(localStorage).forEach(key => {
        const cleanKey = key.startsWith('_cap_') ? key.substring(5) : key;
        if (cleanKey.startsWith('shatteredsaga_') || cleanKey.startsWith('shattered_') || cleanKey === 'supabase_session_token') {
          if (!(cleanKey in memoryCache)) {
            const raw = localStorage.getItem(key);
            try {
              memoryCache[cleanKey] = raw !== null ? JSON.parse(raw) : null;
            } catch {
              memoryCache[cleanKey] = raw;
            }
          }
        }
      });

      isInitialized = true;
      console.log('[Storage] Initialized memory cache from Capacitor/LocalStorage. Keys:', Object.keys(memoryCache));
    } catch (e) {
      console.error('[Storage] Capacitor preferences init failed, falling back to localStorage:', e);
      // LocalStorage only fallback
      Object.keys(localStorage).forEach(key => {
        const cleanKey = key.startsWith('_cap_') ? key.substring(5) : key;
        if (cleanKey.startsWith('shatteredsaga_') || cleanKey.startsWith('shattered_') || cleanKey === 'supabase_session_token') {
          const raw = localStorage.getItem(key);
          try {
            memoryCache[cleanKey] = raw !== null ? JSON.parse(raw) : null;
          } catch {
            memoryCache[cleanKey] = raw;
          }
        }
      });
      isInitialized = true;
    }
  },

  /**
   * Synchronous get from the in-memory cache.
   */
  get: (key, defaultValue = null) => {
    const fullKey = normalizeKey(key);
    let val = null;
    if (fullKey in memoryCache && memoryCache[fullKey] !== null) {
      val = memoryCache[fullKey];
    } else {
      // Fallback in case sync read is hit before init finishes
      try {
        let raw = localStorage.getItem(fullKey);
        if (raw === null) {
          raw = localStorage.getItem(`_cap_${fullKey}`);
        }
        if (raw !== null) {
          val = JSON.parse(raw);
        }
      } catch {}
    }
    if (val !== null) {
      return normalizePortraitData(val);
    }
    return defaultValue;
  },

  /**
   * Synchronously sets memory cache and asynchronously writes to Capacitor + localStorage.
   */
  set: (key, value) => {
    const fullKey = normalizeKey(key);
    const normalizedValue = normalizePortraitData(value);
    memoryCache[fullKey] = normalizedValue;

    // Async Capacitor write
    Preferences.set({ key: fullKey, value: JSON.stringify(normalizedValue) }).catch(err => {
      console.error(`[Storage] Capacitor set failed for key ${fullKey}:`, err);
    });

    // Sync localStorage write (keeps DevTools storage tab inspectable)
    try {
      localStorage.setItem(fullKey, JSON.stringify(normalizedValue));
    } catch (e) {
      console.error(`[Storage] LocalStorage write failed for key ${fullKey}:`, e);
    }
    return true;
  },

  /**
   * Synchronously removes from memory cache and asynchronously deletes from Capacitor + localStorage.
   */
  remove: (key) => {
    const fullKey = normalizeKey(key);
    delete memoryCache[fullKey];

    // Async Capacitor remove
    Preferences.remove({ key: fullKey }).catch(err => {
      console.error(`[Storage] Capacitor remove failed for key ${fullKey}:`, err);
    });

    // Sync localStorage remove
    try {
      localStorage.removeItem(fullKey);
    } catch (e) {
      console.error(`[Storage] LocalStorage remove failed for key ${fullKey}:`, e);
    }
    return true;
  },

  /**
   * Clears all campaign and game data.
   */
  clearAll: () => {
    memoryCache = {};

    // Async Capacitor clear for our keys
    Preferences.getKeys().then(({ keys }) => {
      keys.forEach(key => {
        if (key.startsWith('shatteredsaga_') || key.startsWith('shattered_') || key === 'supabase_session_token') {
          Preferences.remove({ key }).catch(() => {});
        }
      });
    }).catch(() => {});

    // Sync localStorage clear
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('shatteredsaga_') || key.startsWith('shattered_') || key === 'supabase_session_token') {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('[Storage] Error clearing game storage:', e);
      return false;
    }
  }
};

export default storage;
