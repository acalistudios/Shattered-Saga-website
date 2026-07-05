// Downtown trade hubs, taverns, and merchants database for completed adventures.
import { GENERIC_ITEM_VALUE_BY_NAME } from './economy';

export const TAVERNS = {
  elemental_crucible: {
    name: "Fivefold Shrine Sanctuary",
    keeper: "Ilyra of the Fivefold Font",
    location: "Fivefold Gate",
    mealName: "Font Communion & Consecrated Nectar",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The Mirror of Affinity reflects the elemental balance of your soul, not your strength.",
      "The Guardians of Earth and Fire have argued since the high font cracked.",
      "Aether threads vibrate when planar static approaches from the capital."
    ]
  },
  ashveil_keep: {
    name: "Dermot's Hearthstone Inn",
    keeper: "Dermot Greaves",
    location: "Ashveil Village Square",
    mealName: "Hearty Mutton Stew & Crusty Bread",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "Vance the blacksmith is worried about the quality of coal coming from the south.",
      "Martha says the children used to talk about a hidden trapdoor in the old chapel graveyard.",
      "The Voss family line hasn't been heard of in the capital for over a century."
    ]
  },
  saltblood_mines: {
    name: "The Rusty Shackle Mess",
    keeper: "Krag",
    location: "Prisoner Barracks",
    mealName: "Salted Moss Gruel & Weak Ale",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The guards take twice as long to rotate during the midnight shift change.",
      "Threx keeps all his gold ledgers in an ironbox hidden beneath his office floorboards.",
      "Prisoners talk of a redvein ore vein that glows when there is elemental magic nearby."
    ]
  },
  clockwork_conservatory: {
    name: "The Steam & Spindle Tavern",
    keeper: "Vian",
    location: "Steam-Weaving Gallery",
    mealName: "Steam-Cooked Sausages & Potato Mash",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The Baron's automated servants are wound using brass keys that are coded by serial numbers.",
      "There is a locked chrono-vault beneath the steam gallery that ticks at different rates.",
      "A rogue guardian Unit-7 was spotted wandering the botanical gardens at twilight."
    ]
  },
  obsidian_vault: {
    name: "The Basalt Tankard Tavern",
    keeper: "Brak",
    location: "Basalt Ridge Gatehouse",
    mealName: "Spiced Lava-Ridge Roasted Tubers",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The molten lava tubes are unstable. Avoid wearing heavy iron armor if you fall in.",
      "The ancient altar of embers has a slot shaped like a burning heart.",
      "Smugglers carry fire-resistant cloaks to bypass the sulfuric vents."
    ]
  },
  sunken_spire: {
    name: "Archivist's Sanctuary",
    keeper: "Faelar",
    location: "Flooded Library Entrance",
    mealName: "Submerged Elven Rations & Kelp Tea",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The elven library towers were submerged during the planar convergence.",
      "Some scroll cases are sealed with water-resistant wax to protect the scrolls.",
      "A tidal siphon junction controls the water levels in the lower archives."
    ]
  },
  astral_sky: {
    name: "The Windrunner's Rest Stop",
    keeper: "Sora",
    location: "Windrunner Sky-Bridges",
    mealName: "Airdraft Nectar & Sweet-Grain Wafers",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "Strong wind gusts can carry lightweight travelers off the sky-bridges.",
      "The focal altar is connected to leyline channels floating in the clouds.",
      "Gravity anomalies are more frequent near the clockwork conservatory."
    ]
  },
  iron_colosseum: {
    name: "The Gladiator's Quarters",
    keeper: "Garr",
    location: "Slave Pens",
    mealName: "Gladiator Slop & Barley Tea",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The champion dias is guarded by elite soldiers loyal to the Colosseum Master.",
      "You can bypass the training sand guards by climbing the beast gates.",
      "Merchants in the noble gallery buy items at twice their standard value."
    ]
  },
  blackroot_hollow: {
    name: "The Silk Weaver's Hearth Inn",
    keeper: "Huld",
    location: "Blackroot Village Edge",
    mealName: "Roasted Cave Mushroom & Onion Soup",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "Miners refuse to enter the lower molt rift due to spider skittering noises.",
      "Webbed roots can be dissolved using alchemical acid or burned away.",
      "The egg nursery is guarded by a massive brood mother spider."
    ]
  },
  greywash_bandit_crown: {
    name: "The Smuggler's Cask Inn",
    keeper: "Dermot",
    location: "Smuggler Mill Base",
    mealName: "Forest Venison Jerky & Honey Mead",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The bandit crown is secretly funded by a wealthy grain merchant.",
      "Deserter camps hold stolen military shields and iron chainmail.",
      "The smuggler base uses the old mill waterwheel to power a hidden lift."
    ]
  },
  merrin_abbey_plague_bells: {
    name: "The Chained Bell Tavern",
    keeper: "Eamon",
    location: "Sickfield Hamlet",
    mealName: "Thin Onion Broth & Stale Rye Bread",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The plague bells only ring when the abbey gates are locked from inside.",
      "The infirmary cloister contains botanical records of healing herbs.",
      "The Abbot was last seen carrying a golden signet ring into the tower."
    ]
  },
  glass_orchard_masquerade: {
    name: "The Crystal Goblet Lounge",
    keeper: "Lord Julian",
    location: "Glass Orchard Ballroom",
    mealName: "Spiced Masquerade Wine & Sweet Fruit Skewers",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "An assassination plot is planned for the fountain toast at midnight.",
      "The mirrors in the hedge maze are arranged to reflect invisible light.",
      "Glass orchard trees grow crystal fruit that can be used for alchemy."
    ]
  },
  drowned_market: {
    name: "The Drowned Sailor's Ethereal Tap",
    keeper: "Ghostly Bill",
    location: "Ghost Bazaar Aisles",
    mealName: "Tidal Eel Stew & Ghostly Ale",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The market dead trade in memories, names, and old historical records.",
      "Ghost bazaar merchants only accept copper and silver coins.",
      "The council vault drowned when the sea walls were intentionally broken."
    ]
  },
  thorn_treaty: {
    name: "The Boundary Stone Inn",
    keeper: "Fletcher",
    location: "Boundary Stone Field",
    mealName: "Spit-Roasted Pheasant & Hard Cider",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The boundary stones are inscribed with protective sigils that repel roots.",
      "Villagers plan to raid the orchard graves for weapons.",
      "The oath stone circle glows during the solstice."
    ]
  },
  brass_plague_tinkertown: {
    name: "The Gearwise Taproom",
    keeper: "Gizmo",
    location: "Ticking Market Street",
    mealName: "Lubricated Mushroom Stew & Barley Tea",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The clockwork servants believe biological flesh is inefficient.",
      "Tinkertown workshops sell smithing tools and spare clockwork parts.",
      "The logic foundry core is protected by an automated password system."
    ]
  },
  harvest_hill_hunger: {
    name: "The Feast Hall Hearth",
    keeper: "Elder Thomas",
    location: "Choosing Feast Hall",
    mealName: "Thick Cornbread & Sweet Squash Mash",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "The village crops grow three times faster than normal due to a hidden pact.",
      "The hill shrine cellar leads to root chambers beneath the hill.",
      "Elder Thomas hides a silver signet ring in his grain sacks."
    ]
  },
  mirror_war_saint_orra: {
    name: "The Chapel Hospice",
    keeper: "Sister Clara",
    location: "Saint Orra Chapel",
    mealName: "Blessed Wheat Loaf & Spring Water",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "Reflected double villagers have a slight silver tint in their eyes.",
      "The chapel mirror requires holy water to cleanse its reflections.",
      "Some doubles are kinder and more helpful than the originals."
    ]
  },
  frostfire_crypt: {
    name: "Frostfire Altar Rest",
    keeper: "Crypt-keeper Silas",
    location: "Frostfire Crypt Vault",
    mealName: "Ember-Baked Tubers & Melted Ice-Water",
    mealPriceCp: 10,
    mealFatigueReduce: 2,
    rumorPriceCp: 50,
    rumors: [
      "Silas was once a royal scribe before the frost froze the crypt gates.",
      "Frostfire weapons require both coal and frost shards to retain their properties.",
      "The royal tomb is sealed with a combination key matching the Voss coat of arms."
    ]
  }
};

