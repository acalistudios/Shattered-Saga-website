import { describe, expect, it } from 'vitest';
import { countPlateMetal, takePlateMetal, forgeBlocker, forgePlateArmor, canSelfForge, isForgeMerchant, PLATE_RECIPE } from './forging';
import { rollRoadSalvage, scaleRoadThreat, PATROL_FOES } from './patrolEngine';
import { getArmorType, describeGear } from '../data/gearStats';
import { describeItemUse, MAJOR_POTION, COATINGS } from './itemUses';
import { MERCHANT_RESTOCK } from '../data/merchantRestock';

const smithy = (over = {}) => ({
  inventory: ['Steel Plate', 'Steel Plate', 'Iron Ingot (3)', 'Rations (2)'],
  currency: { gp: 5, sp: 0, cp: 0 },
  skills: {},
  equipment: {},
  stats: {},
  ...over,
});

describe('plate armour', () => {
  it('counts plates and ingots, and uses plates first', () => {
    expect(countPlateMetal(smithy().inventory)).toEqual({ plates: 2, ingots: 3, total: 5 });
    expect(takePlateMetal(smithy().inventory, 4)).toEqual(['Iron Ingot (1)', 'Rations (2)']);
  });

  it('a smith forges it for the fee; you can do it yourself with Smithing 3 and tools', () => {
    const paid = forgePlateArmor(smithy());
    expect(paid.inventory).toContain(PLATE_RECIPE.result);
    expect(paid.currency).toMatchObject({ gp: 1, sp: 0, cp: 0, gold: 1 });
    expect(forgeBlocker(smithy(), { self: true })).toMatch(/Smithing 3/);
    const smith = smithy({ skills: { smithing: 3 }, inventory: [...smithy().inventory, 'Smithing Tools'] });
    expect(canSelfForge(smith)).toBe(true);
    expect(forgePlateArmor(smith, { self: true }).currency).toEqual(smith.currency);
    expect(forgeBlocker(smithy({ inventory: ['Iron Ingot'] }))).toMatch(/needs 4/);
    expect(forgeBlocker(smithy({ currency: { gp: 0, sp: 0, cp: 0 } }))).toMatch(/fee/);
  });

  it('chainmail is not metal for plate, and the results are heavy armour', () => {
    expect(countPlateMetal(['Steel Chainmail']).total).toBe(0);
    expect(getArmorType('Forged Plate Armor')).toBe('heavy');
    expect(getArmorType("Durn's Arena Plate")).toBe('heavy');
  });

  it('only real smiths have a forge', () => {
    expect(isForgeMerchant({ name: 'Vance Coalhand', role: 'blacksmith' })).toBe(true);
    expect(isForgeMerchant({ name: 'Savax the Locker-Keeper', role: 'arena quartermaster' })).toBe(true);
    expect(isForgeMerchant({ name: 'Jory Pike', role: 'road peddler' })).toBe(false);
  });

  it('Iron Ingots are sold only by the travelling merchants', () => {
    const sellers = Object.entries(MERCHANT_RESTOCK).filter(([, tiers]) => tiers.some(t => t.sells.some(s => s[0] === 'Iron Ingot'))).map(([m]) => m).sort();
    expect(sellers).toEqual(['Jory Pike', 'Pell Windledger', 'Tarn Barley']);
  });

  it('late road fights can yield metal; plate knights from level 7', () => {
    expect(rollRoadSalvage('inquisition_enforcers', 6, () => 0)).toEqual([]);
    expect(rollRoadSalvage('inquisition_enforcers', 7, () => 0)).toEqual(['Steel Plate']);
    expect(rollRoadSalvage('flagellant_zealots', 8, () => 0.1)).toEqual(['Iron Ingot']);
    expect(rollRoadSalvage('flagellant_zealots', 8, () => 0.5)).toEqual([]);
    expect(scaleRoadThreat(PATROL_FOES.inquisition_enforcers, 6).stats.armor).toMatch(/medium/);
    expect(scaleRoadThreat(PATROL_FOES.inquisition_enforcers, 7).stats.armor).toMatch(/heavy armor soak 1d6/);
  });
});

describe('item descriptions follow the rules', () => {
  it('are built from the same numbers the game uses', () => {
    expect(describeGear('Major Potion or Elixir')).toContain(MAJOR_POTION.heal);
    expect(describeGear('Venom Vial')).toContain(`next ${COATINGS.venom.hits} melee hits`);
    expect(describeGear('Rare Scroll')).toContain('+4');
    expect(describeGear('Smithing Tools')).toContain('+1 to Smithing');
    expect(describeGear('Iron Ingot')).toContain('Forge');
    expect(describeItemUse('Holy Water')).toMatch(/Drink.*throw/is);
    expect(describeGear('Forged Plate Armor')).toMatch(/1d6/);
  });
});
