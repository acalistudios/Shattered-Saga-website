// Campfire Interludes & Companion Rest Duties
// Enhances the 8-hour rest mechanic with rich party dialogue and preparation perks

import { COMPANIONS } from './companions';

export const COMPANION_CAMPFIRE_DATA = {
  skritt_goblin: {
    dialogue: [
      "Skritt crouches near the fire, roasting a dry beetle on a copper wire. 'Under-tunnels are quiet tonight, Boss. No red eyes watching. Skritt make sure of it. Best bedroll sleep you get in weeks!'",
      "Skritt rolls a round river pebble between his green palms. 'Vance at the forge... he think goblins only steal. But Skritt knows every loose stone in Aethelgard. Glad you didn't swing your sword when we met in the Great Hall.'",
      "Skritt checks his ear notches. 'If big shadows come again like Malachar, we do smart trick, right? Not fight shadow with iron. We use the altar stones!'"
    ],
    duty: {
      id: 'night_snare',
      name: 'Perimeter Snare & Forage',
      desc: 'Skritt strings wire snares and scouts the perimeter. 50% chance to forage 1 wild trail ration; alerts camp against night hazards.',
      actionText: 'Set Night Snares',
    }
  },
  kaelen_miner: {
    dialogue: [
      "Kaelen taps the edge of his war-pick with a whetstone in a steady, calming rhythm. 'In the Saltblood deeps, you learned to sleep with one eye on the timber props. Out here under the open sky... it takes some getting used to. But I am honored to stand beside you.'",
      "Kaelen stares into the red embers. 'The miners who didn't make it out... we carry their names forward. Every bandit line we break, every sealed crypt we open, we make the realm a little safer for ordinary folk.'",
      "Kaelen inspects your shield. 'Steel without care will fail when you need it most. Hand me your cuirass before we turn in—I'll tighten those rivets.'"
    ],
    duty: {
      id: 'armor_cinch',
      name: 'Armor Cinch & Whetstone',
      desc: 'Kaelen inspects, hammers, and tightens your armor rivets. Grants +2 temporary HP barrier to absorb damage in your next battle.',
      actionText: 'Hone Armor & Weapons',
    }
  },
  silas_hound: {
    dialogue: [
      "Silas rests his heavy muzzle across your boot, exhaling a deep, contented breath that warms your toes against the night chill. His amber eyes reflect the flickering campfire flame.",
      "A soft night breeze rustles through the brush. Silas raises one ear, tests the scent on the wind with two sharp sniffs, then settles back down with an approving tail thump against the earth.",
      "Silas nudges your hand with his wet nose, asking for behind-the-ear scritches before curling into a tight, warm ball beside your bedroll."
    ],
    duty: {
      id: 'hearth_vigil',
      name: 'Hearth Vigil & Warmth',
      desc: 'Silas curls tightly against your bedroll, keeping faithful watch and warming your bones. Grants +10 bonus Fatigue recovery upon waking.',
      actionText: 'Curl Up Beside Silas',
    }
  },
  sister_maren: {
    dialogue: [
      "Sister Maren carefully wipes the bronze plague bell of Merrin Abbey with a lavender-scented cloth. 'The bells of Merrin rang for sorrow so long, traveler. But traveling with you... for the first time in years, I feel they may ring for hope again.'",
      "Sister Maren bows her head over the fire, fingers tracing the silver prayer beads of the Shroud. 'The incorporeal darkness cannot endure where sincere purpose burns. Rest easy tonight—my prayers shall watch over your slumber.'",
      "Sister Maren notices the scrapes on your knuckles. 'Come here by the light. Let me tend those cuts with wintergreen and yarrow tallow before they fester.'"
    ],
    duty: {
      id: 'sacred_poultice',
      name: 'Herbal Poultice & Benediction',
      desc: 'Sister Maren cleans injuries with soothing balms and prayers. Recovers 3 HP or staunches active bleeding; restores +1 extra Divine SP.',
      actionText: 'Receive Maren\'s Benediction',
    }
  },
  cogtail_familiar: {
    dialogue: [
      "Cog-Tail perches on a campfire log, its brass tail ticking in gentle seconds like a pocket chronometer. It inspects a spent brass bolt with tiny magnifying lenses before polishing it with oil.",
      "A soft musical chime resonates from Cog-Tail's internal chime-box. It tilts its brass-plated head, blinking twin sapphire optical diodes in what appears to be affectionate curiosity.",
      "Cog-Tail scurries over to your pack, gingerly oiling the hinges of your masterwork tools and lockpicks with a micro-dropper of clockwork lubricant."
    ],
    duty: {
      id: 'clockwork_tuning',
      name: 'Clockwork Calibration',
      desc: 'Cog-Tail oils delicate spring catches, tumblers, and pins. Grants a +1 bonus modifier to your next Lockpicking, Smithing, or Crafting check.',
      actionText: 'Calibrate Tools & Mechanisms',
    }
  }
};

