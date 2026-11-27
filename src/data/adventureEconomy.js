import { coinValue } from './economy';

const itemValue = (valueCp, category, notes = '') => ({
  valueCp,
  value: coinValue(valueCp),
  category,
  notes,
});

const sell = (item, priceCp, stock = 1) => ({ item, priceCp, price: coinValue(priceCp), stock });

export const ADVENTURE_ECONOMY_METADATA = {
  elemental_crucible: {
    itemValues: {
      'Fivefold Keystone': itemValue(7500, 'relics', 'Major story relic; marketable only to specialized or morally complicated buyers.'),
      'Cinder Antler Shard': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Granite Heart Pebble': itemValue(7500, 'relics', 'Major story relic; marketable only to specialized or morally complicated buyers.'),
      'Aether Thread Spindle': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Elemental Awakening Mark': itemValue(7500, 'relics', 'Major story relic; marketable only to specialized or morally complicated buyers.'),
    },
    merchants: [
      {
        name: 'Ilyra of the Fivefold Font',
        portrait: 'ilyra_of_the_fivefold_font', // public/images/npcs/<adventure>/ilyra_of_the_fivefold_font.webp, shown in the room panel
        role: 'elemental shrine caretaker',
        location: 'Fivefold Gate',
        sells: [
          sell('Holy Water', 100, 2),
          sell('Minor Potion or Elixir', 500, 2),
          sell('Rations (5)', 25, 4),
        ],
        buys: ['relics', 'alchemy', 'lore'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Trades in offerings, safe ritual supplies, and relic lore rather than mundane bulk goods.',
      },
    ],
  },
  ashveil_keep: {
    itemValues: {
      'Creator\'s Binding Seal Tile': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Demon-Cult Amulet': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Aldric\'s Signet Ring': itemValue(1000, 'jewelry', 'Portable treasure or prestige object.'),
      '+1 Dagger (Voss Crest)': itemValue(5000, 'magical_weapons', 'Enchanted or masterwork item with a reliable +1 bonus.'),
      '+1 Shield (Voss Crest)': itemValue(5000, 'magical_armor', 'Enchanted or masterwork item with a reliable +1 bonus.'),
      'Holy Water': itemValue(100, 'alchemy', 'Consecrated water useful against demons, undead, and incorporeal evil.'),
      'Silver Mirror': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Binding Prayer Scroll': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
    },
    merchants: [
      {
        name: 'Martha Greaves',
        portrait: 'martha', // public/images/npcs/<adventure>/martha.webp, shown in the room panel
        role: 'village provisioner',
        location: 'Ashveil Village Square',
        sells: [
          sell('Rations (5)', 25, 8),
          sell('Torch', 1, 12),
          sell('Tinderbox', 30, 3),
          sell('Holy Water', 100, 2),
          sell('Everwarm Elixir', 100, 1),
        ],
        buys: ['provisions', 'healing', 'documents'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Prices improve if Ashveil civilians are protected.',
      },
      {
        name: 'Vance Coalhand',
        portrait: 'vance', // public/images/npcs/<adventure>/vance.webp, shown in the room panel
        role: 'blacksmith',
        location: 'Ashveil Village Square',
        sells: [
          sell('Dagger', 20, 4),
          sell('Throwing Knife', 25, 4),
          sell('Throwing Axe', 70, 2),
          sell('Shortsword', 100, 2),
          sell('Wooden Shield', 100, 3),
          sell('Leather Armor', 300, 1),
        ],
        buys: ['weapons', 'armor', 'tools'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  saltblood_mines: {
    itemValues: {
      'Threx\'s Ledger': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Threx\'s Sealed Letter': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Flare Pouch': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Raw Redvein Ore': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Bram\'s Notebook': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
    },
    merchants: [
      {
        name: 'Mirra Fen',
        portrait: 'mirra', // public/images/npcs/<adventure>/mirra.webp, shown in the room panel
        role: 'resistance healer',
        location: 'Prisoner Barracks',
        sells: [
          sell('Bandages (5)', 5, 10),
          sell('Healing Herbs', 20, 8),
          sell('Poultice', 50, 4),
        ],
        buys: ['healing', 'alchemy'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Available once the prisoners trust the player.',
      },
      {
        name: 'Old Salk',
        portrait: 'old_salk',
        role: 'mine scavenger',
        location: 'Supply Depot',
        sells: [
          sell('Lockpicks', 200, 2),
          sell('Rope (50 ft)', 100, 3),
          sell('Torch', 1, 20),
          sell('Rations (5)', 25, 5),
          sell('Boiling Sea Charter', 100, 1),
        ],
        buys: ['tools', 'weapons', 'crafting'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  obsidian_vault: {
    itemValues: {
      'Fire Core': itemValue(7500, 'relics', 'Volatile planar fire engine; most lawful buyers require proof of safe containment.'),
      'Flame-ward Shield +2': itemValue(9500, 'magical_armor', 'Fire-core shield with strong value to delvers and smiths.'),
      'Basalt Warhammer +2': itemValue(10000, 'magical_weapons', 'Fire-core heavy weapon from the Obsidian Vault.'),
    },
    merchants: [
      {
        name: 'Hask of Basalt Ridge',
        portrait: 'hask_of_basalt_ridge',
        role: 'volcanic prospector',
        location: 'Basalt Ridge Gatehouse',
        sells: [
          sell('Waterskin', 15, 6),
          sell('Rope (50 ft)', 100, 4),
          sell('Minor Potion or Elixir', 500, 2),
          sell('Wooden Shield', 100, 2),
        ],
        buys: ['weapons', 'armor', 'relics', 'crafting'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  sunken_spire: {
    itemValues: {
      'Lost Archive Scroll': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Amulet of Tide-Taming': itemValue(3500, 'relics', 'Water relic for submerged scenes and water hazards.'),
      'Water-Breathing Elixir': itemValue(1500, 'alchemy', 'Major single-use survival elixir.'),
    },
    merchants: [
      {
        name: 'Naelia the Diver', // the same person as the story NPC in adventures.js
        portrait: 'naelia_the_diver',
        role: 'salvage diver',
        location: 'Flooded Library Entrance',
        sells: [
          sell('Water-Breathing Elixir', 1500, 2),
          sell('Rope (50 ft)', 100, 5),
          sell('Torch', 1, 8),
          sell('Rare Scroll', 1000, 1),
          sell('Siren Glass Charm', 150, 1),
        ],
        buys: ['relics', 'documents', 'alchemy', 'jewelry'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  astral_sky: {
    itemValues: {
      'Focal Static Core': itemValue(9000, 'relics', 'Dangerous astral focus; valued by scholars, artificers, and smugglers.'),
      'Sky-Stalker Composite Bow +2': itemValue(12500, 'magical_weapons', 'Precise astral bow with high value to hunters and scouts.'),
      'Starfall Bowstring +3': itemValue(17500, 'magical_weapons', 'Rare astral bow upgrade.'),
      'Astral Gravity Compass': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
    },
    merchants: [
      {
        name: 'Pell Windledger',
        portrait: 'pell_windledger',
        role: 'sky-isle trader',
        location: 'Floating Leyline Isles',
        sells: [
          sell('Hunting Bow', 300, 2),
          sell('Arrows (20)', 10, 10),
          sell('Rope (50 ft)', 100, 3),
          sell('Minor Potion or Elixir', 500, 2),
        ],
        buys: ['weapons', 'relics', 'documents', 'tools'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  clockwork_conservatory: {
    itemValues: {
      'Sun Gear Key': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Moon Gear Key': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Star Gear Key': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Aether-Wrench': itemValue(4000, 'tools', 'Masterwork arcane-mechanical tool; prized by tinkerers.'),
      'Stabilized Chrono-Core': itemValue(10000, 'relics', 'Rare time-stabilized engine; sale may attract dangerous attention.'),
      'Von Rictor\'s Ledger': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Tiny Copper Leg': itemValue(250, 'crafting', 'Crafting material or unusual salvage.'),
      'Alchemical Acid Flask': itemValue(150, 'alchemy', 'Single-use corrosive flask.'),
    },
    merchants: [
      {
        name: 'Gearwise Noma',
        portrait: 'gearwise_noma',
        role: 'clockwork tinkerer',
        location: 'The Alchemical Lab',
        sells: [
          sell('Crafting Tools', 300, 3),
          sell('Acid Flask', 150, 4),
          sell('Lockpicks', 200, 2),
          sell('Masterwork Tool Kit +1', 4000, 1),
          sell('Siren Glass Charm', 150, 1),
        ],
        buys: ['tools', 'alchemy', 'relics', 'crafting'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  frostfire_crypt: {
    itemValues: {
      'Twin Embers Pouch': itemValue(800, 'relics', 'Warmth-bearing expedition relic.'),
      'Frostfire Heart': itemValue(15000, 'relics', 'Major elemental relic; not safely sold to ordinary merchants.'),
      'Frostfire Glaive +3': itemValue(20000, 'magical_weapons', 'Major frostfire weapon.'),
      'Runic Ice-Chisel': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Theron\'s Map': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Freezing Venom Vial': itemValue(250, 'alchemy', 'Rare venom reagent.'),
      'Runic Tablet Translation': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
    },
    merchants: [
      {
        name: 'Corwin Vell',
        portrait: 'corwin_vell',
        role: 'expedition quartermaster',
        location: 'The Runic Vestibule',
        sells: [
          sell('Rations (5)', 25, 6),
          sell('Torch', 1, 16),
          sell('Holy Water', 100, 4),
          sell('Minor Potion or Elixir', 500, 2),
        ],
        buys: ['documents', 'relics', 'alchemy', 'tools'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  iron_colosseum: {
    itemValues: {
      'Arena Champion Laurel': itemValue(1200, 'jewelry', 'Prestige trophy; value rises with proof of victory.'),
      'Gladiator Net': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Ledger of Illegal Sales': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Underworks Key': itemValue(200, 'tools', 'Useful key or access token; value is mostly situational.'),
      'Champion Maul +2': itemValue(12500, 'magical_weapons', 'Reliable late-tier enchanted arena weapon.'),
    },
    merchants: [
      {
        name: 'Savax the Locker-Keeper',
        portrait: 'savax_the_locker_keeper',
        role: 'arena quartermaster',
        location: 'Training Sand',
        sells: [
          sell('Dagger', 20, 6),
          sell('Javelin', 60, 4),
          sell('Throwing Knife', 25, 4),
          sell('Darts (10)', 30, 2),
          sell('Gladiator Net', 80, 3),
          sell('Wooden Shield', 100, 4),
          sell('Bandages (5)', 5, 12),
        ],
        buys: ['weapons', 'armor', 'healing'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Slave characters may need favors or victories before coin purchases are allowed.',
      },
      {
        name: 'Mirel Voss',
        portrait: 'mirel_voss',
        role: 'noble broker',
        location: 'Noble Gallery',
        sells: [
          sell('Minor Potion or Elixir', 500, 4),
          sell('Fine Clothing', 250, 2),
        ],
        buys: ['jewelry', 'documents', 'magical_weapons', 'relics'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  blackroot_hollow: {
    itemValues: {
      'Spider-Silk Bundle': itemValue(250, 'crafting', 'Valuable textile and bowstring material.'),
      'Queen Venom Vial': itemValue(500, 'alchemy', 'Potent monster venom reagent.'),
      'Blackroot Egg Sac': itemValue(250, 'crafting', 'Crafting material or unusual salvage.'),
      'Hedda\'s Smoke Bombs': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
    },
    merchants: [
      {
        name: 'Etta Bramble',
        portrait: 'etta_bramble',
        role: 'village storekeeper',
        location: 'Blackroot Village Edge',
        sells: [
          sell('Rations (5)', 25, 10),
          sell('Torch', 1, 20),
          sell('Healing Herbs', 20, 8),
          sell('Rope (50 ft)', 100, 2),
        ],
        buys: ['provisions', 'healing', 'crafting'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
      {
        name: 'Kessa Voss',
        portrait: 'kessa_voss',
        role: 'monster hunter',
        location: 'Abandoned Mine Mouth',
        sells: [
          sell('Hedda\'s Smoke Bombs', 200, 3),
          sell('Arrows (20)', 10, 8),
          sell('Javelin', 60, 3),
          sell('Venom Vial', 200, 2),
        ],
        buys: ['alchemy', 'crafting', 'weapons'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  greywash_bandit_crown: {
    itemValues: {
      'Crown Map': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Sealed Funding Letters': itemValue(1500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Black-Crown Longbow': itemValue(6000, 'magical_weapons', 'Infamous enchanted bow; legal sale may require disclosure.'),
      'Bandit Cache Key': itemValue(200, 'tools', 'Useful key or access token; value is mostly situational.'),
    },
    merchants: [
      {
        name: 'Jory Pike',
        portrait: 'jory_pike',
        role: 'road peddler',
        location: 'Greywash Road',
        sells: [
          sell('Rations (5)', 25, 8),
          sell('Waterskin', 15, 5),
          sell('Torch', 1, 12),
          sell('Dagger', 20, 3),
          sell('Throwing Knife', 25, 3),
          sell('Darts (10)', 30, 2),
        ],
        buys: ['provisions', 'weapons', 'documents'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
      {
        name: 'Candle Nix',
        portrait: 'candle_nix',
        role: 'smuggler fence',
        location: 'Smuggler Mill Base',
        sells: [
          sell('Lockpicks', 200, 4),
          sell('Shortsword', 100, 3),
          sell('Acid Flask', 150, 3),
        ],
        buys: ['weapons', 'jewelry', 'documents', 'relics'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Deals in stolen goods and may affect morality if used knowingly.',
      },
    ],
  },
  merrin_abbey_plague_bells: {
    itemValues: {
      'Blessed Bell Clapper': itemValue(3500, 'relics', 'Divine relic that can restore full Divine SP.'),
      'Healer\'s Abbey Satchel': itemValue(500, 'healing', 'Field healer kit with abbey markings.'),
      'Names of the Dead Ledger': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Blue Fever Poultices': itemValue(50, 'healing', 'Prepared plague treatment.'),
    },
    merchants: [
      {
        name: 'Sister Elowen',
        portrait: 'sister_elowen',
        role: 'abbey infirmarian',
        location: 'Infirmary Cloister',
        sells: [
          sell('Bandages (5)', 5, 20),
          sell('Healing Herbs', 20, 10),
          sell('Poultice', 50, 8),
          sell('Holy Water', 100, 4),
        ],
        buys: ['healing', 'alchemy', 'documents'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'May discount supplies for heroic or compassionate characters.',
      },
    ],
  },
  glass_orchard_masquerade: {
    itemValues: {
      'Cracked Masquerade Mask': itemValue(300, 'treasure', 'Estimated adventuring value; adjust for local demand.'),
      'Glass Secret Fruit': itemValue(1000, 'jewelry', 'Portable treasure or prestige object.'),
      'Glass Thorn Dagger': itemValue(3000, 'magical_weapons', 'Poisoned orchard glass weapon.'),
      'Master Mask List': itemValue(1500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
    },
    merchants: [
      {
        name: 'Velvet Min',
        portrait: 'velvet_min',
        role: 'masked supplier',
        location: 'Servant Passage',
        sells: [
          sell('Dagger', 20, 4),
          sell('Fine Clothing', 250, 3),
          sell('Lockpicks', 200, 3),
          sell('Minor Potion or Elixir', 500, 2),
        ],
        buys: ['jewelry', 'documents', 'relics', 'weapons'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  drowned_market: {
    itemValues: {
      'Pearl Memory Scale': itemValue(4000, 'relics', 'Aether relic that trades memory for a reroll.'),
      'Drowned Coin': itemValue(1000, 'relics', 'Occult coin with bargaining power in ghost markets.'),
      'Evacuation Bell Contract': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Blue-Lantern Charm': itemValue(2500, 'relics', 'Protective charm with tide-magic resonance.'),
    },
    merchants: [
      {
        name: 'Mother-of-Pearl Jax',
        portrait: 'mother_of_pearl_jax',
        role: 'ghost-market broker',
        location: 'Ghost Bazaar Aisles',
        sells: [
          sell('Blue-Lantern Charm', 2500, 1),
          sell('Drowned Coin', 1000, 3),
          sell('Water-Breathing Elixir', 1500, 2),
          sell('Rare Scroll', 1000, 2),
        ],
        buys: ['relics', 'jewelry', 'documents'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Accepts coin, memories, and favors; use coin prices when the player insists on money.',
      },
    ],
  },
  thorn_treaty: {
    itemValues: {
      'Original Thorn Treaty': itemValue(1500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Living Thorn Charm': itemValue(2500, 'relics', 'Druidic protective charm.'),
      'False Boundary Map': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Warden\'s Grave Deed': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
    },
    merchants: [
      {
        name: 'Alda Reed',
        portrait: 'alda_reed',
        role: 'milltown quartermaster',
        location: 'Milltown Hall',
        sells: [
          sell('Rations (5)', 25, 8),
          sell('Healing Herbs', 20, 6),
          sell('Rope (50 ft)', 100, 3),
          sell('Wooden Shield', 100, 2),
        ],
        buys: ['provisions', 'documents', 'healing', 'tools'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  brass_plague_tinkertown: {
    itemValues: {
      'Logic Core Diagram': itemValue(7500, 'relics', 'Major story relic; marketable only to specialized or morally complicated buyers.'),
      'Masterwork Tool Kit +1': itemValue(4000, 'tools', 'Exceptional tool kit granting a check bonus.'),
      'Governor Gear': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Brass Plague Sample': itemValue(1000, 'alchemy', 'Alchemical reagent or consumable.'),
    },
    merchants: [
      {
        name: 'Nell Gearwise',
        portrait: 'nell_gearwise',
        role: 'workshop factor',
        location: 'Gearwise Workshop',
        sells: [
          sell('Crafting Tools', 300, 5),
          sell('Smithing Tools', 500, 2),
          sell('Acid Flask', 150, 5),
          sell('Masterwork Tool Kit +1', 4000, 1),
        ],
        buys: ['tools', 'crafting', 'alchemy', 'relics'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
      {
        name: 'Baker Pell',
        portrait: 'baker_pell',
        role: 'care ward supplier',
        location: 'Converted Bakery',
        sells: [
          sell('Rations (5)', 25, 10),
          sell('Bandages (5)', 5, 10),
          sell('Poultice', 50, 5),
        ],
        buys: ['provisions', 'healing'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  harvest_hill_hunger: {
    itemValues: {
      'Sacrifice Ledger': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
      'Dawnbound Sickle +3': itemValue(22000, 'magical_weapons', 'Capstone consecrated farming blade placed early enough to matter.'),
      'Root-Heart Seed': itemValue(7500, 'relics', 'Major story relic; marketable only to specialized or morally complicated buyers.'),
      'Shrine Pact Stone': itemValue(7500, 'relics', 'Major story relic; marketable only to specialized or morally complicated buyers.'),
    },
    merchants: [
      {
        name: 'Tarn Barley',
        portrait: 'tarn_barley',
        role: 'harvest peddler',
        location: 'Golden Wheat Road',
        sells: [
          sell('Rations (5)', 25, 12),
          sell('Sickle', 40, 4),
          sell('Healing Herbs', 20, 5),
          sell('Torch', 1, 16),
        ],
        buys: ['provisions', 'weapons', 'documents', 'relics'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },
  mirror_war_saint_orra: {
    itemValues: {
      'Saint Orra\'s Veil +3': itemValue(18000, 'relics', 'Aether truth relic for reflected identities.'),
      'Mirror Shard Charm': itemValue(2500, 'relics', 'Minor relic or magical focus.'),
      'Silvered Rapier +1': itemValue(6000, 'magical_weapons', 'Silvered enchanted dueling weapon.'),
      'Reflection Testimony': itemValue(500, 'documents', 'Document value depends on proof, buyer, and political leverage.'),
    },
    merchants: [
      {
        name: 'Cale of the Vestry',
        portrait: 'cale_of_the_vestry',
        role: 'chapel caretaker',
        location: 'Saint Orra Chapel',
        sells: [
          sell('Holy Water', 100, 6),
          sell('Bandages (5)', 5, 10),
          sell('Silver Ring', 200, 2),
          sell('Rare Scroll', 1000, 1),
        ],
        buys: ['documents', 'relics', 'jewelry', 'healing'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
      },
    ],
  },

  // Peoples (data/peoples.js). The goblin traders met on patrol, keyed by
  // their patrol adventure id, and the goblin village found through them.
  'patrol:goblin_traders': {
    itemValues: {},
    merchants: [
      {
        name: 'Nettle Snagtooth',
        portrait: 'gutterstone_warren/nettle_snagtooth', // a goblin woman: she/her
        role: 'goblin trader',
        location: 'The Goblin Wagon Camp',
        sells: [
          sell('Rations (5)', 20, 4),
          sell('Torch', 1, 8),
          sell('Lockpicks', 220, 2),
          sell('Rope (50 ft)', 80, 2),
          sell('Healing Herbs', 22, 3),
          sell('Throwing Knife', 22, 3),
        ],
        buys: ['provisions', 'tools', 'weapons', 'treasure', 'misc'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Trades with friends of Skritt. Loves shiny scrap and hates being cheated.',
      },
    ],
  },
  gutterstone_warren: {
    itemValues: {},
    merchants: [
      {
        name: 'Nettle Snagtooth',
        portrait: 'gutterstone_warren/nettle_snagtooth', // a goblin woman: she/her
        role: 'goblin trader',
        location: 'Gutterstone Warren',
        sells: [
          sell('Rations (5)', 20, 6),
          sell('Torch', 1, 12),
          sell('Lockpicks', 200, 3),
          sell('Rope (50 ft)', 80, 3),
          sell('Healing Herbs', 20, 4),
          sell('Throwing Knife', 22, 4),
          sell('Short Bow', 180, 1),
        ],
        buys: ['provisions', 'tools', 'weapons', 'treasure', 'misc'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'At home in the Warren her prices are kinder, and her stock is bigger.',
      },
      {
        name: 'Tinker Skabble',
        portrait: 'gutterstone_warren/tinker_skabble',
        role: 'goblin scrap-smith',
        location: 'Gutterstone Warren',
        sells: [
          sell('Dagger', 18, 3),
          sell('Wooden Shield', 90, 2),
          sell('Leather Helmet', 60, 1),
          sell('Iron Ingot', 220, 1),
        ],
        buys: ['weapons', 'armor', 'tools', 'treasure'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Turns battlefield scrap into usable gear. Will buy any metal at all.',
      },
    ],
  },
  'patrol:dwarf_caravan': {
    itemValues: {},
    merchants: [
      {
        name: 'Hulda Ashbraid',
        portrait: 'emberdeep_hold/hulda_ashbraid', // a dwarf woman: she/her
        role: 'dwarf caravan master',
        location: 'The Caravan Halt',
        sells: [
          sell('Iron Ingot', 220, 2),
          sell('Steel Chainmail', 1250, 1),
          sell('Iron Shield', 320, 1),
          sell('Warhammer', 520, 1),
          sell('Rations (5)', 25, 4),
          sell('Torch', 1, 8),
        ],
        buys: ['weapons', 'armor', 'tools', 'jewelry', 'treasure'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Trades only with those the clans respect. Pays well for good metal and gems.',
      },
    ],
  },
  emberdeep_hold: {
    itemValues: {},
    merchants: [
      {
        name: 'Hulda Ashbraid',
        portrait: 'emberdeep_hold/hulda_ashbraid', // a dwarf woman: she/her
        role: 'dwarf caravan master',
        location: 'Emberdeep Hold',
        sells: [
          sell('Iron Ingot', 200, 3),
          sell('Steel Chainmail', 1200, 1),
          sell('Iron Shield', 300, 2),
          sell('Warhammer', 500, 1),
          sell('Battle Axe', 550, 1),
          sell('Rations (5)', 25, 6),
        ],
        buys: ['weapons', 'armor', 'tools', 'jewelry', 'treasure'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'At home in the Hold her stock is deeper and her prices kinder.',
      },
      {
        name: 'Runesmith Orrin Deepvein',
        portrait: 'emberdeep_hold/orrin_deepvein',
        role: 'young dwarf runesmith',
        location: 'Emberdeep Hold',
        sells: [
          sell('Plate Helm', 300, 1),
          sell('Plate Gauntlets', 250, 1),
          sell('Plate Greaves', 350, 1),
          sell('Steel Sabatons', 250, 1),
          sell('Longsword', 200, 1),
        ],
        buys: ['weapons', 'armor', 'relics', 'tools'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Forges plate pieces in the old way. Will buy any relic with runes on it.',
      },
    ],
  },
  'patrol:elf_wayfarers': {
    itemValues: {},
    merchants: [
      {
        name: 'Ithiel Moonwake',
        portrait: 'silverlight_refuge/ithiel_moonwake', // a living elf woman: she/her
        role: 'living elf scholar',
        location: 'The Lantern Causeway',
        sells: [
          sell('Common Scroll', 320, 2),
          sell('Rations (5)', 25, 3),
          sell('Healing Herbs', 22, 3),
          sell('Holy Water', 110, 1),
        ],
        buys: ['lore', 'documents', 'relics', 'healing', 'jewelry'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Trades scrolls and old knowledge with those who honour the elven dead.',
      },
    ],
  },
  silverlight_refuge: {
    itemValues: {},
    merchants: [
      {
        name: 'Ithiel Moonwake',
        portrait: 'silverlight_refuge/ithiel_moonwake', // a living elf woman: she/her
        role: 'living elf scholar',
        location: 'Silverlight Refuge',
        sells: [
          sell('Common Scroll', 300, 3),
          sell('Rare Scroll', 1000, 1),
          sell('Rations (5)', 25, 4),
          sell('Healing Herbs', 20, 4),
          sell('Holy Water', 100, 2),
        ],
        buys: ['lore', 'documents', 'relics', 'healing', 'jewelry'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'At home in the Refuge she keeps her rarest scrolls.',
      },
      {
        name: 'Lorekeeper Aerandir',
        portrait: 'silverlight_refuge/lorekeeper_aerandir', // an elven ghost: he/him
        role: 'elven ghost archivist',
        location: 'Silverlight Refuge',
        sells: [
          sell('Common Scroll', 300, 2),
          sell('Rare Scroll', 950, 2),
          sell('Minor Potion or Elixir', 500, 1),
        ],
        buys: ['lore', 'documents', 'relics'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'A ghost who still keeps the catalogue. Pays well for any page saved from the Sunken Spire.',
      },
    ],
  },
  'patrol:tidefolk_traders': {
    itemValues: {},
    merchants: [
      {
        name: 'Coral Venn',
        portrait: 'pearlgate_grotto/coral_venn', // a young tide-folk man: he/him
        role: 'tide-folk salvager',
        location: 'The Reef Landing',
        sells: [
          sell('Rope (50 ft)', 90, 2),
          sell('Waterskin', 15, 4),
          sell('Rations (5)', 25, 4),
          sell('Spear', 100, 1),
          sell('Silver Ring', 220, 1),
        ],
        buys: ['treasure', 'jewelry', 'tools', 'weapons', 'misc'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Salvage from the deep, fairly priced for fair dealers.',
      },
    ],
  },
  pearlgate_grotto: {
    itemValues: {},
    merchants: [
      {
        name: 'Coral Venn',
        portrait: 'pearlgate_grotto/coral_venn', // a young tide-folk man: he/him
        role: 'tide-folk salvager',
        location: 'Pearlgate Grotto',
        sells: [
          sell('Rope (50 ft)', 90, 3),
          sell('Waterskin', 15, 6),
          sell('Rations (5)', 22, 6),
          sell('Spear', 95, 2),
          sell('Javelin', 55, 4),
          sell('Silver Ring', 200, 2),
        ],
        buys: ['treasure', 'jewelry', 'tools', 'weapons', 'misc'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'His family stall in the Grotto has more than his boat ever could.',
      },
      {
        name: 'Shellwright Amarra',
        portrait: 'pearlgate_grotto/shellwright_amarra', // an elderly tide-folk woman: she/her
        role: 'old tide-folk armourer',
        location: 'Pearlgate Grotto',
        sells: [
          sell('Leather Armor', 300, 1),
          sell('Spear', 100, 2),
          sell('Javelin', 60, 4),
          sell('Bandages (5)', 5, 6),
          sell('Poultice', 50, 2),
        ],
        buys: ['armor', 'weapons', 'treasure', 'healing'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Makes shell-scale armour and harpoons. Buys pearls and anything from a wreck.',
      },
    ],
  },
  'patrol:skyfolk_skiff_traders': {
    itemValues: {},
    merchants: [
      {
        name: 'Talon Ashwing',
        portrait: 'hightether_aerie/talon_ashwing', // a sky-folk man: he/him
        role: 'sky-folk skiff trader',
        location: 'The Mooring Post',
        sells: [
          sell('Arrows (20)', 10, 4),
          sell('Short Bow', 260, 1),
          sell('Rope (50 ft)', 95, 2),
          sell('Rations (5)', 25, 3),
          sell('Leather Gloves', 40, 1),
        ],
        buys: ['weapons', 'tools', 'treasure', 'jewelry', 'misc'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Trades with friends of the sky. Pays well for anything that floats.',
      },
    ],
  },
  hightether_aerie: {
    itemValues: {},
    merchants: [
      {
        name: 'Talon Ashwing',
        portrait: 'hightether_aerie/talon_ashwing', // a sky-folk man: he/him
        role: 'sky-folk skiff trader',
        location: 'Hightether Aerie',
        sells: [
          sell('Arrows (20)', 9, 6),
          sell('Short Bow', 240, 2),
          sell('Rope (50 ft)', 90, 3),
          sell('Rations (5)', 24, 5),
          sell('Leather Gloves', 38, 2),
          sell('Leather Boots', 48, 2),
        ],
        buys: ['weapons', 'tools', 'treasure', 'jewelry', 'misc'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'At home his prices are kinder and his stall is fuller.',
      },
      {
        name: 'Bowyer Kree Windhollow',
        portrait: 'hightether_aerie/kree_windhollow', // an elderly sky-folk woman: she/her
        role: 'old sky-folk bowyer',
        location: 'Hightether Aerie',
        sells: [
          sell('Longbow', 400, 1),
          sell('Hunting Bow', 300, 1),
          sell('Short Bow', 250, 2),
          sell('Arrows (20)', 10, 8),
          sell('Javelin', 60, 4),
        ],
        buys: ['weapons', 'tools', 'materials'],
        buyRate: 0.5,
        negotiationMaxAdjustment: 0.25,
        notes: 'Has made bows for sixty years. Says she can tell an archer by their handshake.',
      },
    ],
  },
};
