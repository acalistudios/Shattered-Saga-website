import { useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import { GMS, SAGA_ENGINES, BASE_SYSTEM_PROMPT, SKILLS_LIST, PROFESSIONS_LIST, ELEMENTS_LIST } from '../data/gms';
import { calculateWeightAndVolume, getItemDetails, getItemSlot } from '../utils/items';
import { generateCompletion, executeOpposedCheck, rollDie, rollAttributePrimary, rollAttributeSecondary, rollSkillRanks } from '../utils/ai';
import { ADVENTURES_LIST } from '../data/adventures';
import { checkSafetyViolation, getGMStrikeWarning, getGMSternWarning, calculateLockoutExpiry, isGloballyBanned } from '../utils/safety';

function consumeRationFromInventory(inventory) {
  let hasRations = false;
  let updatedInventory = inventory.map(item => {
    const match = item.match(/Rations(?:\s*\((\d+)\))?/i);
    if (match && !hasRations) {
      hasRations = true;
      if (match[1]) {
        const count = parseInt(match[1], 10);
        if (count > 1) {
          return `Rations (${count - 1})`;
        } else {
          return null; // Consumed the last one
        }
      } else {
        return null; // Consumed the only one
      }
    }
    return item;
  }).filter(Boolean);

  return { hasRations, updatedInventory };
}

function consumeInventoryItem(inventory, namePattern) {
  let consumed = false;
  const regex = new RegExp(`^${namePattern}(?:\\s*\\((\\d+)\\))?`, 'i');
  const nextInventory = inventory.map(item => {
    const match = item.match(regex);
    if (match && !consumed) {
      consumed = true;
      if (match[1]) {
        const count = parseInt(match[1], 10);
        if (count > 1) {
          const cleanName = item.split('(')[0].trim();
          return `${cleanName} (${count - 1})`;
        } else {
          return null; // Consumed the last one
        }
      } else {
        return null; // Consumed the only one
      }
    }
    return item;
  }).filter(Boolean);

  return { consumed, nextInventory };
}

function getMagicBonus(itemName) {
  if (!itemName) return 0;
  const match = itemName.match(/\+(\d+)\b/);
  return match ? parseInt(match[1], 10) : 0;
}

function getArmorType(armorName) {
  if (!armorName) return 'none';
  const nameLower = armorName.toLowerCase();
  if (nameLower.includes('heavy') || nameLower.includes('plate') || nameLower.includes('heavy duty apron')) {
    return 'heavy';
  }
  if (nameLower.includes('medium') || nameLower.includes('chainmail') || nameLower.includes('reinforced apron') || nameLower.includes('ringmail')) {
    return 'medium';
  }
  return 'light';
}

function getVigorDie(vigor) {
  if (vigor <= 1) return 4;
  if (vigor === 2) return 6;
  if (vigor === 3) return 8;
  if (vigor === 4) return 10;
  return 12; // vigor 5
}

function rollDiceExpression(expr) {
  if (!expr) return 0;
  let clean = expr.replace(/\s+/g, '').toLowerCase();
  const terms = clean.split(/(?=[+-])/);
  let total = 0;
  for (let term of terms) {
    let sign = 1;
    if (term.startsWith('+')) {
      term = term.slice(1);
    } else if (term.startsWith('-')) {
      sign = -1;
      term = term.slice(1);
    }
    if (!term) continue;
    const match = term.match(/^(\d*)d(\d+)$/);
    if (match) {
      const count = match[1] ? parseInt(match[1], 10) : 1;
      const sides = parseInt(match[2], 10);
      let rollSum = 0;
      for (let i = 0; i < count; i++) {
        rollSum += Math.floor(Math.random() * sides) + 1;
      }
      total += sign * rollSum;
    } else {
      const num = parseInt(term, 10);
      if (!isNaN(num)) {
        total += sign * num;
      }
    }
  }
  return total;
}

function getShieldSoakDie(shieldName) {
  if (!shieldName) return 4;
  const nameLower = shieldName.toLowerCase();
  if (nameLower.includes('tower') || nameLower.includes('heavy') || nameLower.includes('reinforced')) {
    return 8;
  }
  if (nameLower.includes('buckler') || nameLower.includes('hide') || nameLower.includes('leather') || nameLower.includes('wood') || nameLower.includes('targe')) {
    return 4;
  }
  return 6; // default to medium shield (d6)
}





function getArrowCount(inventory) {
  for (const item of inventory) {
    const match = item.match(/Arrows?\s*\((\d+)\)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return 0;
}

function consumeArrowFromInventory(inventory) {
  let consumed = false;
  const nextInventory = inventory.map(item => {
    const match = item.match(/Arrows?\s*\((\d+)\)/i);
    if (match && !consumed) {
      consumed = true;
      const count = parseInt(match[1], 10);
      if (count > 1) {
        return `Arrows (${count - 1})`;
      } else {
        return null; // Consumed last arrow
      }
    }
    return item;
  }).filter(Boolean);
  return { consumed, nextInventory };
}

function getActionCost(skillId) {
  if (!skillId) {
    return { fatigue: 0.01, time: 0.0166 }; // 1 min (1/60 hours)
  }
  
  const FATIGUE_1_SKILLS = ['acrobatics', 'athletics', 'blocking', 'brawling', 'heavy_weapons', 'light_weapons', 'performance', 'smithing'];
  const FATIGUE_05_SKILLS = ['crafting', 'escapology', 'herbalism', 'marksmanship', 'survival', 'thievery', 'thrown_weapons', 'tracking', 'trapping'];

  if (FATIGUE_1_SKILLS.includes(skillId)) {
    if (['acrobatics', 'blocking', 'brawling', 'heavy_weapons', 'light_weapons'].includes(skillId)) {
      return { fatigue: 0.1, time: 0.0028 }; // 10 seconds (10/3600 hours)
    }
    if (skillId === 'smithing') {
      return { fatigue: 1.0, time: 1.0 }; // 1 hour
    }
    if (skillId === 'athletics') {
      return { fatigue: 0.5, time: 0.1667 }; // 10 minutes
    }
    if (skillId === 'performance') {
      return { fatigue: 0.2, time: 0.1667 }; // 10 minutes
    }
    return { fatigue: 0.1, time: 0.1667 }; // fallback
  }

  if (FATIGUE_05_SKILLS.includes(skillId)) {
    if (['marksmanship', 'thrown_weapons'].includes(skillId)) {
      return { fatigue: 0.1, time: 0.0028 }; // 10 seconds in combat
    }
    if (skillId === 'crafting') {
      return { fatigue: 0.5, time: 0.5 }; // 30 minutes
    }
    if (['lockpicking', 'trapping', 'escapology', 'thievery'].includes(skillId)) {
      return { fatigue: 0.05, time: 0.0833 }; // 5 minutes
    }
    if (['tracking', 'perception', 'survival', 'herbalism'].includes(skillId)) {
      return { fatigue: 0.1, time: 0.1667 }; // 10 minutes
    }
    return { fatigue: 0.05, time: 0.0833 }; // fallback
  }

  if (['arcane_shaping', 'divine_manifestation'].includes(skillId)) {
    return { fatigue: 0.0, time: 0.0028 }; // 10 seconds (SP cast is separate)
  }

  return { fatigue: 0.01, time: 0.0166 }; // 1 minute
}

function advanceTime(currentDay, currentHour, hoursDelta) {
  let nextHour = currentHour + hoursDelta;
  let nextDay = currentDay;
  let advancedMidnight = false;
  
  while (nextHour >= 24.0) {
    nextHour -= 24.0;
    nextDay += 1;
    advancedMidnight = true;
  }
  
  return { nextDay, nextHour, advancedMidnight };
}

function formatTime(day, hourFloat) {
  const totalMinutes = Math.round(hourFloat * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `Day ${day}, ${displayHours}:${displayMinutes} ${ampm}`;
}

const DEFAULT_CHARACTER = {
  name: '',
  gender: 'Other',
  age: 'middle', // 'youth' | 'middle' | 'elder'
  element: 'air',
  attributes: {
    power: 1,
    coordination: 1,
    vigor: 1,
    willpower: 1,
    intellect: 1,
    charisma: 1,
    attunement: 1,
    empathy: 1
  },
  skills: {}, // { acrobatics: 0, ... }
  professions: [], // array of ids
  hobbySkills: [], // array of ids
  virtue: '',
  vice: '',
  philosophy: 'Skeptic',
  personality: { practicality: 0, action: 0 },
  stats: { 
    hp: 10, 
    maxHp: 10, 
    level: 1, 
    fatigue: 15, 
    maxFatigue: 15, 
    arcaneSP: 0, 
    maxArcaneSP: 0, 
    divineSP: 0, 
    maxDivineSP: 0, 
    day: 1, 
    hour: 13.0,
    bleedingTier: 0,
    deathCountdown: null,
    defenseCount: 0,
    elementalAbility: null,
    elementalAbilityUsed: false
  },
  inventory: ['Bedroll', 'Rations (5)', 'Tinderbox', 'Waterskin'],
  active_quests: ['Explore the High Fantasy Realm'],
  completed_quests: [],
  completed_adventures: [],
  is_free_roaming: false,
  equipment: {
    head: null,
    neck: null,
    body: null,
    legs: null,
    feet: null,
    hands: null, // gloves
    hand_right: null,
    hand_left: null,
    ring_left: null,
    ring_right: null,
    backpack: 'Small Backpack',
    hip_left: null,
    hip_right: null,
    hip_left_sheathed: null,
    hip_right_sheathed: null
  },
  setting: 'High Fantasy',
  morality: 0,
  daysWithoutFood: 0,
  scars: { maxHpPenalty: 0, notes: [] },
  portraitUrl: null,
  storage: ["Tent", "Cooking Pot"],
  currency: { gp: 100, sp: 0, cp: 0, gold: 100, fateCoins: 0 },
  strongholds: ["None"],
  relationships: { "Sylas the Wise": "Friendly" },
};

const DEFAULT_ENERGIES = {
  oracle: 100,
  titan: 100,
  ancient: 100,
};

const DEFAULT_SAFETY_STATE = {
  strikeTier: 0,                // 0 = clean, 1 = warning, 2 = stern warning, 3 = locked out
  lastStrikeTimestamp: null,
  cleanActionsCount: 0,
  lockoutCount: 0,
  lockoutExpiryTimestamp: null,
  isPermanentlyBanned: false
};

export default function useGameState() {
  const activeSlotIndex = storage.get('active_slot_index', 1);

  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    const sessionToken = storage.get('supabase_session_token');
    if (!sessionToken) {
      setUserProfile(null);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Simulation Mode
      const email = storage.get('shattered_email') || 'adventurer@saga.com';
      const mockProfile = storage.get(`mock_supabase_profile_${email}`, {
        email,
        energy_balance: 100,
        subscription_tier: 'free',
        subscription_status: 'none'
      });
      setUserProfile(mockProfile);
      return;
    }

    try {
      const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${sessionToken}`
        }
      });
      if (!authRes.ok) throw new Error("Auth token invalid");
      const userData = await authRes.json();
      const userId = userData.id;

      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${sessionToken}`
        }
      });
      if (!profileRes.ok) throw new Error("Profile retrieval failed");
      const profiles = await profileRes.json();
      if (profiles && profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (e) {
      console.error("Failed to fetch Supabase user profile:", e);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    const handleStorageChange = () => {
      fetchUserProfile();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('shattered_auth_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('shattered_auth_update', handleStorageChange);
    };
  }, [fetchUserProfile]);

  const [character, setCharacter] = useState(() => {
    const raw = storage.get(`slot_${activeSlotIndex}_character`, DEFAULT_CHARACTER);
    if (raw && raw.name) {
      if (raw.currency && raw.currency.gold !== undefined && raw.currency.gp === undefined) {
        raw.currency.gp = raw.currency.gold;
        raw.currency.sp = 0;
        raw.currency.cp = 0;
      }
      if (raw.stats) {
        if (raw.stats.bleedingTier === undefined) raw.stats.bleedingTier = 0;
        if (raw.stats.deathCountdown === undefined) raw.stats.deathCountdown = null;
        if (raw.stats.defenseCount === undefined) raw.stats.defenseCount = 0;
      }
    }
    return raw;
  });
  const [activeGmId, setActiveGmId] = useState(() => storage.get(`slot_${activeSlotIndex}_active_gm_id`, null));
  const [gmEnergies, setGmEnergies] = useState(() => storage.get(`slot_${activeSlotIndex}_gm_energies`, DEFAULT_ENERGIES));
  const [history, setHistory] = useState(() => storage.get(`slot_${activeSlotIndex}_history`, []));
  const [journal, setJournal] = useState(() => storage.get(`slot_${activeSlotIndex}_journal`, { storySoFar: '', recentTurns: [] }));
  // Skill tally for the adventure step
  const [skillTally, setSkillTally] = useState(() => storage.get(`slot_${activeSlotIndex}_skill_tally`, {}));
  const [lastCheck, setLastCheck] = useState(() => storage.get(`slot_${activeSlotIndex}_last_check`, null));
  const [enemyAttacksQueue, setEnemyAttacksQueue] = useState(() => storage.get(`slot_${activeSlotIndex}_enemy_attacks_queue`, []));

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_enemy_attacks_queue`, enemyAttacksQueue);
    }
  }, [enemyAttacksQueue, activeSlotIndex, character?.name]);

  // Adventure, Safety and Roll states
  const [activeAdventureId, setActiveAdventureId] = useState(() => storage.get(`slot_${activeSlotIndex}_active_adventure_id`, null));
  const [safetyState, setSafetyState] = useState(() => storage.get(`slot_${activeSlotIndex}_safety_state`, DEFAULT_SAFETY_STATE));
  const [nextRollModifier, setNextRollModifier] = useState(() => storage.get(`slot_${activeSlotIndex}_next_roll_modifier`, 0));
  const [lastActionParams, setLastActionParams] = useState(null);
  const [handoffState, setHandoffState] = useState(() => storage.get(`slot_${activeSlotIndex}_handoff_state`, null));
  const [lastHandoffJson, setLastHandoffJson] = useState(null);
  const [isHandoffScreenVisible, setIsHandoffScreenVisible] = useState(false);

  // Codex Architecture: NPC Memory, Location, and Ground Items state
  const [currentLocation, setCurrentLocation] = useState(() => storage.get(`slot_${activeSlotIndex}_current_location`, ''));
  const [droppedItems, setDroppedItems] = useState(() => storage.get(`slot_${activeSlotIndex}_dropped_items`, {}));
  const [npcMemory, setNpcMemory] = useState(() => storage.get(`slot_${activeSlotIndex}_npc_memory`, {}));

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);
  
  // Milestone upgrade screen state
  const [isUpgradeScreenVisible, setIsUpgradeScreenVisible] = useState(false);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_character`, character);
    }
  }, [character, activeSlotIndex]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_active_gm_id`, activeGmId);
    }
  }, [activeGmId, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_gm_energies`, gmEnergies);
    }
  }, [gmEnergies, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_active_adventure_id`, activeAdventureId);
    }
  }, [activeAdventureId, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_safety_state`, safetyState);
    }
  }, [safetyState, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_next_roll_modifier`, nextRollModifier);
    }
  }, [nextRollModifier, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_history`, history);
    }
  }, [history, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_journal`, journal);
    }
  }, [journal, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_skill_tally`, skillTally);
    }
  }, [skillTally, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_last_check`, lastCheck);
    }
  }, [lastCheck, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_handoff_state`, handoffState);
    }
  }, [handoffState, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_current_location`, currentLocation);
    }
  }, [currentLocation, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_dropped_items`, droppedItems);
    }
  }, [droppedItems, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name) {
      storage.set(`slot_${activeSlotIndex}_npc_memory`, npcMemory);
    }
  }, [npcMemory, activeSlotIndex, character?.name]);

  useEffect(() => {
    if (character && character.name && character.stats) {
      const vigor = character.attributes?.vigor || 1;
      const drawingRank = character.skills?.arcane_drawing || 0;
      const communionRank = character.skills?.divine_communion || 0;

      const expectedMaxFatigue = 12.5 + 2.5 * vigor;
      const expectedMaxArcane = drawingRank * 3;
      const expectedMaxDivine = communionRank * 3;

      let needsUpdate = false;
      const stats = { ...character.stats };
      let completed_quests = character.completed_quests;
      let active_quests = character.active_quests;
      let equipment = character.equipment;

      if (stats.fatigue === undefined) {
        stats.fatigue = expectedMaxFatigue;
        needsUpdate = true;
      }
      if (stats.maxFatigue === undefined || stats.maxFatigue !== expectedMaxFatigue) {
        stats.maxFatigue = expectedMaxFatigue;
        needsUpdate = true;
      }
      if (stats.arcaneSP === undefined) {
        stats.arcaneSP = expectedMaxArcane;
        needsUpdate = true;
      }
      if (stats.maxArcaneSP === undefined || stats.maxArcaneSP !== expectedMaxArcane) {
        stats.maxArcaneSP = expectedMaxArcane;
        needsUpdate = true;
      }
      if (stats.divineSP === undefined) {
        stats.divineSP = expectedMaxDivine;
        needsUpdate = true;
      }
      if (stats.maxDivineSP === undefined || stats.maxDivineSP !== expectedMaxDivine) {
        stats.maxDivineSP = expectedMaxDivine;
        needsUpdate = true;
      }
      if (stats.day === undefined) {
        stats.day = 1;
        needsUpdate = true;
      }
      if (stats.hour === undefined) {
        stats.hour = 13.0;
        needsUpdate = true;
      }

      if (completed_quests === undefined) {
        completed_quests = [];
        needsUpdate = true;
      }
      if (active_quests === undefined) {
        active_quests = ['Explore the High Fantasy Realm'];
        needsUpdate = true;
      }
      if (equipment === undefined) {
        equipment = {
          head: null, neck: null, body: null, legs: null, feet: null, hands: null,
          hand_right: null, hand_left: null, ring_left: null, ring_right: null,
          backpack: 'Small Backpack', hip_left: null, hip_right: null,
          hip_left_sheathed: null, hip_right_sheathed: null
        };
        needsUpdate = true;
      } else {
        const isOldEquipment = equipment.weapon !== undefined || equipment.shield !== undefined || equipment.armor !== undefined || equipment.hand_right === undefined;
        if (isOldEquipment) {
          const oldWeapon = equipment.weapon;
          const oldShield = equipment.shield;
          const oldArmor = equipment.armor;
          equipment = {
            head: null,
            neck: null,
            body: oldArmor || null,
            legs: null,
            feet: null,
            hands: null,
            hand_right: oldWeapon || null,
            hand_left: oldShield || null,
            ring_left: null,
            ring_right: null,
            backpack: equipment.backpack || 'Small Backpack',
            hip_left: null,
            hip_right: null,
            hip_left_sheathed: null,
            hip_right_sheathed: null
          };
          needsUpdate = true;
        }
      }
      let completed_adventures = character.completed_adventures;
      let is_free_roaming = character.is_free_roaming;
      if (completed_adventures === undefined) {
        completed_adventures = [];
        needsUpdate = true;
      }
      if (is_free_roaming === undefined) {
        is_free_roaming = false;
        needsUpdate = true;
      }

      if (needsUpdate) {
        setCharacter(prev => ({
          ...prev,
          stats,
          completed_quests: completed_quests || [],
          active_quests: active_quests || ['Explore the High Fantasy Realm'],
          equipment: equipment,
          completed_adventures: completed_adventures || [],
          is_free_roaming: is_free_roaming !== undefined ? is_free_roaming : false
        }));
      }
    }
  }, [character, activeSlotIndex]);

  const activeGm = GMS.find(g => g.id === activeGmId);

  // Checks energy recharges periodically
  const checkEnergyResets = useCallback(() => {
    const now = new Date();
    let updated = false;
    const newEnergies = { ...gmEnergies };

    GMS.forEach((gm) => {
      if (newEnergies[gm.id] < 100) {
        const lastReset = storage.get(`last_reset_${gm.id}`, null);
        const resetToday = new Date();
        resetToday.setUTCHours(gm.resetTimeUTC.hour, gm.resetTimeUTC.minute, 0, 0);

        const nowMs = now.getTime();
        const resetTodayMs = resetToday.getTime();
        
        if (!lastReset || (nowMs >= resetTodayMs && new Date(lastReset).getTime() < resetTodayMs)) {
          newEnergies[gm.id] = 100;
          storage.set(`last_reset_${gm.id}`, now.toISOString());
          updated = true;
        }
      }
    });

    if (updated) {
      setGmEnergies(newEnergies);
    }
  }, [gmEnergies]);

  useEffect(() => {
    checkEnergyResets();
    const interval = setInterval(checkEnergyResets, 30000);
    return () => clearInterval(interval);
  }, [checkEnergyResets]);

  const isGmDepleted = useCallback((gmId, engineTier = 'free') => {
    if (engineTier !== 'premium') return false;
    return gmEnergies[gmId] <= 0;
  }, [gmEnergies]);

  const isGmLocked = useCallback((gmId) => {
    return false;
  }, []);

  const getResetCountdown = (gmId) => {
    const gm = GMS.find(g => g.id === gmId);
    if (!gm) return '';

    const now = new Date();
    const target = new Date();
    target.setUTCHours(gm.resetTimeUTC.hour, gm.resetTimeUTC.minute, 0, 0);

    if (now.getTime() >= target.getTime()) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Compile Starting Character sheet
  const createCharacter = (creationData) => {
    const {
      name,
      gender,
      age,
      element,
      attributes, // distributed points on top of base 1
      professions, // array of ids
      hobbySkills, // array of ids
      virtue,
      vice,
      philosophy,
      personality
    } = creationData;

    // 1. Establish attributes starting from base 1
    const finalAttributes = {
      power: 1,
      coordination: 1,
      vigor: 1,
      willpower: 1,
      intellect: 1,
      charisma: 1,
      attunement: 1,
      empathy: 1
    };

    // Add player-allocated points
    Object.keys(attributes).forEach((key) => {
      finalAttributes[key] = Math.min(5, finalAttributes[key] + (attributes[key] || 0));
    });

    // Apply Elemental modifiers (+1 bonus)
    const elementData = ELEMENTS_LIST.find((e) => e.id === element);
    if (elementData && elementData.bonus) {
      Object.keys(elementData.bonus).forEach((stat) => {
        finalAttributes[stat] = Math.min(5, finalAttributes[stat] + elementData.bonus[stat]);
      });
    }

    // 2. Establish Skills
    const finalSkills = {};
    SKILLS_LIST.forEach((s) => {
      finalSkills[s.id] = 0;
    });

    // Add profession skills (+1 per chosen slot)
    professions.forEach((profId) => {
      const prof = PROFESSIONS_LIST.find((p) => p.id === profId);
      if (prof) {
        prof.skills.forEach((sk) => {
          finalSkills[sk] = Math.min(5, (finalSkills[sk] || 0) + 1);
        });
      }
    });

    // Add hobby skills (+1 per selection)
    hobbySkills.forEach((skId) => {
      finalSkills[skId] = Math.min(5, (finalSkills[skId] || 0) + 1);
    });

    // 3. Starting HP based on Vigor: HP = 10 + Vigor * 2
    const startingHP = 10 + (finalAttributes.vigor * 2);

    // Starting gear based on professions (with duplicates yielding upgrades)
    const profCounts = {};
    professions.forEach(profId => {
      profCounts[profId] = (profCounts[profId] || 0) + 1;
    });

    // All characters start with a dagger as a weapon
    const gearList = ['Bedroll', 'Rations (5)', 'Waterskin', 'Dagger'];
    
    // Starting gold scales by age tier: Youth (5 GP), Middle (10 GP), Elder (15 GP)
    let startingGold = 10; // default fallback
    if (age === 'youth') startingGold = 5;
    else if (age === 'middle') startingGold = 10;
    else if (age === 'elder') startingGold = 15;

    Object.entries(profCounts).forEach(([profId, count]) => {
      if (profId === 'soldier') {
        if (count === 1) gearList.push('Steel Sword', 'Iron Shield');
        else if (count === 2) gearList.push('Steel Sword', 'Steel Shield');
        else if (count === 3) gearList.push('Bastard Sword', 'Steel Shield');
        else if (count === 4) gearList.push('Bastard Sword', 'Reinforced Steel Shield');
        else gearList.push('Bastard Sword +1', 'Steel Shield +1');
      }
      else if (profId === 'scholar') {
        if (count === 1) gearList.push('Spell Book', 'Ink & Quill');
        else if (count === 2) gearList.push('Spell Book', 'Fine Ink & Quill');
        else if (count === 3) gearList.push('Enchanted Spell Tome', 'Fine Ink & Quill');
        else if (count === 4) gearList.push('Enchanted Spell Tome', 'Silver Inkwell');
        else gearList.push('Enchanted Spell Tome +1', 'Silver Inkwell');
      }
      else if (profId === 'cleric') {
        if (count === 1) gearList.push('Staff', 'Holy Emblem');
        else if (count === 2) gearList.push('Staff', 'Polished Holy Emblem');
        else if (count === 3) gearList.push('Iron-shod Staff', 'Silver Holy Symbol');
        else if (count === 4) gearList.push('Iron-shod Staff', 'Gilded Holy Symbol');
        else gearList.push('Iron-shod Staff +1', 'Gilded Holy Symbol +1');
      }
      else if (profId === 'hunter') {
        if (count === 1) gearList.push('Longbow', 'Hunting Trap');
        else if (count === 2) gearList.push('Longbow', 'Improved Hunting Trap');
        else if (count === 3) gearList.push('Composite Bow', 'Improved Hunting Trap');
        else if (count === 4) gearList.push('Composite Bow', 'Steel Hunting Trap');
        else gearList.push('Composite Bow +1', 'Steel Hunting Trap');
        gearList.push(`Arrows (${10 * count})`);
      }
      else if (profId === 'bard') {
        if (count === 1) gearList.push('Lute', 'Fop Outfit');
        else if (count === 2) gearList.push('Lute', 'Fine Silk Outfit');
        else if (count === 3) gearList.push('Masterwork Mandolin', 'Fine Silk Outfit');
        else if (count === 4) gearList.push('Masterwork Mandolin', 'Aristocrat Finery');
        else gearList.push('Masterwork Mandolin +1', 'Aristocrat Finery');
      }
      else if (profId === 'craftsman') {
        if (count === 1) gearList.push('Tool Kit', 'Leather Apron');
        else if (count === 2) gearList.push('Tool Kit', 'Reinforced Apron');
        else if (count === 3) gearList.push('Masterwork Tool Kit', 'Reinforced Apron');
        else if (count === 4) gearList.push('Masterwork Tool Kit', 'Heavy Duty Apron');
        else gearList.push('Masterwork Tool Kit +1', 'Heavy Duty Apron');
      }
      else if (profId === 'bandit') {
        if (count === 1) gearList.push('Lockpicks');
        else if (count === 2) gearList.push('Lockpicks', 'Extra Dagger');
        else if (count === 3) gearList.push('Masterwork Lockpicks', 'Dual Daggers');
        else if (count === 4) gearList.push('Masterwork Lockpicks', 'Fine Daggers (2)');
        else gearList.push('Masterwork Lockpicks', 'Dual Daggers +1');
        startingGold += count * 2.5; // Bandit extra gold (+25 silver per slot)
      }
      else if (profId === 'duelist') {
        if (count === 1) gearList.push('Short Sword');
        else if (count === 2) gearList.push('Fencing Foil');
        else if (count === 3) gearList.push('Rapier');
        else if (count === 4) gearList.push('Balanced Rapier');
        else gearList.push('Rapier +1');
      }
      else if (profId === 'farmer') {
        if (count === 1) gearList.push('Pitchfork');
        else if (count === 2) gearList.push('Heavy Pitchfork');
        else if (count === 3) gearList.push('Scythe');
        else if (count === 4) gearList.push('Iron Scythe');
        else gearList.push('Scythe +1');
      }
      else if (profId === 'healer') {
        if (count === 1) gearList.push('Bandages (5)', 'Healing Herbs');
        else if (count === 2) gearList.push('Bandages (10)', 'Healing Herbs (3)');
        else if (count === 3) gearList.push('Healer\'s Satchel', 'Poultices (5)');
        else if (count === 4) gearList.push('Healer\'s Satchel', 'Poultices (10)');
        else gearList.push('Healer\'s Satchel +1', 'Poultices (15)');
      }
      else if (profId === 'merchant') {
        if (count === 1) gearList.push('Fine Clothes', 'Pouch of Exotic Spices');
        else if (count === 2) gearList.push('Fine Clothes', 'Pouch of Exotic Spices', 'Scale and Weights');
        else if (count === 3) gearList.push('Silk Merchant Robes', 'Small Cut Gemstone');
        else if (count === 4) gearList.push('Silk Merchant Robes', 'Small Cut Gemstone', 'Gilded Scale');
        else gearList.push('Silk Merchant Robes +1', 'Golden Signet Ring');
      }
      else if (profId === 'sailor') {
        if (count === 1) gearList.push('Cutlass', 'Rope (50ft)');
        else if (count === 2) gearList.push('Cutlass', 'Silk Rope (50ft)');
        else if (count === 3) gearList.push('Boarding Axe', 'Silk Rope (50ft)');
        else if (count === 4) gearList.push('Boarding Axe', 'Spiked Grappling Hook');
        else gearList.push('Boarding Axe +1', 'Spiked Grappling Hook');
      }
      else if (profId === 'shaman') {
        if (count === 1) gearList.push('Wooden Staff', 'Fetish Charm');
        else if (count === 2) gearList.push('Wooden Staff', 'Totem Focus');
        else if (count === 3) gearList.push('Bone Staff', 'Totem Focus');
        else if (count === 4) gearList.push('Bone Staff', 'Spirit Mask');
        else gearList.push('Bone Staff +1', 'Spirit Mask +1');
      }
      else if (profId === 'guide') {
        if (count === 1) gearList.push('Hatchet', 'Local Map');
        else if (count === 2) gearList.push('Hatchet', 'Detailed Region Map');
        else if (count === 3) gearList.push('Axe', 'Detailed Region Map');
        else if (count === 4) gearList.push('Double-bitted Axe', 'Detailed Region Map');
        else gearList.push('Axe +1', 'Detailed Region Map');
      }
    });

    const startChar = {
      name,
      gender,
      age,
      element,
      attributes: finalAttributes,
      skills: finalSkills,
      professions,
      hobbySkills,
      virtue,
      vice,
      philosophy,
      personality,
      stats: {
        hp: startingHP,
        maxHp: startingHP,
        level: 1,
        fatigue: 12.5 + 2.5 * (finalAttributes.vigor || 1),
        maxFatigue: 12.5 + 2.5 * (finalAttributes.vigor || 1),
        arcaneSP: (finalSkills.arcane_drawing || 0) * 3,
        maxArcaneSP: (finalSkills.arcane_drawing || 0) * 3,
        divineSP: (finalSkills.divine_communion || 0) * 3,
        maxDivineSP: (finalSkills.divine_communion || 0) * 3,
        day: 1,
        hour: 13.0
      },
      inventory: gearList,
      active_quests: ['Embark on the High Fantasy Adventure'],
      setting: 'High Fantasy',
      morality: 0,
      daysWithoutFood: 0,
      scars: { maxHpPenalty: 0, notes: [] },
      portraitUrl: creationData.portraitUrl || null,
      portraitSeed: creationData.portraitSeed || null,
      storage: ["Tent", "Cooking Pot"],
      currency: { gold: startingGold, fateCoins: 0 },
      strongholds: ["None"],
      relationships: { "Sylas the Wise": "Friendly" },
    };

    setCharacter(startChar);
    setHistory([]);
    setJournal({ storySoFar: 'The journey has just begun.', recentTurns: [] });
    setSkillTally({});
    setWarningMessage(null);
    setIsUpgradeScreenVisible(false);
  };

  const deductEnergy = useCallback((gmId, tokenCount) => {
    const gm = GMS.find(g => g.id === gmId);
    if (!gm) return;

    setGmEnergies(prev => {
      const currentEnergy = prev[gmId];
      const percentUsed = (tokenCount / gm.dailyLimit) * 100;
      const nextEnergy = Math.max(0, currentEnergy - percentUsed);
      return {
        ...prev,
        [gmId]: parseFloat(nextEnergy.toFixed(2)),
      };
    });
  }, []);

  const deductImageCost = useCallback((gmId) => {
    const tokenCost = gmId === 'titan' ? 2000 : 10000;
    deductEnergy(gmId, tokenCost);
  }, [deductEnergy]);

  const generateJournalSummary = async (newHistory, engineTier, apiKey, sandbox) => {
    try {
      const userTurns = newHistory.filter(h => h.role === 'user').length;
      if (userTurns > 0 && userTurns % 5 === 0) {
        const summaryPrompt = `Based on the conversation history, summarize the campaign's "Story so far" in exactly two short sentences. Focus only on achievements and the active threat. Do not output anything else.`;
        
        const engine = SAGA_ENGINES.find(e => e.id === engineTier) || SAGA_ENGINES[1];
        const sessionToken = storage.get('supabase_session_token') || null;
        const response = await generateCompletion({
          provider: engine.provider,
          model: engine.model,
          apiKey,
          systemPrompt: summaryPrompt,
          history: newHistory.slice(-10),
          sandboxMode: sandbox,
          sessionToken
        });

        if (response.text) {
          const recentUserActions = newHistory
            .filter(h => h.role === 'user')
            .slice(-3)
            .map(h => h.content);

          setJournal({
            storySoFar: response.text.trim(),
            recentTurns: recentUserActions
          });
        }
      } else {
        const recentUserActions = newHistory
          .filter(h => h.role === 'user')
          .slice(-3)
          .map(h => h.content);

        setJournal(prev => ({
          ...prev,
          recentTurns: recentUserActions
        }));
      }
    } catch (e) {
      console.warn('Failed to generate journal summary:', e);
    }
  };



  // Perform a player action (and handle opposed rolls)
  const sendPlayerAction = async (
    actionText, 
    apiKey, 
    sandbox, 
    skillFocusId = null, 
    difficulty = 'moderate', 
    spSpend = 0, 
    inventoryItemUsed = null,
    engineTier = 'free'
  ) => {
    if (!activeGmId || isLoading) return;

    if (character.stats.hp <= -5) {
      setIsLoading(false);
      setApiError("You are dead! You cannot take actions. Please reset the campaign to start a new Saga.");
      return;
    }

    const sessionToken = storage.get('supabase_session_token');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (sessionToken && engineTier === 'premium') {
      let currentEnergy;
      let subscriptionTier;
      
      if (!supabaseUrl) {
        // Simulation mode
        const email = storage.get('shattered_email') || 'adventurer@saga.com';
        const mockProfile = storage.get(`mock_supabase_profile_${email}`, null);
        currentEnergy = mockProfile ? mockProfile.energy_balance : 0;
        subscriptionTier = mockProfile ? mockProfile.subscription_tier : 'free';
      } else {
        // Production mode
        currentEnergy = userProfile ? userProfile.energy_balance : 0;
        subscriptionTier = userProfile ? userProfile.subscription_tier : 'free';
      }

      const isUnlimited = subscriptionTier === 'adventurer' || subscriptionTier === 'legend';

      if (!isUnlimited && currentEnergy <= 0) {
        setApiError("Your energy balance is exhausted. Please purchase more energy turns or recharge your account in settings!");
        return;
      }
    }

    setIsLoading(true);
    setApiError(null);
    setWarningMessage(null);

    // Save action params for potential retries
    setLastActionParams({ actionText, apiKey, sandbox, skillFocusId, difficulty });

    // Safety Interceptor Check
    if (checkSafetyViolation(actionText)) {
      setIsLoading(false);

      if (safetyState.strikeTier === 0) {
        const warningText = getGMStrikeWarning(activeGm.name, activeGm.id, character.gender);
        setSafetyState(prev => ({
          ...prev,
          strikeTier: 1,
          lastStrikeTimestamp: new Date().toISOString(),
          cleanActionsCount: 0
        }));
        setApiError(warningText);
      } else if (safetyState.strikeTier === 1) {
        const sternText = getGMSternWarning(activeGm.name, activeGm.id, character.gender);
        setSafetyState(prev => ({
          ...prev,
          strikeTier: 2,
          lastStrikeTimestamp: new Date().toISOString(),
          cleanActionsCount: 0
        }));
        setApiError(sternText);
      } else {
        // Strike 3: Lockout current slot
        const nextLockoutCount = (safetyState.lockoutCount || 0) + 1;
        const expiry = calculateLockoutExpiry(nextLockoutCount);
        
        const updatedSafetyState = {
          ...safetyState,
          strikeTier: 3,
          lockoutCount: nextLockoutCount,
          lockoutExpiryTimestamp: expiry,
          cleanActionsCount: 0
        };

        // Write to storage immediately so isGloballyBanned checks this update
        storage.set(`slot_${activeSlotIndex}_safety_state`, updatedSafetyState);

        const username = storage.get('shattered_username') || 'Guest_Adventurer';
        const globallyBanned = isGloballyBanned(username);

        if (globallyBanned) {
          updatedSafetyState.isPermanentlyBanned = true;
          storage.set(`slot_${activeSlotIndex}_safety_state`, updatedSafetyState);
        }

        setSafetyState(updatedSafetyState);

        const days = 2 + nextLockoutCount;
        if (globallyBanned) {
          setApiError(`LOCKOUT TRIGGERED: This slot has been locked for ${days} days due to repeated safety violations. Since all available slots are now locked, you are permanently banned.`);
        } else {
          setApiError(`LOCKOUT TRIGGERED: This slot has been locked for ${days} days due to repeated safety violations. You must load or play a different character/slot during the lockout period.`);
        }
      }
      return;
    } else {
      // Clean Turn: Increment clean counter and decay strikes
      setSafetyState(prev => {
        let nextCleanCount = prev.cleanActionsCount + 1;
        let nextStrikeTier = prev.strikeTier;
        let nextStrikeTimestamp = prev.lastStrikeTimestamp;
        
        if (prev.strikeTier > 0 && prev.strikeTier < 3) {
          const oneDayMs = 24 * 60 * 60 * 1000;
          const timeElapsed = prev.lastStrikeTimestamp && (Date.now() - new Date(prev.lastStrikeTimestamp).getTime() >= oneDayMs);
          const turnsCompleted = nextCleanCount >= 50;
          
          if (timeElapsed && turnsCompleted) {
            nextStrikeTier = prev.strikeTier - 1;
            nextCleanCount = 0;
            nextStrikeTimestamp = nextStrikeTier > 0 ? new Date().toISOString() : null;
          }
        }
        
        return {
          ...prev,
          cleanActionsCount: nextCleanCount,
          strikeTier: nextStrikeTier,
          lastStrikeTimestamp: nextStrikeTimestamp
        };
      });
    }

    let finalActionText = actionText;
    let rollDetails = null;

    let finalSkillFocusId = skillFocusId;
    let finalDifficulty = difficulty;

    // Ticks & Decays on Action
    let localHp = character.stats.hp;
    let bleedingTier = character.stats.bleedingTier || 0;
    let defenseCount = character.stats.defenseCount || 0;
    let statuses = character.stats.statuses || [];
    let localInventory = [...character.inventory];
    let localFatigue = character.stats.fatigue !== undefined ? character.stats.fatigue : character.stats.maxFatigue;
    let localDaysWithoutFood = character.daysWithoutFood || 0;

    // Perform Healing Action Check
    let isHealingAction = false;
    let healingDetailsMsg = '';
    const maxFatigue = character.stats.maxFatigue || 15;

    if (inventoryItemUsed) {
      const nameLower = inventoryItemUsed.toLowerCase();
      let isBandage = nameLower.includes('bandage');
      let isHealerKit = nameLower.includes("healer's kit") || nameLower.includes("healer's satchel");
      let isHerb = nameLower.includes('herb') || nameLower.includes('poultice');

      if (isBandage || isHealerKit || isHerb) {
        isHealingAction = true;
        let itemPattern = '';
        if (isBandage) itemPattern = 'bandage[s]?';
        else if (isHealerKit) itemPattern = "healer's (?:kit|satchel)";
        else if (nameLower.includes('herb')) itemPattern = 'healing herb[s]?';
        else if (nameLower.includes('poultice')) itemPattern = 'poultice[s]?';

        const { consumed, nextInventory } = consumeInventoryItem(localInventory, itemPattern);
        if (consumed) {
          localInventory = nextInventory;

          const vigor = character.attributes.vigor || 1;
          const vigorDieSize = getVigorDie(vigor);
          const vRoll = Math.floor(Math.random() * vigorDieSize) + 1;
          const healingRank = character.skills.healing || 0;
          let healRankRoll = 0;
          for (let i = 0; i < healingRank; i++) {
            healRankRoll += Math.floor(Math.random() * 2) + 1;
          }

          let hpHealed = 0;
          let stopBleed = false;
          let clearConditions = false;
          let logDetail = '';

          if (isBandage) {
            hpHealed = 1;
            stopBleed = true;
            logDetail = `applied a bandage (restored 1 HP, stopped bleeding).`;
          } else if (isHealerKit) {
            const aidRoll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1); // 2d6
            hpHealed = vRoll + healRankRoll + aidRoll;
            stopBleed = true;
            clearConditions = true;
            logDetail = `used a Healer's Kit. Vigor Roll: ${vRoll} (d${vigorDieSize}) + Healing skill: ${healRankRoll} + Kit Aid: ${aidRoll} (2d6). Restored ${hpHealed} HP, stopped bleeding.`;
          } else if (isHerb) {
            const aidRoll = Math.floor(Math.random() * 6) + 1; // 1d6
            hpHealed = vRoll + healRankRoll + aidRoll;
            logDetail = `consumed Healing Herbs/Poultice. Vigor Roll: ${vRoll} (d${vigorDieSize}) + Healing skill: ${healRankRoll} + Herb Aid: ${aidRoll} (1d6). Restored ${hpHealed} HP.`;
          }

          const maxHp = character.stats.maxHp || 10;
          localHp = Math.min(maxHp, localHp + hpHealed);
          
          if (stopBleed) {
            bleedingTier = 0;
          }

          if (clearConditions) {
            localFatigue = maxFatigue;
            statuses = [];
          }

          if (localHp > 0) {
            character.stats.deathCountdown = null;
          }

          healingDetailsMsg = `\n\n[Healing Treatment: Player ${logDetail} HP is now ${localHp}/${maxHp}. Bleeding Tier: ${bleedingTier}.]`;
        }
      }
    }

    // Reset defenseCount since the player is taking an active turn action
    defenseCount = 0;

    // Bleeding Tick
    let bleedingTickMsg = '';
    if (bleedingTier > 0 && !isHealingAction) {
      localHp = Math.max(-5, localHp - bleedingTier);
      bleedingTickMsg = `\n\n[Bleeding Tick: Suffered ${bleedingTier} HP damage from ongoing bleeding. HP: ${localHp}/${character.stats.maxHp}]`;
      
      // 10% self-recovery chance
      if (Math.random() < 0.10) {
        bleedingTier = Math.max(0, bleedingTier - 1);
        bleedingTickMsg += `\n[Bleeding check: Bleeding tier naturally decreased to ${bleedingTier}.]`;
      }
    }

    // Death countdown tick if unconscious
    let deathCountdown = character.stats.deathCountdown;
    if (localHp <= 0 && localHp > -5) {
      if (deathCountdown === null) {
        deathCountdown = 5;
      } else if (!isHealingAction) {
        deathCountdown = Math.max(0, deathCountdown - 1);
      }
      if (deathCountdown === 0) {
        localHp = -5; // Death
        deathCountdown = null;
        bleedingTickMsg += `\n[Notice: Death countdown reached 0. Character has died.]`;
      } else {
        bleedingTickMsg += `\n[Notice: Character is dying. Death countdown: ${deathCountdown} actions remaining.]`;
      }
    } else {
      deathCountdown = null;
    }

    // Status Decay
    let activeStatuses = [];
    let statusDecayMsg = '';
    if (!isHealingAction) {
      statuses.forEach(status => {
        const nextDuration = status.duration - 1;
        if (nextDuration > 0) {
          activeStatuses.push({ ...status, duration: nextDuration });
        } else {
          statusDecayMsg += `\n[Status Expired: ${status.name}]`;
        }
      });
    } else {
      activeStatuses = statuses;
    }

    if (bleedingTickMsg) {
      finalActionText += bleedingTickMsg;
    }
    if (statusDecayMsg) {
      finalActionText += statusDecayMsg;
    }
    if (healingDetailsMsg) {
      finalActionText += healingDetailsMsg;
    }

    // Auto-detect check request from the last GM message if the player didn't specify one
    if (!finalSkillFocusId || finalSkillFocusId === '') {
      const lastModelMsg = [...history].reverse().find(msg => msg.role === 'model');
      if (lastModelMsg && lastModelMsg.content) {
        const checkRegex = /\[GM asks for (?:a|an)\s+([A-Za-z0-9_\-\s]+?)\s+check(?:\s+against\s+([^\]]+))?\]/i;
        const match = lastModelMsg.content.match(checkRegex);
        if (match) {
          const detectedSkillName = match[1].trim().toLowerCase();
          const matchedSkill = SKILLS_LIST.find(s => 
            s.name.toLowerCase() === detectedSkillName || 
            s.id === detectedSkillName || 
            s.name.toLowerCase().includes(detectedSkillName) ||
            detectedSkillName.includes(s.name.toLowerCase())
          );
          if (matchedSkill) {
            finalSkillFocusId = matchedSkill.id;
            
            if (match[2]) {
              const challengeText = match[2].trim().toLowerCase();
              if (challengeText.includes('easy') || challengeText.includes('novice')) {
                finalDifficulty = 'easy';
              } else if (challengeText.includes('hard') || challengeText.includes('veteran') || challengeText.includes('gale-force') || challengeText.includes('ancient') || challengeText.includes('treacherous')) {
                finalDifficulty = 'hard';
              } else if (challengeText.includes('extreme') || challengeText.includes('legendary') || challengeText.includes('impossible')) {
                finalDifficulty = 'extreme';
              } else {
                finalDifficulty = 'moderate';
              }
            } else {
              finalDifficulty = 'moderate';
            }
            console.log(`[Auto Check] Automatically rolled ${matchedSkill.name} (${finalDifficulty}) based on GM prompt.`);
          }
        }
      }
    }

    // Calculate encumbrance first
    const encumbrance = calculateWeightAndVolume(character);
    const isPhysicalAction = (skillId) => {
      if (!skillId) return false;
      const skill = SKILLS_LIST.find(s => s.id === skillId);
      if (!skill) return false;
      return ['power', 'coordination', 'vigor'].includes(skill.primary);
    };

    // Helper to identify physical weapons vs shields
    const isWeapon = (details) => {
      if (!details) return false;
      const nameLower = (details.name || '').toLowerCase();
      if (nameLower.includes('shield') || nameLower.includes('buckler')) return false;
      return details.slot === 'hand';
    };

    const rightItem = character.equipment?.hand_right;
    const leftItem = character.equipment?.hand_left;
    const rightDetails = rightItem ? getItemDetails(rightItem) : null;
    const leftDetails = leftItem ? getItemDetails(leftItem) : null;

    const weaponName = isWeapon(rightDetails) ? rightItem : (isWeapon(leftDetails) ? leftItem : null);
    
    const shieldName = (rightItem && (rightItem.toLowerCase().includes('shield') || rightItem.toLowerCase().includes('buckler'))) ? rightItem :
                       ((leftItem && (leftItem.toLowerCase().includes('shield') || leftItem.toLowerCase().includes('buckler'))) ? leftItem : null);
    
    const armorName = character.equipment?.body;
    const armorType = getArmorType(armorName);

    // 1. Enforce weapon constraints
    const weaponSkills = ['light_weapons', 'heavy_weapons', 'marksmanship', 'thrown_weapons'];
    if (finalSkillFocusId && weaponSkills.includes(finalSkillFocusId)) {
      if (!weaponName) {
        setIsLoading(false);
        setApiError(`You cannot roll ${SKILLS_LIST.find(s => s.id === finalSkillFocusId)?.name || finalSkillFocusId} without a weapon equipped. Please equip a weapon first, or choose Brawling to fight unarmed.`);
        return;
      }
    }

    // Enforce ammunition constraints
    if (finalSkillFocusId === 'marksmanship') {
      const arrowCount = getArrowCount(character.inventory);
      if (arrowCount <= 0) {
        setIsLoading(false);
        setApiError("You cannot shoot: you have no arrows remaining! Please choose a different action.");
        return;
      }
    }

    // 2. Determine time and fatigue cost for this action
    let cost = getActionCost(finalSkillFocusId);
    if (isHealingAction) {
      const nameLower = inventoryItemUsed.toLowerCase();
      if (nameLower.includes('bandage')) {
        cost = { fatigue: 0.1, time: 0.0028 }; // 10 seconds in combat
      } else {
        cost = { fatigue: 0.1, time: 0.1667 }; // 10 minutes for treatment
      }
    }

    // Auto-detect if player says they are eating a ration in their action
    const eatRegex = /\b(eat|consume|eating)\b.*\b(ration|rations|food)\b/i;
    const isEatingRation = eatRegex.test(actionText);
    let consumedRationNarratively = false;

    if (isEatingRation) {
      const { hasRations, updatedInventory } = consumeRationFromInventory(character.inventory);
      if (hasRations) {
        consumedRationNarratively = true;
        localDaysWithoutFood = 0;
        localInventory = updatedInventory;
        localFatigue = Math.min(character.stats.maxFatigue || 15, localFatigue + 4);
        finalActionText += `\n\n[Notice: Player consumed a ration. Starvation level reset to 0, recovered 4 Fatigue.]`;
      }
    }

    const isExhausted = localFatigue < 0;
    const exhaustionPenalty = isExhausted ? Math.floor(Math.abs(localFatigue) * 2) : 0;
    const starvationPenalty = localDaysWithoutFood;

    // Apply magic bonuses and armor penalties
    let weaponMagicBonus = 0;
    if (finalSkillFocusId) {
      if (weaponSkills.includes(finalSkillFocusId)) {
        weaponMagicBonus = getMagicBonus(weaponName);
      } else if (finalSkillFocusId === 'brawling') {
        const brawlingItems = ['fist', 'wrap', 'hand', 'gauntlet', 'knuckle', 'claw', 'unarmed'];
        const isBrawlingItem = weaponName && brawlingItems.some(term => weaponName.toLowerCase().includes(term));
        if (isBrawlingItem) {
          weaponMagicBonus = getMagicBonus(weaponName);
        }
      }
    }
    
    const shieldMagicBonus = (finalSkillFocusId === 'blocking') ? getMagicBonus(shieldName) : 0;
    
    let armorCheckPenalty = 0;
    if (finalSkillFocusId === 'acrobatics' || finalSkillFocusId === 'athletics') {
      if (armorType === 'medium') armorCheckPenalty = -1;
      else if (armorType === 'heavy') armorCheckPenalty = -2;
    }

    // Encumbrance penalties
    let encumbrancePenalty = 0;
    let fatigueCostMultiplier = 1.0;

    if (encumbrance.isEncumbered && isPhysicalAction(finalSkillFocusId)) {
      encumbrancePenalty = encumbrance.rollModifier;
      if (encumbrance.isOverloaded) {
        fatigueCostMultiplier = 2.0;
      } else {
        fatigueCostMultiplier += encumbrance.penaltyPercentage / 100;
      }
    }

    const totalModifier = nextRollModifier - starvationPenalty - exhaustionPenalty + weaponMagicBonus + shieldMagicBonus + armorCheckPenalty + encumbrancePenalty;

    // Determine spell resistance modifier based on SP spent
    let resistanceModifier = 0;
    if (finalSkillFocusId === 'arcane_shaping' || finalSkillFocusId === 'divine_manifestation') {
      resistanceModifier = 4 * spSpend;
    }

    // Perform Opposed Roll client-side
    if (finalSkillFocusId) {
      const skill = SKILLS_LIST.find(s => s.id === finalSkillFocusId);
      if (skill) {
        const primaryScore = character.attributes[skill.primary] || 1;
        const secondaryScore = character.attributes[skill.secondary] || 1;
        const skillRanks = character.skills[finalSkillFocusId] || 0;

        let potencyModifier = 0;
        if (finalSkillFocusId === 'arcane_shaping' || finalSkillFocusId === 'divine_manifestation') {
          potencyModifier = 3 * spSpend;
        }

        rollDetails = executeOpposedCheck({
          skillName: skill.name,
          primaryAttr: skill.primary.charAt(0).toUpperCase() + skill.primary.slice(1),
          primaryScore,
          secondaryAttr: skill.secondary.charAt(0).toUpperCase() + skill.secondary.slice(1),
          secondaryScore,
          skillRanks,
          difficulty: finalDifficulty,
          roleplayModifier: totalModifier,
          resistanceModifier,
          potencyModifier
        });

        // Reset modifier back to 0 immediately
        setNextRollModifier(0);

        // Save last check details
        setLastCheck({
          skillId: finalSkillFocusId,
          success: rollDetails.success,
          playerRoll: rollDetails.playerTotal,
          resistanceRoll: rollDetails.resistanceTotal
        });

        // Append roll details to the player's text action for the GM to read!
        finalActionText += `\n\n${rollDetails.text}`;
        if (starvationPenalty > 0) {
          finalActionText += `\n\n[Notice: Player is Starving! Day ${starvationPenalty} of hunger. A -${starvationPenalty} penalty has been applied to this check.]`;
        }
        if (exhaustionPenalty > 0) {
          finalActionText += `\n\n[Notice: Player is Over-Fatigued! (Fatigue: ${localFatigue.toFixed(1)}/${maxFatigue.toFixed(1)}). A -${exhaustionPenalty} penalty has been applied to this check.]`;
        }
        if (encumbrancePenalty !== 0) {
          finalActionText += `\n\n[Notice: Player is Encumbered (${encumbrance.weightRatio}% weight capacity)! A ${encumbrancePenalty} penalty has been applied to this physical check.]`;
        }

        // Add to our skill tally for leveling up
        setSkillTally(prev => ({
          ...prev,
          [finalSkillFocusId]: (prev[finalSkillFocusId] || 0) + 1
        }));
      }
    }

    if (encumbrance.isOverloaded) {
      finalActionText += `\n\n[WARNING: Player is OVERLOADED (${encumbrance.weightRatio}% weight capacity)! Physical movement and actions risk physical collapse. Double fatigue is consumed.]`;
    } else if (encumbrance.isSlowed) {
      finalActionText += `\n\n[Notice: Player is SLOWED (${encumbrance.weightRatio}% weight capacity)! Physical actions suffer heavy fatigue and coordination penalties.]`;
    }

    // Calculate time and resource progression for this action
    let activeFatigueCost = cost.fatigue;
    if (isPhysicalAction(finalSkillFocusId)) {
      activeFatigueCost *= fatigueCostMultiplier;
    }

    let fatigueChange = -activeFatigueCost;
    let appliedPassiveRecovery = false;
    
    // Passive recovery: if action doesn't generate high fatigue and we are below 50% max
    if (activeFatigueCost < 0.05 && localFatigue < (maxFatigue * 0.5)) {
      fatigueChange += 0.5;
      appliedPassiveRecovery = true;
    }
    
    localFatigue = localFatigue + fatigueChange;
    if (appliedPassiveRecovery && localFatigue > (maxFatigue * 0.5)) {
      localFatigue = maxFatigue * 0.5;
    }

    // SP Deduction, Conversion, and Burnout Outcomes
    let arcaneSP = character.stats.arcaneSP || 0;
    const maxArcaneSP = character.stats.maxArcaneSP || 0;
    let divineSP = character.stats.divineSP || 0;
    const maxDivineSP = character.stats.maxDivineSP || 0;
    // localHp is already declared above
    let hpDamageBurnout = 0;
    let divineFatigueBurnout = 0;
    let autoConvertedDivineToArcane = 0;
    let autoConvertedArcaneToDivine = 0;

    if (finalSkillFocusId === 'arcane_shaping' && spSpend > 0) {
      if (arcaneSP < spSpend) {
        const deficit = spSpend - arcaneSP;
        const divineNeeded = deficit * 3;
        if (divineSP >= divineNeeded) {
          divineSP -= divineNeeded;
          autoConvertedDivineToArcane = deficit;
          arcaneSP = 0;
        } else {
          const maxConvertible = Math.floor(divineSP / 3);
          divineSP -= maxConvertible * 3;
          autoConvertedDivineToArcane = maxConvertible;
          const newDeficit = deficit - maxConvertible;
          hpDamageBurnout = newDeficit;
          localHp = Math.max(0, localHp - hpDamageBurnout);
          arcaneSP = 0;
        }
      } else {
        arcaneSP -= spSpend;
      }
    } else if (finalSkillFocusId === 'divine_manifestation' && spSpend > 0) {
      if (divineSP < spSpend) {
        const deficit = spSpend - divineSP;
        const arcaneNeeded = deficit * 3;
        if (arcaneSP >= arcaneNeeded) {
          arcaneSP -= arcaneNeeded;
          autoConvertedArcaneToDivine = deficit;
          divineSP = 0;
        } else {
          const maxConvertible = Math.floor(arcaneSP / 3);
          arcaneSP -= maxConvertible * 3;
          autoConvertedArcaneToDivine = maxConvertible;
          const newDeficit = deficit - maxConvertible;
          divineFatigueBurnout = newDeficit;
          localFatigue -= divineFatigueBurnout;
          divineSP = 0;
        }
      } else {
        divineSP -= spSpend;
      }
    }

    // Collapse Check
    let collapsedThisTurn = false;
    if (localFatigue <= -10.0) {
      localFatigue = -5.0;
      collapsedThisTurn = true;
    }

    // Time Tracking Advance
    const timeDelta = cost.time + (collapsedThisTurn ? 8.0 : 0.0);
    const timeResult = advanceTime(character.stats.day || 1, character.stats.hour || 13.0, timeDelta);

    let finalInventory = localInventory;
    let finalDaysWithoutFood = localDaysWithoutFood;
    let starvationMessage = '';
    let arrowConsumedNotice = '';

    // Consume Arrow
    if (finalSkillFocusId === 'marksmanship') {
      const { consumed, nextInventory } = consumeArrowFromInventory(localInventory);
      if (consumed) {
        finalInventory = nextInventory;
        const newCount = getArrowCount(finalInventory);
        arrowConsumedNotice = `\n\n[Notice: Consumed 1 arrow. Arrows remaining: ${newCount}.]`;
      }
    }
    
    if (timeResult.advancedMidnight) {
      const { hasRations, updatedInventory } = consumeRationFromInventory(finalInventory);
      finalInventory = updatedInventory;
      finalDaysWithoutFood = hasRations ? 0 : localDaysWithoutFood + 1;
      if (!hasRations) {
        starvationMessage = `\n\n[Warning: Midnight passed and you had no rations! Starvation level increased to ${finalDaysWithoutFood}.]`;
      } else {
        starvationMessage = `\n\n[Notice: Midnight passed. Consumed 1 ration.]`;
      }
    }

    // Append Notices to player action text for GM/Display
    const displayTime = formatTime(timeResult.nextDay, timeResult.nextHour);
    const timeDeltaMins = Math.round(timeDelta * 60);
    finalActionText += `\n\n[Notice: Time passed: ${timeDeltaMins} mins. Current time: ${displayTime}. Fatigue: ${localFatigue.toFixed(1)}/${maxFatigue.toFixed(1)}]`;
    
    if (localFatigue < 0) {
      finalActionText += `\n\n[Warning: You are Over-Fatigued! A roll penalty of -${Math.floor(Math.abs(localFatigue) * 2)} is active. Resting is advised.]`;
    }
    if (collapsedThisTurn) {
      finalActionText += `\n\n[Notice: You collapsed from absolute exhaustion for 8 hours! Fatigue reset to -5.0.]`;
    }
    if (spSpend > 0) {
      finalActionText += `\n\n[Notice: Channeled ${spSpend} SP. Arcane SP: ${arcaneSP}/${maxArcaneSP}, Divine SP: ${divineSP}/${maxDivineSP}]`;
    }
    if (autoConvertedDivineToArcane > 0) {
      finalActionText += `\n\n[Notice: Auto-converted ${autoConvertedDivineToArcane * 3} Divine SP to ${autoConvertedDivineToArcane} Arcane SP.]`;
    }
    if (autoConvertedArcaneToDivine > 0) {
      finalActionText += `\n\n[Notice: Auto-converted ${autoConvertedArcaneToDivine * 3} Arcane SP to ${autoConvertedArcaneToDivine} Divine SP.]`;
    }
    if (hpDamageBurnout > 0) {
      finalActionText += `\n\n[Notice: Arcane burnout! Suffered ${hpDamageBurnout} HP damage.]`;
    }
    if (divineFatigueBurnout > 0) {
      finalActionText += `\n\n[Notice: Divine burnout! Lost ${divineFatigueBurnout} Fatigue.]`;
    }
    if (arrowConsumedNotice) {
      finalActionText += arrowConsumedNotice;
    }
    if (starvationMessage) {
      finalActionText += starvationMessage;
    }

    // Update character state
    setCharacter(prev => ({
      ...prev,
      inventory: finalInventory,
      daysWithoutFood: finalDaysWithoutFood,
      stats: {
        ...prev.stats,
        hp: localHp,
        fatigue: localFatigue,
        arcaneSP,
        divineSP,
        day: timeResult.nextDay,
        hour: timeResult.nextHour,
        bleedingTier,
        defenseCount,
        deathCountdown,
        statuses: activeStatuses
      }
    }));

    const userMsg = { role: 'user', content: finalActionText };
    const updatedHistory = [...history, userMsg];
    setHistory([...updatedHistory, { role: 'model', content: '', isStreaming: true }]);

    // 2. Prepare system instructions
    let systemPrompt = BASE_SYSTEM_PROMPT + activeGm.promptOverride;

    const activeAdventure = ADVENTURES_LIST.find(a => a.id === activeAdventureId);
    if (activeAdventure) {
      systemPrompt += `\n\n[ACTIVE ADVENTURE: ${activeAdventure.name.toUpperCase()}]
Backstory & Lore: ${activeAdventure.backstory || activeAdventure.desc}
Suggested GM: ${activeAdventure.suggestedGm}

[OBJECTIVES]
${activeAdventure.objectives.map(o => `- ${o}`).join('\n')}

[LOCATIONS & ROOM DESCRIPTIONS]
${activeAdventure.settings.map(s => {
  const desc = activeAdventure.settingDescriptions?.[s] || 'A location in the adventure.';
  return `- ${s}: ${desc}`;
}).join('\n')}

[NPCS, ROLES & STATS]
${(activeAdventure.npcs || []).map(npc => {
  const statsStr = npc.stats ? ` (Stats: ${JSON.stringify(npc.stats)})` : '';
  return `- ${npc.name} (${npc.role}): ${npc.desc}${statsStr}`;
}).join('\n')}

[ADVENTURE ITEMS & GEAR DETAILS]
${(activeAdventure.itemsDetail || []).map(item => {
  const propStr = item.properties ? ` [Properties: ${item.properties}]` : '';
  return `- ${item.name}: ${item.desc}${propStr}`;
}).join('\n')}

${activeAdventure.playabilityGuidance ? `[PLAYABILITY GUIDANCE]\n${activeAdventure.playabilityGuidance}\n` : `[PLAYABILITY GUIDANCE]\nRun this adventure as a branching scenario, not a checklist. Surface at least two viable approaches to major obstacles, let NPC motives complicate simple combat, foreshadow the ending choices before the finale, and award the listed rewards only when the player's actions justify them.\n`}

${activeAdventure.rewards ? `[ENDING REWARDS]\n${Object.entries(activeAdventure.rewards).map(([ending, rewards]) => `- ${ending}: ${(Array.isArray(rewards) ? rewards : [rewards]).join(' ')}`).join('\n')}\n` : ''}

${activeAdventure.elementalAbilities ? `[ELEMENTAL AWAKENING REWARDS]\n${Object.entries(activeAdventure.elementalAbilities).map(([element, ability]) => `- ${element}: ${ability.name} - ${ability.properties}`).join('\n')}\n` : ''}

[CURRENT LOCATION & PERSISTENT WORLD GROUND STATE]
Active Location: ${currentLocation || activeAdventure.settings[0] || 'Unknown'}
Items lying on the ground in this room: ${(droppedItems[activeAdventureId]?.[currentLocation || activeAdventure.settings[0]] || []).join(', ') || 'None'}
(Rules: Whenever the player successfully moves to a different area, you MUST output the exact tag: [location: Room Name], where 'Room Name' matches one of the settings defined above. If the player drops items here, narrate them on the ground.)
`;

      // Inject NPC memories if any are stored for NPCs in this adventure
      const adventureNpcNames = (activeAdventure.npcs || []).map(n => n.name.toLowerCase());
      const filteredMemories = Object.entries(npcMemory).filter(([npcId]) => adventureNpcNames.includes(npcId.toLowerCase()));
      if (filteredMemories.length > 0) {
        systemPrompt += `\n[NPC RELATIONSHIP MEMORIES]\n`;
        filteredMemories.forEach(([npcId, data]) => {
          systemPrompt += `- ${npcId}: Trust ${data.trust || 50}/100, Fear ${data.fear || 10}/100, Greed ${data.greed || 50}/100, Mood: ${data.mood || 'neutral'}. Known facts: ${(data.facts || []).join(', ') || 'None'}\n`;
        });
        systemPrompt += `(Instructions: You can propose modifications to NPC parameters by outputting [npc_trust: NPC_Name +5], [npc_fear: NPC_Name -10], or record facts using [npc_fact: NPC_Name Fact description].)\n`;
      }
    }

    if (character.is_free_roaming) {
      systemPrompt += `\n\n[MODE: FREE ROAM / REST & RECOVER]
The player has already completed the main quest of this adventure.
This session is in a peaceful, roleplay-centric "Free Roam" mode.
- The main boss (e.g. Malachar, Warlord wraith, Unit-7) is already defeated or contained.
- The local residents are friendly and welcoming, recognizing the player as their champion.
- The player can rest at local taverns/strongholds to recover fatigue/HP, trade items, buy rations, or talk to NPCs.
- Focus on low-stakes adventure, training, resting, and character relationships. Do not force high-threat combat scenarios unless the player seeks out wild beasts, dangerous dungeons, or explicitly asks for trouble.
`;
    }

    // Pass the player's full character sheet to the system prompt!
    systemPrompt += `\n\n[PLAYER CHARACTER SHEET]
Name: ${character.name}
Gender: ${character.gender}
Age Tier: ${character.age}
Element: ${character.element}
Philosophy: ${character.philosophy}
Virtue: ${character.virtue}
Vice: ${character.vice}
Morality Scale: ${character.morality || 0} (-100 Villainous to +100 Heroic)
Attributes: ${JSON.stringify(character.attributes)}
Skills: ${JSON.stringify(character.skills)}
HP: ${character.stats.hp}/${character.stats.maxHp}
Fatigue: ${localFatigue.toFixed(1)}/${maxFatigue.toFixed(1)}
Arcane SP: ${arcaneSP}/${maxArcaneSP}
Divine SP: ${divineSP}/${maxDivineSP}
Elemental Ability: ${character.stats?.elementalAbility ? `${character.stats.elementalAbility}${character.stats.elementalAbilityUsed ? ' (used since last rest)' : ' (ready)'}` : 'None unlocked'}
Elemental Ability Rule: If an elemental ability is unlocked and ready, the player may use it once between rests. When it is used, output [elemental_ability_used]. If an adventure unlocks one, output [elemental_ability_unlock: element], where element is air, earth, fire, water, or aether.
Equipped Items:
- Head: ${character.equipment?.head || 'None'}
- Neck: ${character.equipment?.neck || 'None'}
- Body: ${character.equipment?.body || 'None'}
- Legs: ${character.equipment?.legs || 'None'}
- Feet: ${character.equipment?.feet || 'None'}
- Hands/Gloves: ${character.equipment?.hands || 'None'}
- Right Hand: ${character.equipment?.hand_right || 'None'}
- Left Hand: ${character.equipment?.hand_left || 'None'}
- Left Ring: ${character.equipment?.ring_left || 'None'}
- Right Ring: ${character.equipment?.ring_right || 'None'}
- Backpack: ${character.equipment?.backpack || 'None'}
- Left Hip: ${character.equipment?.hip_left || 'None'}${character.equipment?.hip_left_sheathed ? ` (Sheathed: ${character.equipment.hip_left_sheathed})` : ''}
- Right Hip: ${character.equipment?.hip_right || 'None'}${character.equipment?.hip_right_sheathed ? ` (Sheathed: ${character.equipment.hip_right_sheathed})` : ''}
Inventory: ${character.inventory.join(', ')}
Encumbrance Status:
- Carried Weight: ${encumbrance.totalWeight}/${encumbrance.maxWeight} lbs (${encumbrance.weightRatio}% capacity)
- Backpack Volume: ${encumbrance.totalVolume}/${encumbrance.maxVolume} L (${encumbrance.volumeRatio}% capacity)
- Level: ${encumbrance.isOverloaded ? 'OVERLOADED (Risks collapse, cannot move easily, 2x fatigue costs, heavy penalties)' : (encumbrance.isSlowed ? 'SLOWED' : (encumbrance.isEncumbered ? 'ENCUMBERED' : 'Light Load'))}
- Physical Penalty: ${encumbrance.isEncumbered ? `${encumbrance.penaltyPercentage}% stat reduction, roll mod ${encumbrance.rollModifier}` : 'None'}
Days Starving: ${character.daysWithoutFood || 0} (Roll Penalty: -${character.daysWithoutFood || 0})

[CAMPAIGN STATE]
Current Time: ${displayTime}
Story So Far: ${journal.storySoFar}
Active Quests:
${(character.active_quests || []).map(q => `- ${q}`).join('\n')}
Completed Quests:
${(character.completed_quests || []).map(q => `- ${q}`).join('\n')}

GM Instructions for automated tags:
- Issue or deduct gold: [add_gold: X], [remove_gold: X]
- Issue or deduct items: [add_item: Item Name], [remove_item: Item Name]
- Adjust quests: [add_quest: Description], [complete_quest: Description], [remove_quest: Description]
- Apply damage or healing: [damage: X], [heal: X]
- Rest/Advance day: [advance_day]
- Unlock elemental ability: [elemental_ability_unlock: fire|earth|air|water|aether]
- Mark elemental ability as spent when used: [elemental_ability_used]
Ensure all tags are formatted exactly as shown. Always describe the narrative event corresponding to the tags.
`;

    try {
      const engine = SAGA_ENGINES.find(e => e.id === engineTier) || SAGA_ENGINES[1];
      const sessionToken = storage.get('supabase_session_token') || null;
      const response = await generateCompletion({
        provider: engine.provider,
        model: engine.model,
        apiKey,
        systemPrompt,
        history: updatedHistory,
        isHandoff: false,
        sandboxMode: sandbox,
        characterData: character,
        sessionToken,
        onChunk: (chunkText) => {
          setHistory(prev => {
            const nextHistoryList = [...prev];
            if (nextHistoryList.length > 0 && nextHistoryList[nextHistoryList.length - 1].role === 'model') {
              nextHistoryList[nextHistoryList.length - 1] = {
                ...nextHistoryList[nextHistoryList.length - 1],
                content: chunkText
              };
            }
            return nextHistoryList;
          });
        }
      });

      setIsLoading(false);

      if (response.error) {
        setApiError(response.error);
        setHistory(prev => prev.filter((h, i) => i !== prev.length - 1));
        return;
      }

      let cleanedText = response.text || '';

      // A. Location tag parsing
      const locationRegex = /\[location:\s*([^\]]+)\]/gi;
      const locationMatch = [...cleanedText.matchAll(locationRegex)].pop();
      let newLocation = locationMatch ? locationMatch[1].trim() : null;
      cleanedText = cleanedText.replace(locationRegex, '').trim();

      // B. NPC relationship trust/fear parsing
      const npcTrustRegex = /\[npc_trust:\s*([^\]\s]+)\s*([+-]?\d+)\]/gi;
      const npcTrustMatches = [...cleanedText.matchAll(npcTrustRegex)].map(m => ({ npcId: m[1].trim(), amount: parseInt(m[2], 10) }));
      cleanedText = cleanedText.replace(npcTrustRegex, '').trim();

      const npcFearRegex = /\[npc_fear:\s*([^\]\s]+)\s*([+-]?\d+)\]/gi;
      const npcFearMatches = [...cleanedText.matchAll(npcFearRegex)].map(m => ({ npcId: m[1].trim(), amount: parseInt(m[2], 10) }));
      cleanedText = cleanedText.replace(npcFearRegex, '').trim();

      // C. NPC fact parsing
      const npcFactRegex = /\[npc_fact:\s*([^\]\s]+)\s*([^\]]+)\]/gi;
      const npcFactMatches = [...cleanedText.matchAll(npcFactRegex)].map(m => ({ npcId: m[1].trim(), fact: m[2].trim() }));
      cleanedText = cleanedText.replace(npcFactRegex, '').trim();

      // Parse tags out of the response text (morality, roleplay, and advance_day)
      const moralityRegex = /\[morality:\s*([+-]?\d+)\]/gi;
      const moralityMatches = [...cleanedText.matchAll(moralityRegex)];
      let moralityChange = moralityMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
      cleanedText = cleanedText.replace(moralityRegex, '').trim();

      const rpRegex = /\[roleplay_modifier:\s*([+-]?\d+)\]/gi;
      const rpMatches = [...cleanedText.matchAll(rpRegex)];
      let roleplayChange = rpMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
      cleanedText = cleanedText.replace(rpRegex, '').trim();

      const advanceDayRegex = /\[advance_day\]/gi;
      const dayAdvanced = advanceDayRegex.test(cleanedText);
      cleanedText = cleanedText.replace(advanceDayRegex, '').trim();

      // 1. Quests parsing
      const addQuestRegex = /\[add_quest:\s*([^\]]+)\]/gi;
      const questsToAdd = [...cleanedText.matchAll(addQuestRegex)].map(m => m[1].trim());
      cleanedText = cleanedText.replace(addQuestRegex, '').trim();

      const completeQuestRegex = /\[complete_quest:\s*([^\]]+)\]/gi;
      const questsToComplete = [...cleanedText.matchAll(completeQuestRegex)].map(m => m[1].trim());
      cleanedText = cleanedText.replace(completeQuestRegex, '').trim();

      const removeQuestRegex = /\[remove_quest:\s*([^\]]+)\]/gi;
      const questsToRemove = [...cleanedText.matchAll(removeQuestRegex)].map(m => m[1].trim());
      cleanedText = cleanedText.replace(removeQuestRegex, '').trim();

      // 2. Enemy Attacks
      const enemyAttackRegex = /\[enemy_attack:\s*([^|\]]+)\|\s*([^|\]]+)\|\s*vs\s*([^|\]]+)\|\s*dmg\s*([^|\]]+)\|\s*([^|\]]+)\]/gi;
      const parsedEnemyAttacks = [...cleanedText.matchAll(enemyAttackRegex)].map(m => ({
        name: m[1].trim(),
        diceExpr: m[2].trim(),
        vsSkill: m[3].trim(),
        damageExpr: m[4].trim(),
        damageType: m[5].trim()
      }));
      cleanedText = cleanedText.replace(enemyAttackRegex, '').trim();

      if (parsedEnemyAttacks.length > 0) {
        setEnemyAttacksQueue(prev => [...prev, ...parsedEnemyAttacks]);
      }

      // 3. HP damage/healing parsing
      const damageRegex = /\[damage:\s*(?:(player|enemy)\s+)?(\d+)(?:\s+(\w+))?\]/gi;
      const damageMatches = [...cleanedText.matchAll(damageRegex)];
      cleanedText = cleanedText.replace(damageRegex, '').trim();

      const bleedRegex = /\[bleed:\s*(?:(player|enemy)\s+)?tier\s*(\d+)\]/gi;
      const bleedMatches = [...cleanedText.matchAll(bleedRegex)];
      cleanedText = cleanedText.replace(bleedRegex, '').trim();

      const healRegex = /\[heal:\s*(?:(player|enemy)\s+)?(\d+)\]/gi;
      const healMatches = [...cleanedText.matchAll(healRegex)];
      cleanedText = cleanedText.replace(healRegex, '').trim();

      // 4. Rest tag
      const restRegex = /\[rest:\s*(\d+)\]/gi;
      const restMatches = [...cleanedText.matchAll(restRegex)];
      cleanedText = cleanedText.replace(restRegex, '').trim();
      let restHours = 0;
      if (restMatches.length > 0) {
        restHours = restMatches.reduce((acc, m) => acc + parseInt(m[1], 10), 0);
      }

      // 5. Item adjustments
      const addItemRegex = /\[add_item:\s*([^\]]+)\]/gi;
      const itemsToAdd = [...cleanedText.matchAll(addItemRegex)].map(m => m[1].trim());
      cleanedText = cleanedText.replace(addItemRegex, '').trim();

      const removeItemRegex = /\[remove_item:\s*([^\]]+)\]/gi;
      const itemsToRemove = [...cleanedText.matchAll(removeItemRegex)].map(m => m[1].trim());
      cleanedText = cleanedText.replace(removeItemRegex, '').trim();

      // 6. Currency adjustments
      const currencyRegex = /\[currency:\s*([+-]?\d+)\s*(cp|sp|gp)\]/gi;
      const currencyMatches = [...cleanedText.matchAll(currencyRegex)].map(m => ({
        amount: parseInt(m[1], 10),
        unit: m[2].toLowerCase()
      }));
      cleanedText = cleanedText.replace(currencyRegex, '').trim();

      const addGoldRegex = /\[add_gold:\s*(\d+)\]/gi;
      const goldToAdd = [...cleanedText.matchAll(addGoldRegex)].reduce((acc, m) => acc + parseInt(m[1], 10), 0);
      cleanedText = cleanedText.replace(addGoldRegex, '').trim();

      const removeGoldRegex = /\[remove_gold:\s*(\d+)\]/gi;
      const goldToRemove = [...cleanedText.matchAll(removeGoldRegex)].reduce((acc, m) => acc + parseInt(m[1], 10), 0);
      cleanedText = cleanedText.replace(removeGoldRegex, '').trim();

      // 7. Fatigue
      const fatigueRegex = /\[fatigue:\s*(?:(player|enemy)\s+)?([+-]?\d+)\]/gi;
      const fatigueMatches = [...cleanedText.matchAll(fatigueRegex)];
      cleanedText = cleanedText.replace(fatigueRegex, '').trim();

      // 8. SP
      const spRegex = /\[sp:\s*(arcane|divine)\s*([+-]?\d+)\]/gi;
      const spMatches = [...cleanedText.matchAll(spRegex)];
      cleanedText = cleanedText.replace(spRegex, '').trim();

      // 9. Skill ups
      const skillUpRegex = /\[skill_up:\s*([^\]]+)\]/gi;
      const skillUpMatches = [...cleanedText.matchAll(skillUpRegex)].map(m => m[1].trim().toLowerCase());
      cleanedText = cleanedText.replace(skillUpRegex, '').trim();

      // 10. Axis Sliders
      const axisRegex = /\[axis:\s*(pragmatic|reckless)\s*([+-]?\d+)\]/gi;
      const axisMatches = [...cleanedText.matchAll(axisRegex)];
      cleanedText = cleanedText.replace(axisRegex, '').trim();

      // 11. Status
      const statusRegex = /\[status:\s*(?:(player|enemy)\s+)?(\w+)\s+(\d+)\]/gi;
      const statusMatches = [...cleanedText.matchAll(statusRegex)];
      cleanedText = cleanedText.replace(statusRegex, '').trim();

      // 12. Elemental ability unlock/use
      const elementalUnlockRegex = /\[elemental_ability_unlock:\s*(air|earth|fire|water|aether)\]/gi;
      const elementalUnlockMatches = [...cleanedText.matchAll(elementalUnlockRegex)].map(m => m[1].toLowerCase());
      cleanedText = cleanedText.replace(elementalUnlockRegex, '').trim();

      const elementalUsedRegex = /\[elemental_ability_used\]/gi;
      const elementalAbilityUsed = elementalUsedRegex.test(cleanedText);
      cleanedText = cleanedText.replace(elementalUsedRegex, '').trim();

      // Calculate HP damage mitigation details for feedback
      let combatNotice = '';
      let totalNetDamage = 0;
      let bleedTriggered = false;
      let newBleedingTier = null;

      bleedMatches.forEach(m => {
        const target = m[1] ? m[1].trim().toLowerCase() : 'player';
        if (target === 'player') {
          newBleedingTier = parseInt(m[2], 10);
        }
      });

      let totalHeal = 0;
      healMatches.forEach(m => {
        const target = m[1] ? m[1].trim().toLowerCase() : 'player';
        if (target === 'player') {
          totalHeal += parseInt(m[2], 10);
        }
      });

      damageMatches.forEach(m => {
        const target = m[1] ? m[1].trim().toLowerCase() : 'player';
        if (target === 'player') {
          const rawDamage = parseInt(m[2], 10);
          const dtype = m[3] ? m[3].trim() : '';

          const armorName = character.equipment?.armor;
          const armorType = getArmorType(armorName);
          const armorMagic = getMagicBonus(armorName);
          let armorSoak = 0;
          let armorRollText = '';
          const rollDie = (s) => Math.floor(Math.random() * s) + 1;

          if (armorType === 'light') {
            const r = rollDie(3);
            armorSoak = r + armorMagic;
            armorRollText = `1d3 (${r})${armorMagic ? ` + ${armorMagic}` : ''} light armor`;
          } else if (armorType === 'medium') {
            const r = rollDie(4);
            armorSoak = r + armorMagic;
            armorRollText = `1d4 (${r})${armorMagic ? ` + ${armorMagic}` : ''} medium armor`;
          } else if (armorType === 'heavy') {
            const r = rollDie(6);
            armorSoak = r + armorMagic;
            armorRollText = `1d6 (${r})${armorMagic ? ` + ${armorMagic}` : ''} heavy armor`;
          }

          let typeModifier = 0;
          if (dtype) {
            const dt = dtype.toLowerCase();
            if (armorType === 'light') {
              if (dt === 'piercing') typeModifier = -2;
            } else if (armorType === 'medium') {
              if (dt === 'blunt') typeModifier = -2;
              else if (dt === 'piercing') typeModifier = +2;
            } else if (armorType === 'heavy') {
              if (dt === 'blunt') typeModifier = -2;
              else if (dt === 'edged') typeModifier = +2;
            }
          }

          armorSoak = Math.max(0, armorSoak + typeModifier);
          const netDamage = Math.max(0, rawDamage - armorSoak);
          totalNetDamage += netDamage;

          combatNotice += `\n\n[Combat: Received ${rawDamage} ${dtype || ''} damage. Armor Soak: ${armorSoak} (${armorRollText || 'no armor'}${typeModifier ? ` type modifier: ${typeModifier}` : ''}). Net damage taken: ${netDamage} HP.]`;
        }
      });

      if (totalHeal > 0) {
        combatNotice += `\n\n[Combat: Healed for ${totalHeal} HP.]`;
      }

      // Bleeding is set explicitly by [bleed:] tag or margins, no passive trigger

      // Format tag updates feedback
      let tagsFeedback = '';
      if (questsToAdd.length > 0) tagsFeedback += `\n\n[Quest Added: ${questsToAdd.join(', ')}]`;
      if (questsToComplete.length > 0) tagsFeedback += `\n\n[Quest Completed: ${questsToComplete.join(', ')}]`;
      if (itemsToAdd.length > 0) tagsFeedback += `\n\n[Item Added: ${itemsToAdd.join(', ')}]`;
      if (itemsToRemove.length > 0) tagsFeedback += `\n\n[Item Removed: ${itemsToRemove.join(', ')}]`;
      if (goldToAdd > 0) tagsFeedback += `\n\n[Gold Gained: +${goldToAdd} GP]`;
      if (goldToRemove > 0) tagsFeedback += `\n\n[Gold Lost: -${goldToRemove} GP]`;
      if (currencyMatches.length > 0) {
        const text = currencyMatches.map(c => `${c.amount >= 0 ? '+' : ''}${c.amount} ${c.unit.toUpperCase()}`).join(', ');
        tagsFeedback += `\n\n[Currency Adjusted: ${text}]`;
      }
      if (parsedEnemyAttacks.length > 0) {
        tagsFeedback += `\n\n[Combat: Enemy is attacking! Defense roll required. Attacks queued: ${parsedEnemyAttacks.length}]`;
      }
      if (elementalUnlockMatches.length > 0) {
        tagsFeedback += `\n\n[Elemental Ability Unlocked: ${elementalUnlockMatches[elementalUnlockMatches.length - 1].toUpperCase()}]`;
      }
      if (elementalAbilityUsed) {
        tagsFeedback += `\n\n[Elemental Ability Used: refreshes after an 8-hour rest with rations.]`;
      }

      cleanedText += combatNotice + tagsFeedback;

      if (newLocation) {
        setCurrentLocation(newLocation);
      }

      if (npcTrustMatches.length > 0 || npcFearMatches.length > 0 || npcFactMatches.length > 0) {
        setNpcMemory(prev => {
          const nextMemory = { ...prev };
          
          npcTrustMatches.forEach(({ npcId, amount }) => {
            const key = npcId.toLowerCase();
            if (!nextMemory[key]) nextMemory[key] = { trust: 50, fear: 10, greed: 50, mood: 'neutral', facts: [] };
            nextMemory[key].trust = Math.max(0, Math.min(100, (nextMemory[key].trust || 50) + amount));
          });

          npcFearMatches.forEach(({ npcId, amount }) => {
            const key = npcId.toLowerCase();
            if (!nextMemory[key]) nextMemory[key] = { trust: 50, fear: 10, greed: 50, mood: 'neutral', facts: [] };
            nextMemory[key].fear = Math.max(0, Math.min(100, (nextMemory[key].fear || 10) + amount));
          });

          npcFactMatches.forEach(({ npcId, fact }) => {
            const key = npcId.toLowerCase();
            if (!nextMemory[key]) nextMemory[key] = { trust: 50, fear: 10, greed: 50, mood: 'neutral', facts: [] };
            if (!nextMemory[key].facts) nextMemory[key].facts = [];
            if (!nextMemory[key].facts.includes(fact)) {
              nextMemory[key].facts = [...nextMemory[key].facts, fact];
            }
          });

          return nextMemory;
        });
      }

      setCharacter(prev => {
        const updated = { ...prev };
        
        if (moralityChange !== 0) {
          updated.morality = Math.max(-100, Math.min(100, (prev.morality || 0) + moralityChange));
        }

        let pragmaticChange = 0;
        let recklessChange = 0;
        axisMatches.forEach(m => {
          const slider = m[1].toLowerCase();
          const val = parseInt(m[2], 10);
          if (slider === 'pragmatic') pragmaticChange += val;
          else if (slider === 'reckless') recklessChange += val;
        });

        if (pragmaticChange !== 0) {
          const currentP = updated.personality?.practicality || 0;
          updated.personality = {
            ...updated.personality,
            practicality: Math.max(-5, Math.min(5, currentP + pragmaticChange))
          };
        }
        if (recklessChange !== 0) {
          const currentA = updated.personality?.action || 0;
          updated.personality = {
            ...updated.personality,
            action: Math.max(-5, Math.min(5, currentA + recklessChange))
          };
        }

        if (dayAdvanced) {
          const { hasRations, updatedInventory } = consumeRationFromInventory(prev.inventory);
          updated.inventory = updatedInventory;
          updated.daysWithoutFood = hasRations ? 0 : (prev.daysWithoutFood || 0) + 1;
          
          let hpGained = 0;
          if (hasRations) {
            const vigorScore = prev.attributes.vigor || 1;
            const vigorDieSize = getVigorDie(vigorScore);
            const rollDie = (s) => Math.floor(Math.random() * s) + 1;
            const vRoll = rollDie(vigorDieSize);
            const healingRank = prev.skills.healing || 0;
            let healRankRoll = 0;
            for (let i = 0; i < healingRank; i++) {
              healRankRoll += rollDie(2);
            }
            hpGained = vRoll + healRankRoll;
          }

          updated.stats = {
            ...prev.stats,
            day: (prev.stats.day || 1) + 1,
            hour: 8.0,
            fatigue: hasRations ? (prev.stats.maxFatigue || 15) : (prev.stats.fatigue || 0),
            arcaneSP: hasRations ? (prev.stats.maxArcaneSP || 0) : (prev.stats.arcaneSP || 0),
            divineSP: hasRations ? (prev.stats.maxDivineSP || 0) : (prev.stats.divineSP || 0),
            elementalAbilityUsed: hasRations ? false : (prev.stats.elementalAbilityUsed || false)
          };
          
          if (hasRations) {
            updated.stats.hp = Math.min(prev.stats.maxHp || 10, prev.stats.hp + hpGained);
          }
        }

        // Apply net damage
        let nextHp = updated.stats.hp;
        if (totalNetDamage > 0) {
          nextHp = Math.max(-5, nextHp - totalNetDamage);
        }
        if (totalHeal > 0) {
          const maxHp = updated.stats.maxHp || 10;
          nextHp = Math.min(maxHp, nextHp + totalHeal);
        }

        // Bleeding
        let currentBleed = updated.stats.bleedingTier || 0;
        if (newBleedingTier !== null) {
          currentBleed = Math.max(0, Math.min(4, newBleedingTier));
        }

        // Death countdown
        let nextDeathCountdown = updated.stats.deathCountdown;
        if (nextHp <= 0 && nextHp > -5) {
          if (nextDeathCountdown === null) nextDeathCountdown = 5;
        } else if (nextHp <= -5 || nextHp > 0) {
          nextDeathCountdown = null;
        }

        updated.stats = {
          ...updated.stats,
          hp: nextHp,
          bleedingTier: currentBleed,
          deathCountdown: nextDeathCountdown
        };

        // Currency Modification (cp, sp, gp)
        let cp = updated.currency?.cp || 0;
        let sp = updated.currency?.sp || 0;
        let gp = updated.currency?.gp || 0;

        currencyMatches.forEach(change => {
          if (change.unit === 'cp') cp += change.amount;
          else if (change.unit === 'sp') sp += change.amount;
          else if (change.unit === 'gp') gp += change.amount;
        });

        if (goldToAdd > 0) gp += goldToAdd;
        if (goldToRemove > 0) gp = Math.max(0, gp - goldToRemove);

        let totalCp = gp * 100 + sp * 10 + cp;
        if (totalCp < 0) totalCp = 0;

        gp = Math.floor(totalCp / 100);
        sp = Math.floor((totalCp % 100) / 10);
        cp = totalCp % 10;

        updated.currency = {
          ...updated.currency,
          gp,
          sp,
          cp,
          gold: gp
        };

        // Items Modification
        const parsedItemsToAdd = [];
        itemsToAdd.forEach(itemStr => {
          const qtyMatch = itemStr.match(/^(.*?)\s*[x*]\s*(\d+)$/i);
          if (qtyMatch) {
            const name = qtyMatch[1].trim();
            const count = parseInt(qtyMatch[2], 10);
            for (let i = 0; i < count; i++) {
              parsedItemsToAdd.push(name);
            }
          } else {
            parsedItemsToAdd.push(itemStr);
          }
        });

        const parsedItemsToRemove = [];
        itemsToRemove.forEach(itemStr => {
          const qtyMatch = itemStr.match(/^(.*?)\s*[x*]\s*(\d+)$/i);
          if (qtyMatch) {
            const name = qtyMatch[1].trim();
            const count = parseInt(qtyMatch[2], 10);
            for (let i = 0; i < count; i++) {
              parsedItemsToRemove.push(name);
            }
          } else {
            parsedItemsToRemove.push(itemStr);
          }
        });

        let nextInventory = [...updated.inventory];
        parsedItemsToAdd.forEach(item => {
          nextInventory.push(item);
        });
        parsedItemsToRemove.forEach(item => {
          const idx = nextInventory.findIndex(i => i.toLowerCase() === item.toLowerCase());
          if (idx !== -1) {
            nextInventory.splice(idx, 1);
          }
        });
        updated.inventory = nextInventory;

        // Quests Modification
        let nextActiveQuests = [...(updated.active_quests || [])];
        let nextCompletedQuests = [...(updated.completed_quests || [])];

        questsToAdd.forEach(q => {
          if (!nextActiveQuests.includes(q)) {
            nextActiveQuests.push(q);
          }
        });

        questsToComplete.forEach(q => {
          const idx = nextActiveQuests.findIndex(aq => aq.toLowerCase() === q.toLowerCase());
          if (idx !== -1) {
            const actualName = nextActiveQuests[idx];
            nextActiveQuests.splice(idx, 1);
            if (!nextCompletedQuests.includes(actualName)) {
              nextCompletedQuests.push(actualName);
            }
          } else {
            if (!nextCompletedQuests.includes(q)) {
              nextCompletedQuests.push(q);
            }
          }
        });

        questsToRemove.forEach(q => {
          nextActiveQuests = nextActiveQuests.filter(aq => aq.toLowerCase() !== q.toLowerCase());
          nextCompletedQuests = nextCompletedQuests.filter(cq => cq.toLowerCase() !== q.toLowerCase());
        });

        updated.active_quests = nextActiveQuests;
        updated.completed_quests = nextCompletedQuests;

        // Rest tag execution
        let restHpGained = 0;
        let restTimeResult = null;
        let restDaysWithoutFood = updated.daysWithoutFood || 0;
        let restInventory = [...updated.inventory];

        if (restHours > 0) {
          const { hasRations, updatedInventory } = consumeRationFromInventory(updated.inventory);
          restInventory = updatedInventory;
          restTimeResult = advanceTime(updated.stats.day || 1, updated.stats.hour || 13.0, restHours);

          if (hasRations) {
            restDaysWithoutFood = 0;
            const vigorScore = updated.attributes.vigor || 1;
            const vigorDieSize = getVigorDie(vigorScore);
            const rollDie = (s) => Math.floor(Math.random() * s) + 1;
            const vRoll = rollDie(vigorDieSize);
            const healingRank = updated.skills.healing || 0;
            let healRankRoll = 0;
            for (let i = 0; i < healingRank; i++) {
              healRankRoll += rollDie(2);
            }
            restHpGained = vRoll + healRankRoll;
            nextHp = Math.min(updated.stats.maxHp || 10, nextHp + restHpGained);

            updated.stats = {
              ...updated.stats,
              day: restTimeResult.nextDay,
              hour: restTimeResult.nextHour,
              fatigue: updated.stats.maxFatigue || 15,
              arcaneSP: updated.stats.maxArcaneSP || 0,
              divineSP: updated.stats.maxDivineSP || 0,
              hp: nextHp,
              elementalAbilityUsed: false
            };
          } else {
            const daysCount = Math.floor(restHours / 24) || 1;
            restDaysWithoutFood = (updated.daysWithoutFood || 0) + daysCount;
            updated.stats = {
              ...updated.stats,
              day: restTimeResult.nextDay,
              hour: restTimeResult.nextHour
            };
          }
          updated.inventory = restInventory;
          updated.daysWithoutFood = restDaysWithoutFood;
        }

        // Fatigue modification
        let fatigueAmt = 0;
        fatigueMatches.forEach(m => {
          const target = m[1] ? m[1].trim().toLowerCase() : 'player';
          if (target === 'player') {
            fatigueAmt += parseFloat(m[2]);
          }
        });

        // SP modifications
        let arcaneSPAmt = 0;
        let divineSPAmt = 0;
        spMatches.forEach(m => {
          const pool = m[1].toLowerCase();
          const amt = parseInt(m[2], 10);
          if (pool === 'arcane') arcaneSPAmt += amt;
          else if (pool === 'divine') divineSPAmt += amt;
        });

        // Skill rank improvements
        skillUpMatches.forEach(skillStr => {
          const matchedSkill = SKILLS_LIST.find(s => 
            s.name.toLowerCase() === skillStr || 
            s.id === skillStr || 
            s.name.toLowerCase().replace(/\s+/g, '') === skillStr.replace(/\s+/g, '')
          );
          if (matchedSkill) {
            const currentRank = updated.skills[matchedSkill.id] || 0;
            updated.skills[matchedSkill.id] = Math.min(5, currentRank + 1);
          }
        });

        // Status condition additions
        const newStatuses = [];
        statusMatches.forEach(m => {
          const target = m[1] ? m[1].trim().toLowerCase() : 'player';
          if (target === 'player') {
            newStatuses.push({
              name: m[2].trim(),
              duration: parseInt(m[3], 10)
            });
          }
        });

        if (newStatuses.length > 0) {
          const currentStatuses = updated.stats.statuses || [];
          const merged = [...currentStatuses];
          newStatuses.forEach(ns => {
            const idx = merged.findIndex(s => s.name.toLowerCase() === ns.name.toLowerCase());
            if (idx !== -1) {
              merged[idx].duration = ns.duration;
            } else {
              merged.push(ns);
            }
          });
          updated.stats.statuses = merged;
        }

        if (elementalUnlockMatches.length > 0) {
          updated.stats.elementalAbility = elementalUnlockMatches[elementalUnlockMatches.length - 1];
          updated.stats.elementalAbilityUsed = false;
        } else if (elementalAbilityUsed && updated.stats.elementalAbility) {
          updated.stats.elementalAbilityUsed = true;
        }

        const maxFatigue = updated.stats.maxFatigue || 15;
        const maxArcaneSP = updated.stats.maxArcaneSP || 0;
        const maxDivineSP = updated.stats.maxDivineSP || 0;

        updated.stats = {
          ...updated.stats,
          fatigue: restHours > 0 && updated.daysWithoutFood === 0 ? maxFatigue : Math.min(maxFatigue, (updated.stats.fatigue || 0) + fatigueAmt),
          arcaneSP: restHours > 0 && updated.daysWithoutFood === 0 ? maxArcaneSP : Math.max(0, Math.min(maxArcaneSP, (updated.stats.arcaneSP || 0) + arcaneSPAmt)),
          divineSP: restHours > 0 && updated.daysWithoutFood === 0 ? maxDivineSP : Math.max(0, Math.min(maxDivineSP, (updated.stats.divineSP || 0) + divineSPAmt))
        };

        return updated;
      });

      if (roleplayChange !== 0) {
        setNextRollModifier(roleplayChange);
      }

      // Parse image tags out of the response text
      const imageTagRegex = /\[image:\s*([^\]]+)\]/i;
      const match = cleanedText.match(imageTagRegex);
      
      let imagePrompt = null;
      let imageUrl = null;

      if (match) {
        imagePrompt = match[1].trim();
        cleanedText = cleanedText.replace(imageTagRegex, '').trim();
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=600&height=400&nologo=true`;
      }

      const assistantMsg = {
        role: 'model',
        content: cleanedText,
        imagePrompt,
        imageUrl,
        checkDetails: rollDetails
      };

      const nextHistory = [...updatedHistory, assistantMsg];
      setHistory(prev => {
        const nextHistoryList = [...prev];
        if (nextHistoryList.length > 0 && nextHistoryList[nextHistoryList.length - 1].role === 'model') {
          nextHistoryList[nextHistoryList.length - 1] = assistantMsg;
        } else {
          nextHistoryList.push(assistantMsg);
        }
        return nextHistoryList;
      });

      if (engineTier === 'premium') {
        deductEnergy(activeGmId, response.totalTokens);

        if (sessionToken) {
          if (!supabaseUrl) {
            const email = storage.get('shattered_email') || 'adventurer@saga.com';
            const mockProfile = storage.get(`mock_supabase_profile_${email}`, null);
            if (mockProfile) {
              const isUnlimitedMock = mockProfile.subscription_tier === 'adventurer' || mockProfile.subscription_tier === 'legend';
              if (!isUnlimitedMock) {
                mockProfile.energy_balance = Math.max(0, mockProfile.energy_balance - 1);
                storage.set(`mock_supabase_profile_${email}`, mockProfile);
              }
              setUserProfile(mockProfile);
            }
          } else {
            await fetchUserProfile();
          }
        }
      }

      // Check if adventure step is completed (milestone check in GM text)
      const milestoneMatch = cleanedText.match(/\[milestone:\s*([^\]]+)\]/i);
      
      if (milestoneMatch) {
        // Trigger the upgrade screen for completing an adventure step!
        setIsUpgradeScreenVisible(true);
      } else {
        generateJournalSummary(nextHistory, engineTier, apiKey, sandbox);
      }

    } catch (e) {
      setIsLoading(false);
      setApiError(e.message || "An unexpected error occurred.");
    }
  };

  // Perform voluntary manual GM Swapping
  const swapGmVoluntarily = async (newGmId, apiKey, sandbox) => {
    setActiveGmId(newGmId);
    setWarningMessage(null);
    setApiError(null);
  };

  // Trigger manual scene visualization (costs 10,000 / 2,000 tokens)
  const triggerManualVisualization = (customPrompt, engineTier = 'free') => {
    if (engineTier === 'premium' && (!activeGmId || isGmDepleted(activeGmId, engineTier))) return;

    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(customPrompt)}?width=600&height=400&nologo=true`;
    const assistantMsg = {
      role: 'model',
      content: `*A magical image materializes in your mind, capturing the essence of the scene:*`,
      imagePrompt: customPrompt,
      imageUrl: imgUrl,
      isManualImage: true
    };

    setHistory(prev => [...prev, assistantMsg]);
    
    if (engineTier === 'premium') {
      deductImageCost(activeGmId);
    }
  };

  // Execute Skill Upgrades on Adventure/Milestone Complete
  const executeMilestoneUpgrades = (chosenSkillId) => {
    // 1. Find most used skill in the tally
    let mostUsedSkillId = null;
    let maxUses = 0;
    
    Object.keys(skillTally).forEach((skillId) => {
      if (skillTally[skillId] > maxUses) {
        maxUses = skillTally[skillId];
        mostUsedSkillId = skillId;
      }
    });

    setCharacter(prev => {
      const updatedSkills = { ...prev.skills };
      
      // Upgrade most used skill (+1)
      if (mostUsedSkillId) {
        updatedSkills[mostUsedSkillId] = Math.min(5, (updatedSkills[mostUsedSkillId] || 0) + 1);
      }
      
      // Upgrade chosen skill (+1) if valid and not the same as most used (unless chosen)
      if (chosenSkillId && chosenSkillId !== mostUsedSkillId) {
        updatedSkills[chosenSkillId] = Math.min(5, (updatedSkills[chosenSkillId] || 0) + 1);
      }

      const oldMaxArcane = prev.stats.maxArcaneSP || 0;
      const oldMaxDivine = prev.stats.maxDivineSP || 0;
      const newMaxArcane = (updatedSkills.arcane_drawing || 0) * 3;
      const newMaxDivine = (updatedSkills.divine_communion || 0) * 3;

      const nextCompletedAdventures = [...(prev.completed_adventures || [])];
      if (activeAdventureId && !nextCompletedAdventures.includes(activeAdventureId)) {
        nextCompletedAdventures.push(activeAdventureId);
      }

      return {
        ...prev,
        skills: updatedSkills,
        completed_adventures: nextCompletedAdventures,
        stats: {
          ...prev.stats,
          level: prev.stats.level + 1, // Increase level on milestone!
          maxArcaneSP: newMaxArcane,
          arcaneSP: (prev.stats.arcaneSP || 0) + (newMaxArcane - oldMaxArcane),
          maxDivineSP: newMaxDivine,
          divineSP: (prev.stats.divineSP || 0) + (newMaxDivine - oldMaxDivine)
        }
      };
    });

    // Reset tally & close screen
    setSkillTally({});
    setIsUpgradeScreenVisible(false);
  };

  const importCharacter = (importedChar) => {
    setCharacter(importedChar);
    setHistory([]);
    setJournal({ storySoFar: 'A new adventure awaits this imported champion.', recentTurns: [] });
    setHandoffState(null);
    setSkillTally({});
    setWarningMessage(null);
    setLastHandoffJson(null);
    setIsHandoffScreenVisible(false);
    setIsUpgradeScreenVisible(false);
    setApiError(null);
    setActiveAdventureId(null); // Force selection of new adventure
  };

  const updateCharacterPortrait = (url, seed = null) => {
    setCharacter(prev => ({
      ...prev,
      portraitUrl: url,
      ...(seed !== null ? { portraitSeed: seed } : {})
    }));
  };

  const exitAdventureSavingProgress = (onCollectGroundItems) => {
    if (activeAdventureId && onCollectGroundItems) {
      const advDrops = droppedItems[activeAdventureId] || {};
      const allDroppedItems = Object.values(advDrops).flat();
      if (allDroppedItems.length > 0) {
        onCollectGroundItems(allDroppedItems);
      }
      
      setDroppedItems(prev => {
        const next = { ...prev };
        delete next[activeAdventureId];
        return next;
      });
    }

    storage.remove(`slot_${activeSlotIndex}_pre_adventure_character`);
    setActiveAdventureId(null);
    setCurrentLocation('');
    setHistory([]);
    setJournal({ storySoFar: '', recentTurns: [] });
    setHandoffState(null);
    setSkillTally({});
    setWarningMessage(null);
    setApiError(null);
    setCharacter(prev => ({ ...prev, is_free_roaming: false }));
  };

  const quitActiveAdventure = () => {
    // Clear dropped items state for this slot
    if (activeAdventureId) {
      setDroppedItems(prev => {
        const next = { ...prev };
        delete next[activeAdventureId];
        return next;
      });
    }

    const preAdvChar = storage.get(`slot_${activeSlotIndex}_pre_adventure_character`);
    if (preAdvChar) {
      setCharacter(preAdvChar);
      storage.remove(`slot_${activeSlotIndex}_pre_adventure_character`);
    }
    setActiveAdventureId(null);
    setCurrentLocation('');
    setHistory([]);
    setJournal({ storySoFar: '', recentTurns: [] });
    setHandoffState(null);
    setSkillTally({});
    setWarningMessage(null);
    setApiError(null);
    setCharacter(prev => ({ ...prev, is_free_roaming: false }));
  };

  const startAdventure = (adventureId, gmId, startingPrompt, isFreeRoam = false) => {
    setActiveAdventureId(adventureId);
    setActiveGmId(gmId);
    storage.set(`slot_${activeSlotIndex}_pre_adventure_character`, character);
    
    const adventure = ADVENTURES_LIST.find(a => a.id === adventureId);
    const startLocation = adventure?.settings?.[0] || '';
    setCurrentLocation(startLocation);

    const startDay = adventure?.startingDay || 1;
    const startHour = adventure?.startingHour !== undefined ? adventure.startingHour : 13.0;

    setCharacter(prev => {
      const vigor = prev.attributes?.vigor || 1;
      const drawingRank = prev.skills?.arcane_drawing || 0;
      const communionRank = prev.skills?.divine_communion || 0;

      const expectedMaxFatigue = 12.5 + 2.5 * vigor;
      const expectedMaxArcane = drawingRank * 3;
      const expectedMaxDivine = communionRank * 3;

      const nextEquipment = {
        head: null, neck: null, body: null, legs: null, feet: null, hands: null,
        hand_right: null, hand_left: null, ring_left: null, ring_right: null,
        backpack: 'Small Backpack', hip_left: null, hip_right: null,
        hip_left_sheathed: null, hip_right_sheathed: null
      };
      (prev.inventory || []).forEach(item => {
        const details = getItemDetails(item);
        const slot = details.slot;
        if (!slot) return;

        if (slot === 'hand') {
          if (!nextEquipment.hand_right) {
            nextEquipment.hand_right = item;
          } else if (!nextEquipment.hand_left) {
            nextEquipment.hand_left = item;
          }
        } else if (slot === 'ring') {
          if (!nextEquipment.ring_left) {
            nextEquipment.ring_left = item;
          } else if (!nextEquipment.ring_right) {
            nextEquipment.ring_right = item;
          }
        } else if (slot === 'hip') {
          if (!nextEquipment.hip_left) {
            nextEquipment.hip_left = item;
          } else if (!nextEquipment.hip_right) {
            nextEquipment.hip_right = item;
          }
        } else {
          if (nextEquipment[slot] === null) {
            nextEquipment[slot] = item;
          }
        }
      });

      return {
        ...prev,
        equipment: nextEquipment,
        is_free_roaming: isFreeRoam,
        stats: {
          ...prev.stats,
          day: startDay,
          hour: startHour,
          fatigue: expectedMaxFatigue,
          maxFatigue: expectedMaxFatigue,
          arcaneSP: expectedMaxArcane,
          maxArcaneSP: expectedMaxArcane,
          divineSP: expectedMaxDivine,
          maxDivineSP: expectedMaxDivine
        }
      };
    });

    const startMsg = {
      role: 'model',
      content: startingPrompt,
      imagePrompt: null,
      imageUrl: null,
      checkDetails: null
    };
    setHistory([startMsg]);
    setJournal({ storySoFar: 'The saga begins.', recentTurns: [] });
    setHandoffState(null);
    setSkillTally({});
    setWarningMessage(null);
    setApiError(null);
  };

  const retryLastAction = async () => {
    if (!lastActionParams) return;
    const { actionText, apiKey, sandbox, skillFocusId, difficulty } = lastActionParams;
    await sendPlayerAction(actionText, apiKey, sandbox, skillFocusId, difficulty);
  };

  const resetGame = () => {
    const keysToWipe = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier', 'pre_adventure_character', 'last_check'
    ];
    keysToWipe.forEach(k => {
      storage.remove(`slot_${activeSlotIndex}_${k}`);
    });

    setCharacter(DEFAULT_CHARACTER);
    setActiveGmId(null);
    setHistory([]);
    setJournal({ storySoFar: '', recentTurns: [] });
    setSkillTally({});
    setWarningMessage(null);
    setIsUpgradeScreenVisible(false);
    setApiError(null);
    setActiveAdventureId(null);
    setSafetyState(DEFAULT_SAFETY_STATE);
    setNextRollModifier(0);
    setLastActionParams(null);
  };

  const eatRation = () => {
    setCharacter(prev => {
      const { hasRations, updatedInventory } = consumeRationFromInventory(prev.inventory);
      if (hasRations) {
        const currentFatigue = prev.stats.fatigue !== undefined ? prev.stats.fatigue : prev.stats.maxFatigue;
        const nextFatigue = Math.min(prev.stats.maxFatigue || 15, currentFatigue + 4);
        return {
          ...prev,
          inventory: updatedInventory,
          daysWithoutFood: 0,
          stats: {
            ...prev.stats,
            fatigue: nextFatigue
          }
        };
      }
      return prev;
    });
  };

  const restCharacter = () => {
    setCharacter(prev => {
      const { hasRations, updatedInventory } = consumeRationFromInventory(prev.inventory);
      const stats = { ...prev.stats };
      const currentDay = stats.day || 1;
      const currentHour = stats.hour || 13.0;

      // Rest advances 8 hours
      const timeResult = advanceTime(currentDay, currentHour, 8.0);
      stats.day = timeResult.nextDay;
      stats.hour = timeResult.nextHour;

      let nextInv = prev.inventory;
      let nextDaysWithoutFood = prev.daysWithoutFood;

      if (hasRations) {
        nextInv = updatedInventory;
        nextDaysWithoutFood = 0;
        stats.fatigue = stats.maxFatigue || 15;
        stats.arcaneSP = stats.maxArcaneSP || 0;
        stats.divineSP = stats.maxDivineSP || 0;
        stats.elementalAbilityUsed = false;
        
        setTimeout(() => {
          setHistory(h => [
            ...h,
            {
              role: 'model',
              content: `*You set up camp and rest for 8 hours, consuming a ration. Your physical energy, spiritual focus, and elemental focus are fully restored.*`,
              checkDetails: null
            }
          ]);
        }, 100);
      } else {
        nextDaysWithoutFood = (prev.daysWithoutFood || 0) + 1;
        
        setTimeout(() => {
          setHistory(h => [
            ...h,
            {
              role: 'model',
              content: `*You try to rest for 8 hours, but with no rations to nourish you, you cannot recover your strength. You wake up weak and hungry.*`,
              checkDetails: null
            }
          ]);
        }, 100);
      }

      return {
        ...prev,
        inventory: nextInv,
        daysWithoutFood: nextDaysWithoutFood,
        stats
      };
    });
  };

  const convertSP = (direction) => {
    setCharacter(prev => {
      const stats = { ...prev.stats };
      if (direction === 'arcane_to_divine') {
        if ((stats.arcaneSP || 0) >= 3) {
          stats.arcaneSP = (stats.arcaneSP || 0) - 3;
          stats.divineSP = Math.min(stats.maxDivineSP || 0, (stats.divineSP || 0) + 1);
        }
      } else if (direction === 'divine_to_arcane') {
        if ((stats.divineSP || 0) >= 3) {
          stats.divineSP = (stats.divineSP || 0) - 3;
          stats.arcaneSP = Math.min(stats.maxArcaneSP || 0, (stats.arcaneSP || 0) + 1);
        }
      }
      return { ...prev, stats };
    });
  };

  const equipItem = (itemName, slotName) => {
    setCharacter(prev => {
      if (!prev.inventory.includes(itemName)) return prev;

      const details = getItemDetails(itemName);
      if (!details.slot) return prev;

      // Validate matching slot
      let isValidSlot = false;
      if (details.slot === 'head' && slotName === 'head') isValidSlot = true;
      else if (details.slot === 'neck' && slotName === 'neck') isValidSlot = true;
      else if (details.slot === 'body' && slotName === 'body') isValidSlot = true;
      else if (details.slot === 'legs' && slotName === 'legs') isValidSlot = true;
      else if (details.slot === 'feet' && slotName === 'feet') isValidSlot = true;
      else if (details.slot === 'hands' && slotName === 'hands') isValidSlot = true; // gloves
      else if (details.slot === 'backpack' && slotName === 'backpack') isValidSlot = true;
      else if (details.slot === 'hand' && (slotName === 'hand_right' || slotName === 'hand_left')) isValidSlot = true;
      else if (details.slot === 'ring' && (slotName === 'ring_left' || slotName === 'ring_right')) isValidSlot = true;
      else if (details.slot === 'hip' && (slotName === 'hip_left' || slotName === 'hip_right')) isValidSlot = true;
      else if (slotName === 'hip_left_sheathed') {
        isValidSlot = prev.equipment?.hip_left === 'Weapon Sheath' &&
                      details.slot === 'hand' &&
                      (details.subslot === 'small' || details.subslot === 'medium');
      } else if (slotName === 'hip_right_sheathed') {
        isValidSlot = prev.equipment?.hip_right === 'Weapon Sheath' &&
                      details.slot === 'hand' &&
                      (details.subslot === 'small' || details.subslot === 'medium');
      }

      if (!isValidSlot) return prev;

      const nextEquipment = { ...prev.equipment };

      // Ensure we don't exceed the number of copies of the item we actually have in inventory
      const countInInventory = prev.inventory.filter(i => i === itemName).length;
      const countEquippedInOtherSlots = Object.entries(nextEquipment)
        .filter(([s, name]) => s !== slotName && name === itemName)
        .length;

      if (countEquippedInOtherSlots >= countInInventory) {
        // Find one slot containing this item and clear it
        const slotToClear = Object.entries(nextEquipment)
          .find(([s, name]) => s !== slotName && name === itemName)?.[0];
        if (slotToClear) {
          nextEquipment[slotToClear] = null;
        }
      }

      nextEquipment[slotName] = itemName;

      return {
        ...prev,
        equipment: nextEquipment
      };
    });
  };

  const unequipItem = (slotName) => {
    setCharacter(prev => {
      const nextEquipment = { ...prev.equipment };
      nextEquipment[slotName] = null;

      // Cascade sheathing rule
      if (slotName === 'hip_left') {
        nextEquipment.hip_left_sheathed = null;
      }
      if (slotName === 'hip_right') {
        nextEquipment.hip_right_sheathed = null;
      }

      return {
        ...prev,
        equipment: nextEquipment
      };
    });
  };

  const dropItem = (itemName) => {
    setCharacter(prev => {
      const idx = prev.inventory.indexOf(itemName);
      if (idx === -1) return prev;

      const nextInventory = [...prev.inventory];
      nextInventory.splice(idx, 1);

      const nextEquipment = { ...prev.equipment };
      const countInInventory = nextInventory.filter(i => i === itemName).length;
      const countEquipped = Object.values(nextEquipment).filter(name => name === itemName).length;

      if (countEquipped > countInInventory) {
        // Unequip one copy of the item
        const slotToClear = Object.entries(nextEquipment).find(([s, name]) => name === itemName)?.[0];
        if (slotToClear) {
          nextEquipment[slotToClear] = null;
          if (slotToClear === 'hip_left') nextEquipment.hip_left_sheathed = null;
          if (slotToClear === 'hip_right') nextEquipment.hip_right_sheathed = null;
        }
      }

      // Add to dropped items for the current active room/location
      if (activeAdventureId) {
        const activeAdventure = ADVENTURES_LIST.find(a => a.id === activeAdventureId);
        const loc = currentLocation || activeAdventure?.settings?.[0] || 'Unknown';
        setDroppedItems(prevDrops => {
          const advDrops = prevDrops[activeAdventureId] || {};
          const roomDrops = advDrops[loc] || [];
          return {
            ...prevDrops,
            [activeAdventureId]: {
              ...advDrops,
              [loc]: [...roomDrops, itemName]
            }
          };
        });
      }

      return {
        ...prev,
        inventory: nextInventory,
        equipment: nextEquipment
      };
    });
  };

  const pickUpItem = (itemName) => {
    if (!activeAdventureId) return;
    const activeAdventure = ADVENTURES_LIST.find(a => a.id === activeAdventureId);
    const loc = currentLocation || activeAdventure?.settings?.[0] || 'Unknown';

    setDroppedItems(prevDrops => {
      const advDrops = prevDrops[activeAdventureId] || {};
      const roomDrops = advDrops[loc] || [];
      const itemIdx = roomDrops.indexOf(itemName);
      if (itemIdx === -1) return prevDrops;

      const nextRoomDrops = [...roomDrops];
      nextRoomDrops.splice(itemIdx, 1);

      setCharacter(prev => {
        return {
          ...prev,
          inventory: [...prev.inventory, itemName]
        };
      });

      return {
        ...prevDrops,
        [activeAdventureId]: {
          ...advDrops,
          [loc]: nextRoomDrops
        }
      };
    });
  };

  const toggleEquip = (itemName) => {
    const details = getItemDetails(itemName);
    const slot = details.slot;
    if (!slot) return;

    setCharacter(prev => {
      const nextEquipment = { ...prev.equipment };
      // Find if this item is currently equipped in ANY slot
      const equippedSlot = Object.entries(nextEquipment).find(([s, name]) => name === itemName)?.[0];
      
      if (equippedSlot) {
        // Unequip it
        nextEquipment[equippedSlot] = null;
        if (equippedSlot === 'hip_left') nextEquipment.hip_left_sheathed = null;
        if (equippedSlot === 'hip_right') nextEquipment.hip_right_sheathed = null;
      } else {
        // Try to auto-equip it to a valid slot
        let slotName = null;
        if (slot === 'hand') {
          slotName = !nextEquipment.hand_right ? 'hand_right' : (!nextEquipment.hand_left ? 'hand_left' : 'hand_right');
        } else if (slot === 'ring') {
          slotName = !nextEquipment.ring_left ? 'ring_left' : (!nextEquipment.ring_right ? 'ring_right' : 'ring_left');
        } else if (slot === 'hip') {
          slotName = !nextEquipment.hip_left ? 'hip_left' : (!nextEquipment.hip_right ? 'hip_right' : 'hip_left');
        } else {
          slotName = slot;
        }

        if (slotName) {
          nextEquipment[slotName] = itemName;
        }
      }

      return {
        ...prev,
        equipment: nextEquipment
      };
    });
  };

  const resolveEnemyAttack = (defenseSkillId, attackIndex) => {
    const enemyAttack = enemyAttacksQueue[attackIndex];
    if (!enemyAttack) return;

    // Enforce weapon or shield requirement for blocking
    const rightItem = character.equipment?.hand_right;
    const leftItem = character.equipment?.hand_left;
    const rightDetails = rightItem ? getItemDetails(rightItem) : null;
    const leftDetails = leftItem ? getItemDetails(leftItem) : null;

    const isWeapon = (details) => {
      if (!details) return false;
      const nameLower = (details.name || '').toLowerCase();
      if (nameLower.includes('shield') || nameLower.includes('buckler')) return false;
      return details.slot === 'hand';
    };

    const weaponName = isWeapon(rightDetails) ? rightItem : (isWeapon(leftDetails) ? leftItem : null);
    
    const shieldName = (rightItem && (rightItem.toLowerCase().includes('shield') || rightItem.toLowerCase().includes('buckler'))) ? rightItem :
                       ((leftItem && (leftItem.toLowerCase().includes('shield') || leftItem.toLowerCase().includes('buckler'))) ? leftItem : null);

    if (defenseSkillId === 'blocking' && !weaponName && !shieldName) {
      setApiError("You cannot block without a weapon or shield equipped! Please choose Acrobatics to dodge.");
      return;
    }

    const skill = SKILLS_LIST.find(s => s.id === defenseSkillId);
    if (!skill) return;

    const primaryScore = character.attributes[skill.primary] || 1;
    const secondaryScore = character.attributes[skill.secondary] || 1;
    const skillRanks = character.skills[defenseSkillId] || 0;

    const primaryRoll = rollAttributePrimary(primaryScore);
    const secondaryRoll = rollAttributeSecondary(secondaryScore);
    const skillRoll = rollSkillRanks(skillRanks);

    // Defense penalty
    const defenseCount = character.stats.defenseCount || 0;
    const defensePenalty = defenseCount * -2;

    // Modifiers
    const shieldMagicBonus = (defenseSkillId === 'blocking') ? getMagicBonus(shieldName) : 0;

    const armorName = character.equipment?.body;
    const armorType = getArmorType(armorName);
    let armorCheckPenalty = 0;
    if (defenseSkillId === 'acrobatics') {
      if (armorType === 'medium') armorCheckPenalty = -1;
      else if (armorType === 'heavy') armorCheckPenalty = -2;
    }

    const starvationPenalty = character.daysWithoutFood || 0;
    const localFatigue = character.stats.fatigue !== undefined ? character.stats.fatigue : character.stats.maxFatigue;
    const isExhausted = localFatigue < 0;
    const exhaustionPenalty = isExhausted ? Math.floor(Math.abs(localFatigue) * 2) : 0;

    const totalDefModifier = defensePenalty - starvationPenalty - exhaustionPenalty + shieldMagicBonus + armorCheckPenalty;

    const playerRollTotal = primaryRoll + secondaryRoll + skillRoll + totalDefModifier;
    const enemyRollTotal = rollDiceExpression(enemyAttack.diceExpr);

    const margin = playerRollTotal - enemyRollTotal;
    const defenseSuccess = margin >= 0;

    // Calculate raw damage
    let rawDamage = 0;
    let rawDamageRoll = 0;
    let marginBonus = 0;
    if (!defenseSuccess) {
      const enemyMargin = enemyRollTotal - playerRollTotal;
      marginBonus = Math.floor(enemyMargin / 3);
      rawDamageRoll = rollDiceExpression(enemyAttack.damageExpr);
      rawDamage = rawDamageRoll + marginBonus;
    }

    // Armor soak
    const armorMagic = getMagicBonus(armorName);
    let armorSoakBase = 0;
    let armorRollStr = 'no armor';

    if (armorName) {
      if (armorType === 'light') {
        const r = rollDie(3);
        armorSoakBase = r + armorMagic;
        armorRollStr = `1d3 (${r})${armorMagic ? ` + ${armorMagic}` : ''} light armor`;
      } else if (armorType === 'medium') {
        const r = rollDie(4);
        armorSoakBase = r + armorMagic;
        armorRollStr = `1d4 (${r})${armorMagic ? ` + ${armorMagic}` : ''} medium armor`;
      } else if (armorType === 'heavy') {
        const r = rollDie(6);
        armorSoakBase = r + armorMagic;
        armorRollStr = `1d6 (${r})${armorMagic ? ` + ${armorMagic}` : ''} heavy armor`;
      }
    }

    let typeModifier = 0;
    const dt = (enemyAttack.damageType || '').toLowerCase();
    if (dt && armorName) {
      if (armorType === 'light') {
        if (dt === 'piercing') typeModifier = -2;
      } else if (armorType === 'medium') {
        if (dt === 'blunt') typeModifier = -2;
        else if (dt === 'piercing') typeModifier = +2;
      } else if (armorType === 'heavy') {
        if (dt === 'blunt') typeModifier = -2;
        else if (dt === 'edged') typeModifier = +2;
      }
    }
    const finalArmorSoak = Math.max(0, armorSoakBase + typeModifier);

    // Shield soak
    let shieldSoak = 0;
    let shieldRollStr = '';
    if (defenseSuccess && defenseSkillId === 'blocking' && shieldName) {
      const shieldSoakDie = getShieldSoakDie(shieldName);
      const r = rollDie(shieldSoakDie);
      shieldSoak = r + shieldMagicBonus;
      shieldRollStr = `1d${shieldSoakDie} (${r})${shieldMagicBonus ? ` + ${shieldMagicBonus}` : ''} shield`;
    }

    const totalSoak = finalArmorSoak + shieldSoak;
    let netDamage = 0;
    if (!defenseSuccess) {
      netDamage = Math.max(0, rawDamage - finalArmorSoak);
    } else if (defenseSkillId === 'blocking') {
      rawDamageRoll = rollDiceExpression(enemyAttack.damageExpr);
      rawDamage = rawDamageRoll;
      netDamage = Math.max(0, rawDamage - finalArmorSoak - shieldSoak);
    }

    // Bleeding logic
    let setBleedTier = null;

    if (!defenseSuccess) {
      const failMargin = enemyRollTotal - playerRollTotal;
      if (dt === 'edged') {
        if (failMargin >= 8) {
          setBleedTier = 2;
        } else if (failMargin >= 5) {
          setBleedTier = 1;
        }
      } else if (dt === 'piercing') {
        if (failMargin >= 8) {
          setBleedTier = 1;
        }
      }
    }

    // Time and fatigue cost
    const timeDelta = 0.0028; // 10 seconds
    const timeResult = advanceTime(character.stats.day || 1, character.stats.hour || 13.0, timeDelta);

    let finalInventory = [...character.inventory];
    let finalDaysWithoutFood = character.daysWithoutFood || 0;
    if (timeResult.advancedMidnight) {
      const { hasRations, updatedInventory } = consumeRationFromInventory(finalInventory);
      finalInventory = updatedInventory;
      finalDaysWithoutFood = hasRations ? 0 : (character.daysWithoutFood || 0) + 1;
    }

    setCharacter(prev => {
      const updated = { ...prev };
      updated.inventory = finalInventory;
      updated.daysWithoutFood = finalDaysWithoutFood;

      // Update HP
      let nextHp = prev.stats.hp;
      if (netDamage > 0) {
        nextHp = Math.max(-5, nextHp - netDamage);
      }

      // Update Bleeding
      let currentBleed = prev.stats.bleedingTier || 0;
      if (setBleedTier !== null) {
        currentBleed = Math.max(currentBleed, setBleedTier);
      }

      // Death countdown
      let nextDeathCountdown = prev.stats.deathCountdown;
      if (nextHp <= 0 && nextHp > -5) {
        if (nextDeathCountdown === null) nextDeathCountdown = 5;
      } else if (nextHp <= -5 || nextHp > 0) {
        nextDeathCountdown = null;
      }

      // Fatigue change
      const maxFatigue = prev.stats.maxFatigue || 15;
      const nextFatigue = Math.min(maxFatigue, (prev.stats.fatigue || 0) - 0.1);

      updated.stats = {
        ...prev.stats,
        hp: nextHp,
        bleedingTier: currentBleed,
        deathCountdown: nextDeathCountdown,
        defenseCount: defenseCount + 1,
        fatigue: nextFatigue,
        day: timeResult.nextDay,
        hour: timeResult.nextHour
      };

      return updated;
    });

    // Add to history
    const defSkillName = defenseSkillId === 'acrobatics' ? 'Dodge (Acrobatics)' : 'Block (Blocking)';
    const rollText = `[Defense Check: ${defSkillName} vs ${enemyAttack.name}. Player Roll: ${playerRollTotal} (Base ${primaryRoll} + ${secondaryRoll} + Skill ${skillRoll} + Modifiers ${totalDefModifier}), Enemy Roll: ${enemyRollTotal}. ${defenseSuccess ? 'Success' : 'Failure'} (${margin >= 0 ? '+' : ''}${margin} margin)]`;

    let combatResultText = '';
    if (defenseSuccess) {
      if (defenseSkillId === 'acrobatics') {
        combatResultText = `Successfully dodged! Negated all incoming damage.`;
      } else {
        combatResultText = `Successfully blocked! Raw Damage: ${rawDamage}, Shield Soak: ${shieldSoak} (${shieldRollStr || '0'}), Armor Soak: ${finalArmorSoak} (${armorRollStr || '0'}). Net damage taken: ${netDamage} HP.`;
      }
    } else {
      combatResultText = `Failed to defend! Raw Damage: ${rawDamage} (Weapon roll ${rawDamageRoll} + Margin ${marginBonus}), Armor Soak: ${finalArmorSoak} (${armorRollStr || '0'}). Net damage taken: ${netDamage} HP.`;
    }

    if (setBleedTier !== null) {
      combatResultText += ` Bleeding Tier was set to ${setBleedTier} due to high-margin ${enemyAttack.damageType || 'edged'} hit!`;
    }

    const displayTime = formatTime(timeResult.nextDay, timeResult.nextHour);
    const newLogMsg = {
      role: 'model',
      content: `*You brace yourself as the ${enemyAttack.name} attacks!* \n\n${rollText}\n\n${combatResultText}\n\n[Notice: 10 seconds passed. Current time: ${displayTime}. Fatigue: ${(localFatigue - 0.1).toFixed(1)}/${character.stats.maxFatigue?.toFixed(1)}]`,
      checkDetails: null
    };

    setHistory(prev => [...prev, newLogMsg]);

    // Remove attack from queue
    const nextQueue = enemyAttacksQueue.filter((_, idx) => idx !== attackIndex);
    setEnemyAttacksQueue(nextQueue);
  };

  const useInventoryItem = (itemName, apiKey, sandbox) => {
    if (enemyAttacksQueue.length > 0) {
      setApiError("You cannot use items while defending against an attack!");
      return;
    }

    const nameLower = itemName.toLowerCase();
    let isBandage = nameLower.includes('bandage');
    let isHealerKit = nameLower.includes("healer's kit") || nameLower.includes("healer's satchel");
    let isHerb = nameLower.includes('herb') || nameLower.includes('poultice');

    if (!isBandage && !isHealerKit && !isHerb) {
      setApiError("This item cannot be used directly to heal.");
      return;
    }

    sendPlayerAction(`I use my ${itemName} to treat myself.`, apiKey, sandbox, null, 'moderate', 0, itemName);
  };

  return {
    character,
    activeGmId,
    activeGm,
    gmEnergies,
    history,
    journal,
    skillTally,
    lastCheck,
    isLoading,
    apiError,
    warningMessage,
    isUpgradeScreenVisible,
    activeAdventureId,
    safetyState,
    nextRollModifier,
    createCharacter,
    sendPlayerAction,
    eatRation,
    restCharacter,
    convertSP,
    swapGmVoluntarily,
    triggerManualVisualization,
    executeMilestoneUpgrades,
    isGmDepleted,
    isGmLocked,
    getResetCountdown,
    closeUpgradeScreen: () => setIsUpgradeScreenVisible(false),
    resetGame,
    importCharacter,
    updateCharacterPortrait,
    quitActiveAdventure,
    exitAdventureSavingProgress,
    retryLastAction,
    setActiveAdventureId,
    startAdventure,
    userProfile,
    fetchUserProfile,
    toggleEquip,
    equipItem,
    unequipItem,
    dropItem,
    pickUpItem,
    currentLocation,
    droppedItems,
    npcMemory,
    calculateWeightAndVolume,
    enemyAttacksQueue,
    resolveEnemyAttack,
    useInventoryItem
  };
}
