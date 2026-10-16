// Shattered Saga - Companions & Teamwork System
// Companions can be rescued or recruited across adventures to provide
// authentic teamwork assists, shoring up untrained checks for solo builds.

export const COMPANIONS = [
  {
    id: 'skritt_goblin',
    name: 'Skritt the Goblin Scout',
    adventureId: 'ashveil_keep',
    role: 'Vanguard Infiltrator & Trap-Disarmer',
    icon: '👺',
    skills: ['stealth', 'trapping', 'perception'],
    assistBonus: 1,
    recruitmentHint: 'Befriend Skritt in the Great Hall of Ashveil Keep by offering rations or safe conduct.',
    desc: 'A clever, wiry goblin who scouts corridors ahead, sniff-testing tripwires and creating flanking distractions in skirmishes.',
    partingBoon: {
      partingTitle: "Skritt's Lockpick Shim & Scavenger's Favor",
      partingNarrative: "With Ashveil Keep's curse broken, Skritt stuffs his pouches with scavenged trinkets and offers an appreciative goblin toothy grin: 'Big folk not bad. You kept Skritt alive, so Skritt leaves you his luckiest lock-shim. Don't lose it, boss!' He slips into the mossy hills, returning home to his tribe.",
      rewardItem: "Skritt's Lockpick Shim",
      itemDetails: {
        name: "Skritt's Lockpick Shim",
        desc: "A bendable titanium-alloy lockpick shim crafted by goblin scavengers. Grants +1 to Thievery and Trapping checks.",
        properties: "Grants +1 to Thievery and Trapping checks."
      },
      reputation: { faction: 'Underworld Scavengers', amount: 10 }
    }
  },
  {
    id: 'kaelen_miner',
    name: 'Kaelen Iron-Breaker',
    adventureId: 'saltblood_mines',
    role: 'Freed Miner & Heavy Enforcer',
    icon: '⚒️',
    skills: ['heavy_weapons', 'athletics', 'smithing'],
    assistBonus: 1,
    recruitmentHint: 'Rally and liberate Kaelen from the Intake Cages of the Saltblood Mines.',
    desc: 'A burly salt miner whose heavy pickaxe strikes and structural expertise can shatter barricades, pry open cell bars, and forge improvised gear.',
    partingBoon: {
      partingTitle: "Kaelen's Tempered Sledge & Miner's Solidarity",
      partingNarrative: "Breathing free sea air once more outside the Saltblood Mines, Kaelen rolls his boulder-broad shoulders and hands you his heavy steel sledge: 'I owe you my life and my freedom, friend. Take my tempered sledge—it cracked saltstone for a decade, and it will shatter any armor in your way.' He departs to lead the surviving miners back to their families.",
      rewardItem: "Kaelen's Tempered Sledge",
      itemDetails: {
        name: "Kaelen's Tempered Sledge",
        desc: "A balanced, steel-faced sledgehammer tempered in brine. Heavy Weapon that deals devastating crushing blows; grants +1 to Athletics and Smithing checks.",
        properties: "Heavy Weapon +1; grants +1 to Athletics and Smithing checks."
      },
      reputation: { faction: 'Saltblood Miners Guild', amount: 15 }
    }
  },
  {
    id: 'silas_hound',
    name: 'Silas the Timber-Hound',
    adventureId: 'blackroot_hollow',
    role: 'Faithful Beast Companion',
    icon: '🐕',
    skills: ['tracking', 'animal_rapport', 'survival'],
    assistBonus: 1,
    recruitmentHint: 'Cut Silas free from the spider cocoons in the Webbed Cavern of Blackroot Hollow.',
    desc: 'A loyal, broad-chested mastiff with razor-sharp senses. Silas detects hidden ambushes before they strike and guides you across trackless wildlands.',
    partingBoon: {
      partingTitle: "Silas's Polished Bone Fang & Beast-Kin Bond",
      partingNarrative: "As the oppressive twilight of Blackroot Hollow fades behind you, Silas nudges your hand with a deep, affectionate whine. He drops an ancient mastiff tooth talisman at your feet, licks your fingers in heartfelt farewell, and bounds off toward his pack in the verdant pine ridge.",
      rewardItem: "Silas's Bone Fang",
      itemDetails: {
        name: "Silas's Bone Fang",
        desc: "A carved timber-hound tooth talisman on braided sinew. Grants +1 to Tracking and Survival checks.",
        properties: "Grants +1 to Tracking and Survival checks."
      },
      reputation: { faction: 'Sylvan Beast-Kin', amount: 10 }
    }
  },
  {
    id: 'sister_maren',
    name: 'Sister Maren',
    adventureId: 'merrin_abbey_plague_bells',
    role: 'Consecrated Field Medic',
    icon: '🕊️',
    skills: ['healing', 'divine_communion', 'herbalism'],
    assistBonus: 1,
    recruitmentHint: 'Rescue Sister Maren from the locked Infirmary Cloister of Merrin Abbey.',
    desc: 'A courageous field nurse and nun whose herb poultices, soothing prayers, and wound dressings mend trauma and cleanse foul contagions.',
    partingBoon: {
      partingTitle: "Consecrated Healing Draught & Saint's Benediction",
      partingNarrative: "As the tolling of Merrin Abbey's plague bells falls silent and the air clears of miasma, Sister Maren clasps your hands in warm gratitude: 'The Light has guided your steps and spared our flock. Take this consecrated draught with my blessing—may it preserve you when darkness falls.' She remains behind to tend the healing sanctuary.",
      rewardItem: "Consecrated Healing Draught",
      itemDetails: {
        name: "Consecrated Healing Draught",
        desc: "An ivory vial filled with consecrated herb tincture. Instantly staunches all bleeding, removes poison and disease, and restores 6 HP.",
        properties: "One-use miracle draught: Cleanses poison, disease, all bleeding tiers, and restores 6 HP."
      },
      reputation: { faction: 'Order of Saint Merrin', amount: 15 }
    }
  },
  {
    id: 'cogtail_familiar',
    name: 'Cog-Tail the Brass Familiar',
    adventureId: 'clockwork_conservatory',
    role: 'Clockwork Artificer Familiar',
    icon: '⚙️',
    skills: ['crafting', 'lockpicking', 'arcane_drawing'],
    assistBonus: 1,
    recruitmentHint: 'Restore the mainspring of this brass cat in the Chronos Vault of the Clockwork Conservatory.',
    desc: 'An intricate, spring-loaded mechanical familiar with dexterous brass claws capable of turning tumbler pins, realigning gears, and drawing ambient mana.',
    partingBoon: {
      partingTitle: "Clockwork Mainspring & Artificer Acuity",
      partingNarrative: "With the Chronos Vault stilled and the Conservatory gears spinning in harmonious equilibrium, Cog-Tail emits a soft purr of clicking gears and brass bells. It ejects a duplicate, self-winding chronos mainspring into your palm before curling up on its pedestal to recharge: 'TICK... TICK... FAREWELL, MASTER ARCHITECT.'",
      rewardItem: "Clockwork Mainspring",
      itemDetails: {
        name: "Clockwork Mainspring",
        desc: "An intricate perpetual-motion brass escapement. Grants +1 to Crafting and Arcane Drawing checks.",
        properties: "Grants +1 to Crafting and Arcane Drawing checks."
      },
      reputation: { faction: 'Guild of Master Artificers', amount: 10 }
    }
  }
];

export function getCompanionById(id) {
  return COMPANIONS.find(c => c.id === id) || null;
}

export function getCompanionsForAdventure(adventureId) {
  return COMPANIONS.filter(c => c.adventureId === adventureId);
}

export function getPartingBoon(companionId) {
  const comp = getCompanionById(companionId);
  return comp?.partingBoon || null;
}

export function getCompanionForSkill(companions = [], skillId) {
  if (!Array.isArray(companions) || companions.length === 0) return null;
  for (const compId of companions) {
    const comp = typeof compId === 'string' ? getCompanionById(compId) : compId;
    if (comp && comp.skills && comp.skills.includes(skillId)) {
      return comp;
    }
  }
  return null;
}

export function calculateCompanionSkillBonus(companions = [], skillId) {
  const comp = getCompanionForSkill(companions, skillId);
  return comp ? (comp.assistBonus || 1) : 0;
}