export const MERCHANT_POOLS = {
  blacksmith: [
    { item: "Dagger", baseChance: 0.9, maxStock: 3 },
    { item: "Shortsword", baseChance: 0.8, maxStock: 2 },
    { item: "Longsword", baseChance: 0.7, maxStock: 1 },
    { item: "Greatsword", baseChance: 0.4, maxStock: 1 },
    { item: "Warhammer", baseChance: 0.5, maxStock: 1 },
    { item: "Wooden Shield", baseChance: 0.8, maxStock: 2 },
    { item: "Leather Armor", baseChance: 0.6, maxStock: 1 },
    { item: "Steel Chainmail", baseChance: 0.3, maxStock: 1 },
    { item: "Plate Helm", baseChance: 0.4, maxStock: 1 },
    { item: "Plate Gauntlets", baseChance: 0.4, maxStock: 1 }
  ],
  provisioner: [
    { item: "Rations (5)", baseChance: 1.0, maxStock: 6 },
    { item: "Torch", baseChance: 1.0, maxStock: 10 },
    { item: "Tinderbox", baseChance: 0.9, maxStock: 3 },
    { item: "Waterskin", baseChance: 0.9, maxStock: 4 },
    { item: "Bedroll", baseChance: 0.8, maxStock: 2 },
    { item: "Rope (50 ft)", baseChance: 0.7, maxStock: 2 },
    { item: "Small Backpack", baseChance: 0.6, maxStock: 1 },
    { item: "Medium Backpack", baseChance: 0.4, maxStock: 1 }
  ],
  fletcher: [
    { item: "Hunting Bow", baseChance: 0.8, maxStock: 2 },
    { item: "Crossbow", baseChance: 0.5, maxStock: 1 },
    { item: "Arrows (20)", baseChance: 0.95, maxStock: 5 },
    { item: "Crossbow Bolts (20)", baseChance: 0.95, maxStock: 5 },
    { item: "Leather Armor", baseChance: 0.6, maxStock: 2 }
  ],
  apothecary: [
    { item: "Bandages (5)", baseChance: 0.95, maxStock: 4 },
    { item: "Healing Herbs", baseChance: 0.8, maxStock: 4 },
    { item: "Poultice", baseChance: 0.7, maxStock: 2 },
    { item: "Holy Water", baseChance: 0.5, maxStock: 2 },
    { item: "Acid Flask", baseChance: 0.4, maxStock: 2 },
    { item: "Minor Potion or Elixir", baseChance: 0.3, maxStock: 1 }
  ],
  lore_keeper: [
    { item: "Common Scroll", baseChance: 0.7, maxStock: 3 },
    { item: "Rare Scroll", baseChance: 0.3, maxStock: 1 }
  ],
  jeweler: [
    { item: "Silver Ring", baseChance: 0.8, maxStock: 2 },
    { item: "Gold Ring", baseChance: 0.4, maxStock: 1 },
    { item: "Signet Ring", baseChance: 0.2, maxStock: 1 }
  ]
};

