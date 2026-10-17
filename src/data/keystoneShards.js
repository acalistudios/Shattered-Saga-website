// Keystone Shards data model for Shattered Saga
// Tracks the restoration of the ancient Fivefold Font across the campaign

export const KEYSTONE_SHARDS = [
  {
    id: 'fire',
    element: 'fire',
    name: 'Fire Shard of Cinder',
    fontTitle: 'The Ignis Ember',
    color: '#ef4444',
    bgClass: 'from-orange-600/30 to-red-600/30 border-red-500/50 text-red-400',
    glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    particleColor: 'text-amber-400',
    icon: '🔥',
    sourceAdventureIds: ['obsidian_vault', 'elemental_crucible'],
    sourceAdventuresText: 'The Obsidian Vault or The Elemental Crucible',
    region: 'Ignis Ridge / Aethelgard',
    lore: 'Forged within the volcanic vents of Ignis Ridge, this ember keystone burns with primordial heat, reigniting courage and burning away spiritual blight.',
    resonance: {
      perkName: 'Cinder Might',
      perkDesc: '+1 damage to physical attacks and offensive spells, +1 to Intimidation checks.',
      attackDamageBonus: 1,
      spellDamageBonus: 1,
      skillBonuses: {
        intimidation: 1
      }
    }
  },
  {
    id: 'earth',
    element: 'earth',
    name: 'Earth Shard of Granite',
    fontTitle: 'The Stone Core',
    color: '#f59e0b',
    bgClass: 'from-amber-600/30 to-yellow-600/30 border-amber-500/50 text-amber-400',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    particleColor: 'text-yellow-400',
    icon: '⛰️',
    sourceAdventureIds: ['saltblood_mines', 'ashveil_keep'],
    sourceAdventuresText: 'Saltblood Mines or Ashveil Keep',
    region: 'Aethelgard Deep',
    lore: 'Carved from the deepest strata beneath the realm, this dense granite keystone anchors physical fortitude and stabilizes subterranean fractures.',
    resonance: {
      perkName: 'Granite Bastion',
      perkDesc: '+5 Max HP, +1 armor soak against crushing blows, +1 to Athletics checks.',
      maxHpBonus: 5,
      crushingSoakBonus: 1,
      skillBonuses: {
        athletics: 1
      }
    }
  },
  {
    id: 'water',
    element: 'water',
    name: 'Water Shard of the Deep',
    fontTitle: 'The Tide Seal',
    color: '#06b6d4',
    bgClass: 'from-cyan-600/30 to-blue-600/30 border-cyan-500/50 text-cyan-400',
    glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    particleColor: 'text-cyan-300',
    icon: '🌊',
    sourceAdventureIds: ['sunken_spire', 'drowned_market'],
    sourceAdventuresText: 'The Sunken Spire or The Drowned Market',
    region: 'The Sapphire Deep',
    lore: 'Pulled from the drowned sanctuaries of the abyssal shelf, this fluid crystalline shard preserves ancient memory and revitalizes the healing tides.',
    resonance: {
      perkName: 'Tidal Surge & Mend',
      perkDesc: 'Recovers +1 HP and staunches 1 tier of bleeding every 2 hours of elapsed time (+4 bonus HP and full bleed recovery over an 8-hour rest, plus ongoing trickle during exploration), +1 to Athletics and Survival checks.',
      periodicHealHpPer2Hours: 1,
      periodicStaunchBleedPer2Hours: 1,
      restHpBonus: 4,
      restBleedStaunch: 4,
      skillBonuses: {
        athletics: 1,
        survival: 1
      }
    }
  },
  {
    id: 'air',
    element: 'air',
    name: 'Air Shard of the Tempest',
    fontTitle: 'The Gale Crest',
    color: '#10b981',
    bgClass: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/50 text-emerald-400',
    glowClass: 'shadow-[0_0_15px_rgba(160,185,129,0.5)]',
    particleColor: 'text-emerald-300',
    icon: '🌪️',
    sourceAdventureIds: ['blackroot_hollow', 'greywash_bandit_crown'],
    sourceAdventuresText: 'Blackroot Hollow or Greywash Bandit Crown',
    region: 'Aethelgard Canopy & Peaks',
    lore: 'Humming with the swift drafts of the mountain passes, this aerodynamic shard sharpens perception and empowers swift unerring flight.',
    resonance: {
      perkName: 'Zephyr Stride',
      perkDesc: '+1 to Dodge / Acrobatics checks, +5 Stamina Capacity (Fatigue Resistance), +1 to Initiative.',
      dodgeBonus: 1,
      maxFatigueBonus: 5,
      initiativeBonus: 1,
      skillBonuses: {
        acrobatics: 1
      }
    }
  },
  {
    id: 'aether',
    element: 'aether',
    name: 'Aether Shard of the Weave',
    fontTitle: 'The Planar Spindle',
    color: '#a855f7',
    bgClass: 'from-purple-600/30 to-violet-600/30 border-purple-500/50 text-purple-400',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    particleColor: 'text-violet-300',
    icon: '✨',
    sourceAdventureIds: ['clockwork_conservatory', 'mirror_war_saint_orra'],
    sourceAdventuresText: 'Clockwork Conservatory or Mirror War of Saint Orra',
    region: 'Astral Reach / Great Archives',
    lore: 'Pulsing with iridescent metaphysical threads, this resonant spindle mends planar tears and prevents reality from fraying under planar static.',
    resonance: {
      perkName: 'Void Weave',
      perkDesc: '+1 Spell Power (increases damage and healing magnitude of all spells by +1), +1 Max Arcane SP & +1 Max Divine SP capacity, +1 to Lore and planar Languages checks.',
      spellPowerBonus: 1,
      maxArcaneSpBonus: 1,
      maxDivineSpBonus: 1,
      skillBonuses: {
        lore: 1,
        languages: 1
      }
    }
  },
];

