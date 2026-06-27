// Item database and carrying capacity calculator for Shattered Saga

export const ITEMS_DATABASE = {
  // Backpacks (Gear Slot: backpack)
  'Small Backpack': { weight: 2.0, volume: 0, slot: 'backpack', capacity: 20.0, desc: 'A basic canvas backpack.' },
  'Medium Backpack': { weight: 3.5, volume: 0, slot: 'backpack', capacity: 35.0, desc: 'A reinforced leather backpack.' },
  'Large Backpack': { weight: 5.0, volume: 0, slot: 'backpack', capacity: 50.0, desc: 'A heavy-duty frame backpack.' },

  // Belt / Hip Gear (Gear Slot: hip_left, hip_right)
  'Weapon Sheath': { weight: 1.0, volume: 1.0, slot: 'hip', desc: 'A leather belt frog to sheath a small or medium weapon.' },
  'Small Quiver': { weight: 1.0, volume: 1.5, slot: 'hip', capacity: 25, desc: 'A hip quiver storing up to 25 arrows.' },
  'Large Quiver': { weight: 2.0, volume: 2.5, slot: 'hip', capacity: 40, desc: 'A reinforced leather quiver storing up to 40 arrows.' },

  // Weapons & Shields (Slots: hand_left, hand_right, hip_left_sheathed, hip_right_sheathed)
  'Aether-Wrench': { weight: 3.0, volume: 2.0, slot: 'hand', subslot: 'medium', properties: '+1 Coordination rolls, bypass mechanical checks' },
  '+1 Dagger (Voss Crest)': { weight: 1.5, volume: 1.0, slot: 'hand', subslot: 'small', properties: '+1 attack rolls' },
  '+1 Shield (Voss Crest)': { weight: 6.0, volume: 4.0, slot: 'hand', subslot: 'large', properties: '+1 blocking' },
  'Basalt Warhammer': { weight: 8.0, volume: 5.0, slot: 'hand', subslot: 'large', properties: 'Heavy blunt weapon' },
  'Flame-ward Shield': { weight: 7.0, volume: 4.0, slot: 'hand', subslot: 'large', properties: 'Resist fire damage' },
  'Sky-Stalker Bow': { weight: 3.5, volume: 3.5, slot: 'hand', subslot: 'large', properties: 'Requires arrows' },
  'Torch': { weight: 1.0, volume: 1.0, slot: 'hand', subslot: 'small', properties: 'Illuminates dark areas, inflicts fire damage' },
  'Wooden Shield': { weight: 5.0, volume: 3.5, slot: 'hand', subslot: 'large', properties: 'Basic shield' },
  'Iron Greatsword': { weight: 9.0, volume: 6.0, slot: 'hand', subslot: 'large', properties: 'Two-handed heavy weapon' },
  'Steel Shortsword': { weight: 3.0, volume: 2.0, slot: 'hand', subslot: 'medium', properties: 'Standard sidearm' },
  'Hunting Bow': { weight: 3.0, volume: 3.0, slot: 'hand', subslot: 'large', properties: 'Ranged weapon' },
  'Iron Hatchet': { weight: 2.5, volume: 1.5, slot: 'hand', subslot: 'medium', properties: 'Light chopping tool' },

  // Worn Gear (Slots: head, neck, body, legs, feet, hands_gloves)
  'Leather Helmet': { weight: 2.0, volume: 2.0, slot: 'head', desc: 'Basic leather protection.' },
  'Iron Plate Helm': { weight: 4.0, volume: 3.0, slot: 'head', desc: 'Heavy steel helmet.' },
  'Mage Hood': { weight: 0.5, volume: 1.0, slot: 'head', desc: 'Soft fabric hood.' },
  'Demon-Cult Amulet': { weight: 0.5, volume: 0.5, slot: 'neck', properties: 'Amulet of shadow' },
  'Amulet of Tide-Taming': { weight: 0.5, volume: 0.5, slot: 'neck', properties: 'Resist water pressure' },
  'Leather Armor': { weight: 12.0, volume: 6.0, slot: 'body', desc: 'Light leather padding.' },
  'Steel Chainmail': { weight: 25.0, volume: 10.0, slot: 'body', desc: 'Heavy chainmail protection.' },
  'Mage Robes': { weight: 3.0, volume: 4.0, slot: 'body', desc: 'Cloth robes flowing with mana.' },
  'Leather Pants': { weight: 4.0, volume: 3.0, slot: 'legs', desc: 'Sturdy leather leggings.' },
  'Plate Greaves': { weight: 8.0, volume: 4.0, slot: 'legs', desc: 'Heavy metal shin guards.' },
  'Leather Boots': { weight: 3.0, volume: 3.0, slot: 'feet', desc: 'Worn traveler boots.' },
  'Steel Sabatons': { weight: 5.0, volume: 3.5, slot: 'feet', desc: 'Heavy plate sabatons.' },
  'Leather Gloves': { weight: 1.0, volume: 1.0, slot: 'hands', desc: 'Supple leather gloves.' },
  'Plate Gauntlets': { weight: 2.5, volume: 1.5, slot: 'hands', desc: 'Heavy steel gauntlets.' },

  // Jewelry (Slots: ring_left, ring_right)
  'Aldric\'s Signet Ring': { weight: 0.1, volume: 0.1, slot: 'ring', properties: 'Voss crest signet' },
  'Silver Ring': { weight: 0.1, volume: 0.1, slot: 'ring', properties: 'Simple ring' },
  'Gold Ring': { weight: 0.1, volume: 0.1, slot: 'ring', properties: 'Valuable gold band' },

  // Base Items & Consumables (Inventory only)
  'Bedroll': { weight: 4.0, volume: 5.0 },
  'Tinderbox': { weight: 0.5, volume: 0.5 },
  'Waterskin': { weight: 1.0, volume: 1.5 },
  'Rations (5)': { weight: 2.5, volume: 2.5 },
  'Rations (4)': { weight: 2.0, volume: 2.0 },
  'Rations (3)': { weight: 1.5, volume: 1.5 },
  'Rations (2)': { weight: 1.0, volume: 1.0 },
  'Rations (1)': { weight: 0.5, volume: 0.5 },
  'Holy Water': { weight: 1.0, volume: 1.0 },
  'Water-Breathing Elixir': { weight: 0.5, volume: 0.5 },
  'Freezing Venom Vial': { weight: 0.5, volume: 0.5 },
  'Alchemical Acid Flask': { weight: 1.0, volume: 1.0 }
};

