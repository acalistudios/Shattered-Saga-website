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
    desc: 'A clever, wiry goblin who scouts corridors ahead, sniff-testing tripwires and creating flanking distractions in skirmishes.'
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
    desc: 'A burly salt miner whose heavy pickaxe strikes and structural expertise can shatter barricades, pry open cell bars, and forge improvised gear.'
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
    desc: 'A loyal, broad-chested mastiff with razor-sharp senses. Silas detects hidden ambushes before they strike and guides you across trackless wildlands.'
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
    desc: 'A courageous field nurse and nun whose herb poultices, soothing prayers, and wound dressings mend trauma and cleanse foul contagions.'
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
    desc: 'An intricate, spring-loaded mechanical familiar with dexterous brass claws capable of turning tumbler pins, realigning gears, and drawing ambient mana.'
  }
];

export function getCompanionById(id) {
  return COMPANIONS.find(c => c.id === id) || null;
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