/**
 * Returns detailed status of all 5 keystone shards for a character.
 */
export function getKeystoneStatus(character = {}) {
  const completed = character?.completed_adventures || [];
  const inventory = character?.inventory || [];

  return KEYSTONE_SHARDS.map(shard => {
    // Check if any source adventure has been completed
    const completedSource = shard.sourceAdventureIds.find(id => completed.includes(id));
    
    // Also check if an explicit relic item is carried in inventory
    const hasRelicInInventory = inventory.some(item => {
      const lower = String(item).toLowerCase();
      return lower.includes(shard.id) && (lower.includes('shard') || lower.includes('keystone') || lower.includes('core'));
    });

    const isAwakened = Boolean(completedSource || hasRelicInInventory);

    return {
      ...shard,
      isAwakened,
      completedSourceId: completedSource || null,
      perkName: shard.resonance?.perkName,
      perkDesc: shard.resonance?.perkDesc
    };
  });
}

/**
 * Returns the count of awakened keystone shards (0-5).
 */
export function getKeystoneCount(character = {}) {
  const status = getKeystoneStatus(character);
  return status.filter(s => s.isAwakened).length;
}

/**
 * Returns all currently awakened keystone shards and their active perks.
 */
export function getActiveKeystoneResonances(character = {}) {
  return getKeystoneStatus(character).filter(s => s.isAwakened);
}

/**
 * Aggregates all numeric and skill modifiers from awakened keystone shards.
 */
export function getKeystoneStatModifiers(character = {}) {
  const activeShards = getActiveKeystoneResonances(character);
  const mods = {
    attackDamageBonus: 0,
    spellDamageBonus: 0,
    spellPowerBonus: 0,
    maxHpBonus: 0,
    crushingSoakBonus: 0,
    maxFatigueBonus: 0,
    dodgeBonus: 0,
    initiativeBonus: 0,
    maxArcaneSpBonus: 0,
    maxDivineSpBonus: 0,
    periodicHealHpPer2Hours: 0,
    periodicStaunchBleedPer2Hours: 0,
    restHpBonus: 0,
    restBleedStaunch: 0,
    skillBonuses: {}
  };

  for (const shard of activeShards) {
    if (shard.resonance) {
      const res = shard.resonance;
      if (res.attackDamageBonus) mods.attackDamageBonus += res.attackDamageBonus;
      if (res.spellDamageBonus) mods.spellDamageBonus += res.spellDamageBonus;
      if (res.spellPowerBonus) mods.spellPowerBonus += res.spellPowerBonus;
      if (res.maxHpBonus) mods.maxHpBonus += res.maxHpBonus;
      if (res.crushingSoakBonus) mods.crushingSoakBonus += res.crushingSoakBonus;
      if (res.maxFatigueBonus) mods.maxFatigueBonus += res.maxFatigueBonus;
      if (res.dodgeBonus) mods.dodgeBonus += res.dodgeBonus;
      if (res.initiativeBonus) mods.initiativeBonus += res.initiativeBonus;
      if (res.maxArcaneSpBonus) mods.maxArcaneSpBonus += res.maxArcaneSpBonus;
      if (res.maxDivineSpBonus) mods.maxDivineSpBonus += res.maxDivineSpBonus;
      if (res.periodicHealHpPer2Hours) mods.periodicHealHpPer2Hours += res.periodicHealHpPer2Hours;
      if (res.periodicStaunchBleedPer2Hours) mods.periodicStaunchBleedPer2Hours += res.periodicStaunchBleedPer2Hours;
      if (res.restHpBonus) mods.restHpBonus += res.restHpBonus;
      if (res.restBleedStaunch) mods.restBleedStaunch += res.restBleedStaunch;
      if (res.skillBonuses) {
        for (const [skill, val] of Object.entries(res.skillBonuses)) {
          mods.skillBonuses[skill] = (mods.skillBonuses[skill] || 0) + val;
        }
      }
    }
  }

  return mods;
}

/**
 * Determines whether Tier 4 (Mythic Cataclysms) adventures are accessible.
 * Requires at least 3 restored Keystone Shards unless sandboxMode is true.
 */
export function isTier4Unlocked(character = {}, sandboxMode = false) {
  if (sandboxMode) return true;
  return getKeystoneCount(character) >= 3;
}
