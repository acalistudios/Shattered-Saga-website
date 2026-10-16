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
  },
  {
    id: 'air',
    element: 'air',
    name: 'Air Shard of the Tempest',
    fontTitle: 'The Gale Crest',
    color: '#10b981',
    bgClass: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/50 text-emerald-400',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    particleColor: 'text-emerald-300',
    icon: '🌪️',
    sourceAdventureIds: ['blackroot_hollow', 'greywash_bandit_crown'],
    sourceAdventuresText: 'Blackroot Hollow or Greywash Bandit Crown',
    region: 'Aethelgard Canopy & Peaks',
    lore: 'Humming with the swift drafts of the mountain passes, this aerodynamic shard sharpens perception and empowers swift unerring flight.',
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
 * Determines whether Tier 4 (Mythic Cataclysms) adventures are accessible.
 * Requires at least 3 restored Keystone Shards unless sandboxMode is true.
 */
export function isTier4Unlocked(character = {}, sandboxMode = false) {
  if (sandboxMode) return true;
  return getKeystoneCount(character) >= 3;
}
