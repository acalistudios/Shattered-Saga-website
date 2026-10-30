// Confiscated-gear depots (Hans, 2026-10-23: "option C").
//
// In captivity adventures the guards strip the player on arrival. Their gear is
// held in the depot and is recovered for free ONLY by reaching it. Finish the
// adventure without going there and the depot's quartermaster holds it for a
// growing fee, then sells it off (A9, utils/depotEngine.js).
//
// Reaching the depot also turns up other prisoners' belongings: 6 ordinary
// items plus 1d2 better ones, drawn without repeats from the existing item
// catalogue (no invented items, no reward-table relics). The engine performs
// all of this; the GM only narrates it.

export const DEPOT_MUNDANE_COUNT = 6;
export const DEPOT_GOOD_DIE = 2; // 1d2 good items

export const SUPPLY_DEPOTS = {
  saltblood_mines: {
    location: 'Supply Depot',
    mundane: [
      'Small Backpack', 'Weapon Sheath', 'Small Quiver', 'Torch', 'Wooden Shield',
      'Steel Shortsword', 'Hunting Bow', 'Iron Hatchet', 'Leather Helmet',
      'Leather Armor', 'Leather Pants', 'Leather Boots', 'Leather Gloves',
      'Bedroll', 'Tinderbox', 'Waterskin', 'Rations (5)',
    ],
    // A step above ordinary gear: heavier armour, a better weapon, healing.
    good: [
      'Steel Chainmail', 'Iron Plate Helm', 'Iron Greatsword', 'Plate Greaves',
      'Steel Sabatons', 'Plate Gauntlets', 'Medium Backpack', 'Silver Ring',
      'Consecrated Healing Draught', 'Alchemical Acid Flask',
    ],
  },
};

export const getSupplyDepot = (adventureId) => SUPPLY_DEPOTS[adventureId] || null;
