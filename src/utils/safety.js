// Safety Manager Utility for Shattered Saga (V4)
import storage from './storage';

// Regex-based checks for forbidden concepts (rape, incest, child abuse, graphic torture)
const FORBIDDEN_PATTERNS = [
  /\brape\b/i,
  /\braping\b/i,
  /\brapist\b/i,
  /\bincest\b/i,
  /\bincestuous\b/i,
  /\bchild abuse\b/i,
  /\bpedophil\w*/i,
  /\bpaedophil\w*/i,
  /\bgraphic torture\b/i,
  /\bhurting (little )?kids\b/i,
  /\bhurting (little )?children\b/i,
  /\btortur\w* (little )?kids\b/i,
  /\btortur\w* (little )?children\b/i,
  /\babusing (little )?kids\b/i,
  /\babusing (little )?children\b/i
];

export function checkSafetyViolation(text) {
  if (!text) return false;
  return FORBIDDEN_PATTERNS.some(pattern => pattern.test(text));
}

export const GM_VOICES = {
  titan: 'a booming voice made of volcanic thunder',
  oracle: 'a mystical shriek heard on the wind of fate',
  ancient: 'a scholarly whisper filled with disappointment'
};

// Strike 1: Standard Warning
export function getGMStrikeWarning(gmName, gmId, gender = 'Other') {
  const voice = GM_VOICES[gmId] || 'a cold, resonant echo';
  const pronoun = gender.toLowerCase() === 'male' ? 'He' : (gender.toLowerCase() === 'female' ? 'She' : 'They');
  return `The ${gmName} frowns at you. ${pronoun} announces in ${voice}: "Your desired action is at odds with the needs of the realm. To be heroic, you must rise above evil. We all must strive to be better, some more than others."`;
}

// Strike 2: Stern Warning
export function getGMSternWarning(gmName, gmId, gender = 'Other') {
  const voice = GM_VOICES[gmId] || 'a cold, resonant echo';
  const pronoun = gender.toLowerCase() === 'male' ? 'He' : (gender.toLowerCase() === 'female' ? 'She' : 'They');
  return `The ${gmName} glares at you with absolute authority. ${pronoun} thunders in ${voice}: "This is your final warning. The threads of fate will sever if you persist in these dark deeds. Turn back, or be cast out of this chronicle entirely."`;
}

/**
 * Calculates lockout duration in milliseconds.
 * Lockout days = 2 + lockoutCount (e.g. 1st time = 3 days, 2nd time = 4 days, etc.)
 */
export function calculateLockoutExpiry(lockoutCount) {
  const days = 2 + lockoutCount;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Checks if a player has locked out ALL unlocked save slots.
 * If yes, they are permanently banned.
 */
export function isGloballyBanned(username) {
  if (!username) return false;
  
  const unlockedSlots = storage.get(`shattered_unlocked_slots_${username}`) || [1, 2];
  let playableCount = 0;

  unlockedSlots.forEach((slotIdx) => {
    // Check if slot has a character
    const char = storage.get(`slot_${slotIdx}_character`, null);
    
    // Empty slots are always playable (user can create a new character)
    if (!char || !char.name) {
      playableCount++;
      return;
    }

    // Check if slot safety state is locked
    const safety = storage.get(`slot_${slotIdx}_safety_state`, null);
    if (safety && safety.lockoutExpiryTimestamp) {
      const isLocked = new Date(safety.lockoutExpiryTimestamp).getTime() > Date.now();
      if (!isLocked) {
        playableCount++;
      }
    } else {
      playableCount++;
    }
  });

  return playableCount === 0;
}