// Clean name helper (e.g. "Rations (5)" -> "Rations")
export function cleanItemName(itemName) {
  return itemName.replace(/\s*\(\d+\)$/, '').trim();
}

// Get weight, volume, slot and properties for any item
export function getItemDetails(itemName) {
  if (!itemName) return { name: '', weight: 0, volume: 0, slot: null, subslot: null, properties: '' };
  
  const clean = cleanItemName(itemName);
  const dbMatch = ITEMS_DATABASE[itemName] || ITEMS_DATABASE[clean];
  
  if (dbMatch) {
    // If it's a ration pack, scale weight/volume by current quantity
    const qtyMatch = itemName.match(/\((\d+)\)/);
    if (qtyMatch && clean.toLowerCase().includes('ration')) {
      const qty = parseInt(qtyMatch[1], 10);
      return {
        ...dbMatch,
        weight: qty * 0.5,
        volume: qty * 0.5
      };
    }
    return dbMatch;
  }
  
  // Keyword fallbacks for dynamically generated items
  const nameLower = itemName.toLowerCase();
  let weight = 1.0;
  let volume = 1.0;
  let slot = null;
  let subslot = null;
  let properties = '';

  if (nameLower.includes('dagger') || nameLower.includes('knife')) {
    weight = 1.5; volume = 1.0; slot = 'hand'; subslot = 'small';
  } else if (nameLower.includes('shortsword') || nameLower.includes('rapier') || nameLower.includes('cutlass') || nameLower.includes('hatchet')) {
    weight = 3.0; volume = 2.0; slot = 'hand'; subslot = 'medium';
  } else if (nameLower.includes('sword') || nameLower.includes('greatsword') || nameLower.includes('axe') || nameLower.includes('warhammer') || nameLower.includes('spear') || nameLower.includes('glaive') || nameLower.includes('halberd')) {
    weight = 6.0; volume = 4.0; slot = 'hand'; subslot = 'large';
  } else if (nameLower.includes('bow') || nameLower.includes('crossbow')) {
    weight = 3.5; volume = 3.0; slot = 'hand'; subslot = 'large';
  } else if (nameLower.includes('shield') || nameLower.includes('buckler')) {
    weight = 5.5; volume = 3.5; slot = 'hand'; subslot = 'large';
  } else if (nameLower.includes('helmet') || nameLower.includes('circlet') || nameLower.includes('hood') || nameLower.includes('cowl')) {
    weight = 2.0; volume = 2.0; slot = 'head';
  } else if (nameLower.includes('armor') || nameLower.includes('mail') || nameLower.includes('robes') || nameLower.includes('plate') || nameLower.includes('cuirass')) {
    weight = 15.0; volume = 7.0; slot = 'body';
  } else if (nameLower.includes('pants') || nameLower.includes('trousers') || nameLower.includes('greaves') || nameLower.includes('leggings')) {
    weight = 3.5; volume = 3.0; slot = 'legs';
  } else if (nameLower.includes('boots') || nameLower.includes('shoes') || nameLower.includes('sabatons')) {
    weight = 3.0; volume = 2.5; slot = 'feet';
  } else if (nameLower.includes('gloves') || nameLower.includes('gauntlets')) {
    weight = 1.0; volume = 1.0; slot = 'hands';
  } else if (nameLower.includes('ring')) {
    weight = 0.1; volume = 0.1; slot = 'ring';
  } else if (nameLower.includes('amulet') || nameLower.includes('necklace') || nameLower.includes('pendant')) {
    weight = 0.3; volume = 0.5; slot = 'neck';
  } else if (nameLower.includes('backpack') || nameLower.includes('pack')) {
    weight = 3.0; volume = 0; slot = 'backpack';
  } else if (nameLower.includes('sheath') || nameLower.includes('frog') || nameLower.includes('belt')) {
    weight = 1.0; volume = 1.0; slot = 'hip';
  } else if (nameLower.includes('quiver')) {
    weight = 1.0; volume = 1.5; slot = 'hip';
  } else if (nameLower.includes('potion') || nameLower.includes('elixir') || nameLower.includes('flask') || nameLower.includes('vial') || nameLower.includes('brew')) {
    weight = 0.5; volume = 0.5;
  } else if (nameLower.includes('ration') || nameLower.includes('food')) {
    weight = 0.5; volume = 0.5;
  }

  // Parse inline custom tags: e.g. "Lead Block (wt: 10, vol: 2)"
  const wtMatch = itemName.match(/wt:\s*([\d.]+)/i);
  const volMatch = itemName.match(/vol:\s*([\d.]+)/i);
  if (wtMatch) weight = parseFloat(wtMatch[1]);
  if (volMatch) volume = parseFloat(volMatch[1]);

  return { name: itemName, weight, volume, slot, subslot, properties };
}