export const EXCLUSIVE_STOCK = {
  "Vance Coalhand": [
    { item: "Plate Helm", priceCp: 300, reqRelationship: 50, stock: 1 },
    { item: "Steel Chainmail", priceCp: 1200, reqRelationship: 80, stock: 1 }
  ],
  "Mirra Fen": [
    { item: "Healing Herbs", priceCp: 50, reqRelationship: 50, stock: 3 },
    { item: "Poultice", priceCp: 80, reqRelationship: 70, stock: 1 }
  ],
  "Bram": [
    { item: "Rope (50 ft)", priceCp: 80, reqRelationship: 50, stock: 2 },
    { item: "Medium Backpack", priceCp: 100, reqRelationship: 80, stock: 1 }
  ],
  "Cogsmith Kael": [
    { item: "Tinderbox", priceCp: 25, reqRelationship: 50, stock: 2 },
    { item: "Brass Gears", priceCp: 150, reqRelationship: 75, stock: 1 }
  ],
  "Dennis": [
    { item: "Acid Flask", priceCp: 100, reqRelationship: 60, stock: 2 },
    { item: "Minor Potion or Elixir", priceCp: 250, reqRelationship: 80, stock: 1 }
  ],
  "Silas": [
    { item: "Common Scroll", priceCp: 150, reqRelationship: 50, stock: 2 },
    { item: "Rare Scroll", priceCp: 400, reqRelationship: 80, stock: 1 }
  ],
  "Frost-Weaver Karen": [
    { item: "Shortsword", priceCp: 90, reqRelationship: 50, stock: 2 },
    { item: "Wooden Shield", priceCp: 85, reqRelationship: 70, stock: 1 }
  ],
  "Captain Harek": [
    { item: "Longsword", priceCp: 250, reqRelationship: 50, stock: 1 },
    { item: "Steel Chainmail", priceCp: 1100, reqRelationship: 80, stock: 1 }
  ],
  "Master Kaelen": [
    { item: "Fire-Resistant Cloak", priceCp: 500, reqRelationship: 60, stock: 1 },
    { item: "Ember Oil", priceCp: 150, reqRelationship: 80, stock: 2 }
  ],
  "Arena Quartermaster": [
    { item: "Warhammer", priceCp: 450, reqRelationship: 50, stock: 1 },
    { item: "Greatsword", priceCp: 450, reqRelationship: 75, stock: 1 }
  ],
  "Slave-master Horg": [
    { item: "Rope (50 ft)", priceCp: 90, reqRelationship: 50, stock: 2 }
  ],
  "Spidery Weaver": [
    { item: "Small Backpack", priceCp: 45, reqRelationship: 50, stock: 2 },
    { item: "Medium Backpack", priceCp: 90, reqRelationship: 75, stock: 1 }
  ],
  "Hermit Healer": [
    { item: "Healing Herbs", priceCp: 45, reqRelationship: 50, stock: 3 },
    { item: "Poultice", priceCp: 70, reqRelationship: 70, stock: 2 }
  ],
  "Smuggler Pete": [
    { item: "Lockpicks", priceCp: 80, reqRelationship: 50, stock: 3 },
    { item: "Poison Vial", priceCp: 120, reqRelationship: 70, stock: 2 }
  ],
  "Warden Elenya": [
    { item: "Hunting Bow", priceCp: 260, reqRelationship: 60, stock: 1 },
    { item: "Arrows (20)", priceCp: 8, reqRelationship: 50, stock: 3 }
  ],
  "Father Thomas": [
    { item: "Holy Water", priceCp: 100, reqRelationship: 50, stock: 2 },
    { item: "Bandages (5)", priceCp: 25, reqRelationship: 70, stock: 2 }
  ],
  "Ned": [
    { item: "Torch", priceCp: 1, reqRelationship: 40, stock: 5 }
  ],
  "Lord Julian": [
    { item: "Silver Ring", priceCp: 120, reqRelationship: 50, stock: 2 },
    { item: "Gold Ring", priceCp: 350, reqRelationship: 75, stock: 1 }
  ],
  "Madame Sophie": [
    { item: "Silk Robes", priceCp: 200, reqRelationship: 60, stock: 1 }
  ],
  "Forester Jack": [
    { item: "Wooden Shield", priceCp: 80, reqRelationship: 50, stock: 2 },
    { item: "Rope (50 ft)", priceCp: 85, reqRelationship: 70, stock: 1 }
  ],
  "Gethin": [
    { item: "Healing Herbs", priceCp: 40, reqRelationship: 50, stock: 4 },
    { item: "Acid Flask", priceCp: 90, reqRelationship: 80, stock: 2 }
  ],
  "Faelar": [
    { item: "Common Scroll", priceCp: 140, reqRelationship: 55, stock: 2 }
  ],
  "Drowned Custodian": [
    { item: "Tinderbox", priceCp: 30, reqRelationship: 50, stock: 2 }
  ],
  "Spectral Merchant": [
    { item: "Relic Amulet", priceCp: 600, reqRelationship: 75, stock: 1 }
  ],
  "Sunken Merchant": [
    { item: "Waterskin", priceCp: 12, reqRelationship: 40, stock: 2 }
  ],
  "Scrap-King Barnaby": [
    { item: "Brass Gears", priceCp: 130, reqRelationship: 60, stock: 2 },
    { item: "Lockpicks", priceCp: 90, reqRelationship: 55, stock: 3 }
  ],
  "Clockwork Doctor": [
    { item: "Minor Potion or Elixir", priceCp: 220, reqRelationship: 70, stock: 2 },
    { item: "Bandages (5)", priceCp: 20, reqRelationship: 50, stock: 3 }
  ],
  "Thomas": [
    { item: "Rations (5)", priceCp: 22, reqRelationship: 50, stock: 4 }
  ],
  "Earth Shaman": [
    { item: "Healing Herbs", priceCp: 45, reqRelationship: 50, stock: 3 }
  ],
  "Sister Clara": [
    { item: "Holy Water", priceCp: 80, reqRelationship: 60, stock: 2 },
    { item: "Bandages (5)", priceCp: 18, reqRelationship: 50, stock: 4 }
  ],
  "Mirrored Merchant": [
    { item: "Mirror Shard", priceCp: 300, reqRelationship: 70, stock: 1 }
  ]
};