// Aliases for convenient shorthand lookup
COMPANION_CAMPFIRE_DATA.skritt = COMPANION_CAMPFIRE_DATA.skritt_goblin;
COMPANION_CAMPFIRE_DATA.kaelen = COMPANION_CAMPFIRE_DATA.kaelen_miner;
COMPANION_CAMPFIRE_DATA.silas = COMPANION_CAMPFIRE_DATA.silas_hound;
COMPANION_CAMPFIRE_DATA.cog_tail = COMPANION_CAMPFIRE_DATA.cogtail_familiar;

export function normalizeCompanionId(id) {
  if (!id) return '';
  const str = String(id).toLowerCase();
  if (str.startsWith('skritt')) return 'skritt_goblin';
  if (str.startsWith('kaelen')) return 'kaelen_miner';
  if (str.startsWith('silas')) return 'silas_hound';
  if (str.startsWith('sister') || str.startsWith('maren')) return 'sister_maren';
  if (str.startsWith('cog')) return 'cogtail_familiar';
  return id;
}

/**
 * Returns campfire dialogue and duty info for a companion.
 */
export function getCompanionCampfireInfo(companionId) {
  const normId = normalizeCompanionId(companionId);
  const companion = COMPANIONS.find(c => c.id === normId);
  const data = COMPANION_CAMPFIRE_DATA[normId] || COMPANION_CAMPFIRE_DATA[companionId];
  if (!companion || !data) return null;

  return {
    ...companion,
    ...data,
  };
}

/**
 * Applies a chosen companion's campfire rest duty to the character.
 */
export function applyCompanionCampfireDuty(character, companionId) {
  const normId = normalizeCompanionId(companionId);
  const info = getCompanionCampfireInfo(normId);
  if (!info) return { character, message: '' };

  const updatedStats = { ...character.stats };
  const updatedProgression = { ...(character.progression || {}) };
  let dutyMessage = '';

  switch (normId) {
    case 'skritt_goblin': {
      // 50% chance for 1 ration
      const foraged = Math.random() < 0.5;
      if (foraged) {
        const inventory = [...(character.inventory || [])];
        inventory.push('Rations (1)');
        dutyMessage = '*Skritt slips back into camp at midnight clutching a fat roasted river trout and plump berries! Added 1 Ration to your pack.*';
        return {
          character: { ...character, inventory, stats: updatedStats, progression: updatedProgression },
          message: dutyMessage,
        };
      } else {
        dutyMessage = '*Skritt scouts the dark perimeter and disarms an old rusted mantrap, ensuring the camp rests peacefully.*';
        return {
          character: { ...character, stats: updatedStats, progression: updatedProgression },
          message: dutyMessage,
        };
      }
    }

    case 'kaelen_miner': {
      // +2 temporary HP barrier
      const currentTempHp = updatedStats.tempHp || 0;
      updatedStats.tempHp = Math.max(currentTempHp, 2);
      dutyMessage = '*Kaelen hammers and reinforces your armor buckles with dwarven smithcraft. Gained +2 Temporary HP barrier for your next fight!*';
      return {
        character: { ...character, stats: updatedStats, progression: updatedProgression },
        message: dutyMessage,
      };
    }

    case 'silas_hound': {
      // +10 extra fatigue recovery
      updatedStats.fatigue = Math.max(0, (updatedStats.fatigue || 0) - 10);
      dutyMessage = '*Silas curls beside your bedroll, his deep canine warmth soothing your weary muscles. Recovered an extra 10 Fatigue!*';
      return {
        character: { ...character, stats: updatedStats, progression: updatedProgression },
        message: dutyMessage,
      };
    }

    case 'sister_maren': {
      // 3 HP heal, +1 extra Divine SP
      updatedStats.hp = Math.min(updatedStats.maxHp || 10, (updatedStats.hp || 10) + 3);
      if (updatedStats.maxDivineSP && updatedStats.maxDivineSP > 0) {
        updatedStats.divineSP = Math.min(updatedStats.maxDivineSP, (updatedStats.divineSP || 0) + 1);
      }
      dutyMessage = '*Sister Maren applies soothing yarrow salve to your injuries and chants a prayer of comfort. Recovered 3 HP and +1 Divine SP!*';
      return {
        character: { ...character, stats: updatedStats, progression: updatedProgression },
        message: dutyMessage,
      };
    }

    case 'cogtail_familiar': {
      // +1 bonus to next lockpicking/smithing/crafting check
      updatedProgression.campfireToolBonus = {
        skills: ['lockpicking', 'smithing', 'crafting'],
        bonus: 1,
      };
      dutyMessage = '*Cog-Tail purrs and cleans your delicate tools with precision clockwork oil. Grants +1 bonus to your next Lockpicking or Crafting check!*';
      return {
        character: { ...character, stats: updatedStats, progression: updatedProgression },
        message: dutyMessage,
      };
    }

    default:
      return { character, message: '' };
  }
}