// Calculate total weight, volume and encumbrance metrics
export function calculateWeightAndVolume(character) {
  const power = character.attributes?.power || 1;
  const vigor = character.attributes?.vigor || 1;

  // Max weight = 30 + 15 * Power + 5 * Vigor
  const maxWeight = 30 + 15 * power + 5 * vigor;

  // Max volume is determined by equipped backpack (default pockets = 5 L)
  const backpackItem = character.equipment?.backpack;
  const backpackDetails = backpackItem ? getItemDetails(backpackItem) : null;
  const maxVolume = backpackDetails?.capacity || 5.0;

  let totalWeight = 0;
  let totalVolume = 0;

  // Resolve sheathed arrow volume discounts
  let totalQuiverCapacity = 0;
  const hipSlots = ['hip_left', 'hip_right'];
  hipSlots.forEach(slot => {
    const eqItem = character.equipment?.[slot];
    if (eqItem) {
      const details = getItemDetails(eqItem);
      if (details.capacity && details.slot === 'hip') {
        // Quiver equipped
        totalQuiverCapacity += details.capacity;
      }
    }
  });

  // Keep track of arrows currently sheathed to subtract from backpack volume
  let sheathedArrowsCount = 0;

  // Gather equipped list to deduct volume
  const equippedList = Object.values(character.equipment || {}).filter(v => v !== null);

  (character.inventory || []).forEach(item => {
    const details = getItemDetails(item);
    totalWeight += details.weight;

    // Check if this item is currently equipped
    const eqIdx = equippedList.indexOf(item);
    if (eqIdx !== -1) {
      // Worn on body - takes 0 volume
      equippedList.splice(eqIdx, 1);
    } else {
      // Check for arrows to discount under quiver capacity
      const arrowMatch = item.match(/Arrows?\s*\((\d+)\)/i);
      if (arrowMatch && totalQuiverCapacity > sheathedArrowsCount) {
        const count = parseInt(arrowMatch[1], 10);
        const freeSlotsAvailable = totalQuiverCapacity - sheathedArrowsCount;
        const freeArrows = Math.min(count, freeSlotsAvailable);
        
        sheathedArrowsCount += freeArrows;
        
        // Calculate volume for remaining unsheathed arrows (each arrow pack defaults to 0.05 L volume)
        const leftCount = count - freeArrows;
        totalVolume += leftCount * 0.05;
      } else {
        // Normal item in backpack
        totalVolume += details.volume;
      }
    }
  });

  totalWeight = parseFloat(totalWeight.toFixed(1));
  totalVolume = parseFloat(totalVolume.toFixed(1));

  // Encumbrance calculations
  const weightRatio = totalWeight / maxWeight;
  const volumeRatio = totalVolume / maxVolume;
  
  let isEncumbered = false;
  let isSlowed = false;
  let isOverloaded = false;
  let penaltyPercentage = 0;
  let rollModifier = 0;

  const activeRatio = Math.max(weightRatio, volumeRatio);

  if (activeRatio > 1.0) {
    isOverloaded = true;
    isSlowed = true;
    isEncumbered = true;
  } else if (activeRatio > 0.75) {
    isSlowed = true;
    isEncumbered = true;
  } else if (activeRatio > 0.5) {
    isEncumbered = true;
  }

  // Calculate scaling penalty: 2% reduction & 2% fatigue increase per 1% above 50% ratio
  if (activeRatio > 0.5) {
    const pctAbove = (activeRatio - 0.5) * 100;
    penaltyPercentage = Math.round(pctAbove * 2);
    
    // Flat roll modifier penalty: -1 for every 10% above 50% capacity
    rollModifier = -Math.floor(pctAbove / 10);
  }

  return {
    totalWeight,
    maxWeight,
    totalVolume,
    maxVolume,
    weightRatio: parseFloat((weightRatio * 100).toFixed(0)),
    volumeRatio: parseFloat((volumeRatio * 100).toFixed(0)),
    isEncumbered,
    isSlowed,
    isOverloaded,
    penaltyPercentage,
    rollModifier
  };
}

export function getItemSlot(itemName) {
  const details = getItemDetails(itemName);
  return details.slot;
}