export const TRAINING_EXPERTS = {
  "Vance Coalhand": ["smithing", "heavy_weapons"],
  "Martha Greaves": ["negotiation"],
  "Mirra Fen": ["healing", "herbalism"],
  "Bram": ["appraise", "crafting"],
  "Cogsmith Kael": ["trapping", "smithing"],
  "Dennis": ["alchemy"],
  "Silas": ["languages", "perception"],
  "Frost-Weaver Karen": ["light_weapons", "blocking"],
  "Captain Harek": ["blocking", "heavy_weapons"],
  "Master Kaelen": ["alchemy", "arcane_shaping"],
  "Arena Quartermaster": ["athletics", "brawling"],
  "Slave-master Horg": ["intimidation"],
  "Spidery Weaver": ["crafting", "stealth"],
  "Hermit Healer": ["herbalism", "healing"],
  "Smuggler Pete": ["thievery", "lockpicking"],
  "Warden Elenya": ["marksmanship", "survival"],
  "Father Thomas": ["divine_communion", "divine_manifestation"],
  "Ned": ["survival", "athletics"],
  "Lord Julian": ["appraise", "deception"],
  "Madame Sophie": ["crafting", "deception"],
  "Forester Jack": ["survival", "athletics"],
  "Gethin": ["herbalism", "alchemy"],
  "Faelar": ["languages", "arcane_drawing"],
  "Drowned Custodian": ["appraise"],
  "Spectral Merchant": ["luck"],
  "Sunken Merchant": ["survival"],
  "Scrap-King Barnaby": ["lockpicking", "trapping"],
  "Clockwork Doctor": ["healing", "alchemy"],
  "Thomas": ["negotiation"],
  "Earth Shaman": ["animal_rapport", "herbalism"],
  "Sister Clara": ["divine_communion", "healing"],
  "Mirrored Merchant": ["luck"]
};

