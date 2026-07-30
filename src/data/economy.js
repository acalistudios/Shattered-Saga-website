export const CURRENCY_CONVERSION = {
  cpPerSp: 10,
  spPerGp: 10,
  cpPerGp: 100,
};

export const coinValue = (totalCp) => {
  const cpTotal = Math.max(0, Math.round(totalCp || 0));
  const gp = Math.floor(cpTotal / CURRENCY_CONVERSION.cpPerGp);
  const sp = Math.floor((cpTotal % CURRENCY_CONVERSION.cpPerGp) / CURRENCY_CONVERSION.cpPerSp);
  const cp = cpTotal % CURRENCY_CONVERSION.cpPerSp;
  return { gp, sp, cp };
};

export const MERCHANT_TRADE_RULES = {
  baseBuyRate: 0.5,
  negotiationMaxAdjustment: 0.25,
  bestPlayerPurchaseRate: 0.75,
  bestPlayerSaleRate: 0.75,
  negotiationSkill: 'negotiation',
  notes: 'Merchants sell at listed value and buy relevant goods at 50% of listed value. A successful Negotiation check can improve either side of the deal by up to 25%, making the best purchase price 75% of list and the best sale payout 75% of list.',
};

export const ITEM_CONDITION_MULTIPLIERS = {
  broken: 0.1,
  ruined: 0.1,
  cracked: 0.25,
  torn: 0.35,
  rusty: 0.4,
  dull: 0.6,
  worn: 0.75,
  common: 1,
  sturdy: 1.1,
  honed: 1.25,
  fine: 1.5,
  masterwork: 2.5,
  silvered: 3,
  alchemical: 4,
  magical: 10,
  '+1': 15,
  relic: 20,
};

const priced = (name, cp, category, notes = '') => ({
  name,
  valueCp: cp,
  value: coinValue(cp),
  category,
  notes,
});

export const GENERIC_ITEM_VALUES = [
  priced('Knife', 5, 'weapons', 'A common utility blade or improvised sidearm.'),
  priced('Dagger', 20, 'weapons', 'Small weapon; use rusty/dull/honed modifiers when appropriate.'),
  priced('Hatchet', 50, 'weapons', 'Light chopping tool usable as a weapon.'),
  priced('Shortsword', 100, 'weapons', 'Standard sidearm.'),
  priced('Longsword', 200, 'weapons', 'Standard military blade.'),
  priced('Greatsword', 500, 'weapons', 'Heavy two-handed weapon.'),
  priced('Warhammer', 500, 'weapons', 'Heavy blunt weapon.'),
  priced('Hunting Bow', 300, 'weapons', 'Common ranged weapon.'),
  priced('Crossbow', 500, 'weapons', 'Mechanical ranged weapon.'),
  priced('Arrows (20)', 10, 'ammunition', 'A bundle of ordinary arrows.'),
  priced('Crossbow Bolts (20)', 15, 'ammunition', 'A bundle of crossbow bolts.'),
  priced('Wooden Shield', 100, 'armor', 'Basic shield.'),
  priced('Leather Armor', 300, 'armor', 'Light armor.'),
  priced('Steel Chainmail', 1200, 'armor', 'Heavy armor.'),
  priced('Plate Helm', 300, 'armor', 'Heavy head protection.'),
  priced('Plate Gauntlets', 250, 'armor', 'Heavy hand protection.'),
  priced('Small Backpack', 50, 'provisions', 'Basic pack.'),
  priced('Medium Backpack', 100, 'provisions', 'Reinforced travel pack.'),
  priced('Large Backpack', 200, 'provisions', 'Frame pack for long expeditions.'),
  priced('Bedroll', 20, 'provisions', 'Travel bedding.'),
  priced('Waterskin', 15, 'provisions', 'One filled waterskin.'),
  priced('Ration', 5, 'provisions', 'One day of preserved food.'),
  priced('Rations (5)', 25, 'provisions', 'Five days of preserved food.'),
  priced('Tinderbox', 30, 'provisions', 'Fire-starting kit.'),
  priced('Torch', 1, 'provisions', 'One hour of bright light.'),
  priced('Rope (50 ft)', 100, 'tools', 'Climbing and hauling line.'),
  priced('Lockpicks', 200, 'tools', 'Basic thievery tools.'),
  priced('Crafting Tools', 300, 'tools', 'General repair and crafting kit.'),
  priced('Smithing Tools', 500, 'tools', 'Portable smithing kit.'),
  priced('Healer\'s Satchel', 500, 'healing', 'Bandages, splints, and field supplies.'),
  priced('Bandages (5)', 5, 'healing', 'Basic wound dressing.'),
  priced('Healing Herbs', 20, 'healing', 'Common herbs for poultices and teas.'),
  priced('Poultice', 50, 'healing', 'Prepared treatment for wounds or fever.'),
  priced('Holy Water', 100, 'alchemy', 'Useful against demons, undead, and incorporeal evil.'),
  priced('Acid Flask', 150, 'alchemy', 'Alchemical corrosive.'),
  priced('Venom Vial', 200, 'alchemy', 'Dangerous poison reagent.'),
  priced('Minor Potion or Elixir', 500, 'alchemy', 'Single-use magical or alchemical aid.'),
  priced('Major Potion or Elixir', 1500, 'alchemy', 'Rare single-use magical or alchemical aid.'),
  priced('Common Scroll', 300, 'lore', 'Readable text, map, or minor ritual reference.'),
  priced('Rare Scroll', 1000, 'lore', 'Valuable spell, secret, or historical record.'),
  priced('Chronicle Hourglass', 500, 'lore', 'A magical hourglass used to replay completed quests.'),
  priced('Silver Ring', 200, 'jewelry', 'Simple silver band.'),
  priced('Gold Ring', 1000, 'jewelry', 'Valuable gold band.'),
  priced('Signet Ring', 1500, 'jewelry', 'Political value depends on its crest and owner.'),
  priced('Small Gemstone', 2500, 'jewelry', 'Portable treasure.'),
  priced('+1 Weapon', 5000, 'magical_weapons', 'Baseline for a reliable enchanted weapon.'),
  priced('+1 Shield', 4500, 'magical_armor', 'Baseline for a reliable enchanted shield.'),
  priced('Minor Relic', 2500, 'relics', 'Small magical or sacred object.'),
  priced('Major Relic', 10000, 'relics', 'Powerful, rare, or politically dangerous object.'),
];

export const GENERIC_ITEM_VALUE_BY_NAME = GENERIC_ITEM_VALUES.reduce((acc, item) => {
  acc[item.name] = item;
  return acc;
}, {});
