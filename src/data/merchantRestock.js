// Shopkeepers get new stock as the player completes adventures (Hans, 2026-11-14).
//
// Each tier unlocks once the player has completed `after` adventures in total
// (character.completed_adventures). Prices are the catalogue list prices in
// data/economy.js; only catalogued, mundane or consumable goods are sold here:
// enchanted gear stays a reward of the adventures themselves.
//
// Keyed by merchant name (data/adventureEconomy.js). [item, priceCp, stock].
export const RESTOCK_TIERS = [2, 4, 6];

export const MERCHANT_RESTOCK = {
  'Vance Coalhand': [
    { after: 2, sells: [['Longsword', 200, 1], ['Plate Helm', 300, 1], ['Hatchet', 50, 2], ['Mace', 150, 1], ['Spear', 100, 1], ['Leather Boots', 50, 1], ['Leather Gloves', 40, 1]] },
    { after: 4, sells: [['Plate Gauntlets', 250, 1], ['Warhammer', 500, 1], ['Steel Chainmail', 1200, 1], ['Battle Axe', 550, 1], ['Flail', 200, 1], ['Plate Greaves', 350, 1]] },
    { after: 6, sells: [['Greatsword', 500, 1], ['Smithing Tools', 500, 1], ['Halberd', 550, 1], ['Steel Sabatons', 250, 1]] },
  ],
  'Martha Greaves': [
    { after: 2, sells: [['Waterskin', 15, 4], ['Bedroll', 20, 2], ['Healing Herbs', 20, 4]] },
    { after: 4, sells: [['Medium Backpack', 100, 1], ['Poultice', 50, 3]] },
    { after: 6, sells: [['Large Backpack', 200, 1], ["Healer's Satchel", 500, 1]] },
  ],
  'Ilyra of the Fivefold Font': [
    { after: 4, sells: [['Common Scroll', 300, 2]] },
    { after: 6, sells: [['Major Potion or Elixir', 1500, 1], ['Rare Scroll', 1000, 1]] },
  ],
  'Mirra Fen': [
    { after: 2, sells: [['Holy Water', 100, 2]] },
    { after: 4, sells: [["Healer's Satchel", 500, 1], ['Minor Potion or Elixir', 500, 1]] },
  ],
  'Old Salk': [
    { after: 2, sells: [['Hatchet', 50, 2], ['Crafting Tools', 300, 1]] },
    { after: 4, sells: [['Medium Backpack', 100, 1], ['Smithing Tools', 500, 1]] },
  ],
  'Hask of Basalt Ridge': [
    { after: 2, sells: [['Warhammer', 500, 1], ['Leather Armor', 300, 1], ['Throwing Axe', 70, 2]] },
    { after: 4, sells: [['Steel Chainmail', 1200, 1], ['Plate Helm', 300, 1]] },
    { after: 6, sells: [['Major Potion or Elixir', 1500, 1]] },
  ],
  'Neris Tidehand': [
    { after: 4, sells: [['Silver Ring', 200, 2], ['Common Scroll', 300, 1]] },
    { after: 6, sells: [['Gold Ring', 1000, 1]] },
  ],
  'Pell Windledger': [
    { after: 2, sells: [['Crossbow', 600, 1], ['Crossbow Bolts (20)', 15, 4]] },
    { after: 4, sells: [['Medium Backpack', 100, 1], ['Major Potion or Elixir', 1500, 1]] },
  ],
  'Gearwise Noma': [
    { after: 4, sells: [['Smithing Tools', 500, 1], ['Crossbow', 600, 1]] },
  ],
  'Theron Vell': [
    { after: 2, sells: [['Bedroll', 20, 2], ['Rope (50 ft)', 100, 2], ['Javelin', 60, 3]] },
    { after: 4, sells: [['Large Backpack', 200, 1], ['Steel Chainmail', 1200, 1]] },
    { after: 6, sells: [['Major Potion or Elixir', 1500, 1]] },
  ],
  'Savax the Locker-Keeper': [
    { after: 2, sells: [['Shortsword', 100, 2], ['Leather Armor', 300, 1], ['Rapier', 150, 1], ['Leather Helmet', 60, 1], ['Leather Pants', 80, 1], ['Throwing Axe', 70, 2]] },
    { after: 4, sells: [['Longsword', 200, 1], ['Plate Helm', 300, 1], ['Plate Gauntlets', 250, 1]] },
    { after: 6, sells: [['Greatsword', 500, 1], ['Steel Chainmail', 1200, 1]] },
  ],
  'Mirel Voss': [
    { after: 4, sells: [['Gold Ring', 1000, 1], ['Signet Ring', 1500, 1]] },
  ],
  'Etta Bramble': [
    { after: 2, sells: [['Waterskin', 15, 3], ['Bandages (5)', 5, 4]] },
    { after: 4, sells: [['Medium Backpack', 100, 1], ['Poultice', 50, 2]] },
  ],
  'Mara Voss': [
    { after: 2, sells: [['Hunting Bow', 300, 1], ['Hatchet', 50, 1], ['Short Bow', 250, 1], ['Longbow', 400, 1]] },
    { after: 4, sells: [['Crossbow', 600, 1], ['Crossbow Bolts (20)', 15, 3]] },
  ],
  'Jory Pike': [
    { after: 2, sells: [['Bedroll', 20, 2], ['Hatchet', 50, 1]] },
    { after: 4, sells: [['Small Backpack', 50, 1], ['Arrows (20)', 10, 3]] },
  ],
  'Candle Nix': [
    { after: 2, sells: [['Venom Vial', 200, 1], ['Silver Ring', 200, 1], ['Throwing Knife', 25, 4]] },
    { after: 4, sells: [['Longsword', 200, 1], ['Crossbow', 600, 1]] },
  ],
  'Sister Elowen': [
    { after: 2, sells: [["Healer's Satchel", 500, 1]] },
    { after: 4, sells: [['Minor Potion or Elixir', 500, 1]] },
  ],
  'Velvet Min': [
    { after: 4, sells: [['Venom Vial', 200, 1], ['Silver Ring', 200, 1], ['Throwing Knife', 25, 3]] },
  ],
  'Mother-of-Pearl Jax': [
    { after: 6, sells: [['Major Potion or Elixir', 1500, 1]] },
  ],
  'Alda Reed': [
    { after: 2, sells: [['Leather Armor', 300, 1], ['Hatchet', 50, 2], ['Throwing Axe', 70, 2], ['Javelin', 60, 2]] },
    { after: 4, sells: [['Shortsword', 100, 2], ['Plate Helm', 300, 1]] },
  ],
  'Nell Gearwise': [
    { after: 4, sells: [['Crossbow', 600, 1], ['Crossbow Bolts (20)', 15, 4]] },
  ],
  'Baker Pell': [
    { after: 2, sells: [['Healing Herbs', 20, 4], ['Waterskin', 15, 3]] },
  ],
  'Tarn Barley': [
    { after: 2, sells: [['Bedroll', 20, 2], ['Waterskin', 15, 3]] },
    { after: 4, sells: [['Hatchet', 50, 1], ['Medium Backpack', 100, 1]] },
  ],
  'Cale of the Vestry': [
    { after: 4, sells: [['Common Scroll', 300, 1], ['Minor Potion or Elixir', 500, 1]] },
  ],
};

/** Number of distinct adventures the character has completed. */
export const completedCount = (character) => new Set(character?.completed_adventures || []).size;