export const ADVENTURE_TRAINING_SLOTS = {
  elemental_crucible: 1,
  blackroot_hollow: 1,
  harvest_hill_hunger: 1,
  mirror_war_saint_orra: 1,
  obsidian_vault: 1,
  
  ashveil_keep: 2,
  saltblood_mines: 2,
  clockwork_conservatory: 2,
  sunken_spire: 2,
  astral_sky: 2,
  greywash_bandit_crown: 2,
  merrin_abbey_plague_bells: 2,
  glass_orchard_masquerade: 2,
  drowned_market: 2,
  thorn_treaty: 2,
  
  frostfire_crypt: 3,
  iron_colosseum: 3,
  brass_plague_tinkertown: 3
};

export function getMerchantType(merchant) {
  if (merchant.isTavern) return 'tavern';
  
  const roleLower = (merchant.role || '').toLowerCase();
  if (roleLower.includes('blacksmith') || roleLower.includes('armorer') || roleLower.includes('weaponsmith') || roleLower.includes('forge') || roleLower.includes('smith')) {
    return 'blacksmith';
  }
  if (roleLower.includes('provisioner') || roleLower.includes('general') || roleLower.includes('scavenger') || roleLower.includes('merchant') || roleLower.includes('trader')) {
    if (roleLower.includes('jeweler') || roleLower.includes('gem') || roleLower.includes('appraiser')) {
      return 'jeweler';
    }
    if (roleLower.includes('fletcher') || roleLower.includes('bowyer')) {
      return 'fletcher';
    }
    if (roleLower.includes('smuggler') || roleLower.includes('fence')) {
      return 'fence';
    }
    return 'provisioner';
  }
  if (roleLower.includes('healer') || roleLower.includes('apothecary') || roleLower.includes('shaman') || roleLower.includes('doctor') || roleLower.includes('alchemist')) {
    return 'apothecary';
  }
  if (roleLower.includes('archivist') || roleLower.includes('scribe') || roleLower.includes('keeper') || roleLower.includes('librarian')) {
    return 'lore_keeper';
  }
  
  const buys = merchant.buys || [];
  if (buys.includes('weapons') || buys.includes('armor')) return 'blacksmith';
  if (buys.includes('healing') || buys.includes('alchemy')) return 'apothecary';
  if (buys.includes('lore') || buys.includes('documents')) return 'lore_keeper';
  if (buys.includes('jewelry') || buys.includes('gems')) return 'jeweler';
  
  return 'provisioner';
}

export function generateMerchantStock(merchant, relation = 0) {
  const type = getMerchantType(merchant);
  const pool = MERCHANT_POOLS[type];
  if (!pool) return [];
  
  const stock = [];
  const relationBoost = Math.max(-0.2, Math.min(0.1, relation * 0.001));

  pool.forEach(entry => {
    const chance = entry.baseChance + relationBoost;
    if (Math.random() <= chance) {
      const qty = Math.floor(Math.random() * entry.maxStock) + 1;
      const itemInfo = GENERIC_ITEM_VALUE_BY_NAME[entry.item] || { valueCp: 100 };
      stock.push({
        item: entry.item,
        priceCp: itemInfo.valueCp,
        stock: qty
      });
    }
  });

  return stock;
}
