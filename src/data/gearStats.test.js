import { describe, it, expect } from 'vitest';
import { getWeaponType, getShieldSoakDie, describeGear, getDualWield, gearValue } from './gearStats';
import { getWeaponProperties } from '../utils/rewardEngine';
import { getItemDetails } from '../utils/items';

describe('gear stats', () => {
  it('gives the Iron War Scythe real heavy-weapon stats, a price and a hand slot', () => {
    expect(getWeaponType('Iron War Scythe')).toMatchObject({ dice: '1d10', skill: 'heavy_weapons', hands: 2 });
    expect(getItemDetails('Iron War Scythe')).toMatchObject({ slot: 'hand', valueCp: 500, valueCategory: 'weapons' });
  });

  it('never assigns a skill that does not exist', () => {
    for (const w of ['Longsword', 'Battle Axe', 'Iron Mace', 'Spear', 'Steel Sword', 'Greatsword', 'Rusty Dagger']) {
      expect(['light_weapons', 'heavy_weapons', 'marksmanship']).toContain(getWeaponProperties(w).skill);
    }
  });

  it('prices and blocks an iron shield above a wooden one', () => {
    expect(getShieldSoakDie('Wooden Shield')).toBe(4);
    expect(getShieldSoakDie('Iron Shield')).toBe(6);
    expect(getShieldSoakDie('Tower Shield')).toBe(8);
    expect(getItemDetails('Iron Shield').valueCp).toBeGreaterThan(getItemDetails('Wooden Shield').valueCp);
    expect(gearValue('Iron Shield').category).toBe('armor');
  });

  it('describes weapons, shields and armour, and nothing else', () => {
    expect(describeGear('Dagger')).toBe('1d4 piercing · Light Weapons skill · one hand · can be dual-wielded');
    expect(describeGear('Iron Shield')).toContain('blocks 1d6');
    expect(describeGear('Leather Armor')).toContain('absorbs 1d3');
    expect(describeGear('+1 Shield (Voss Crest)')).toContain('1d6 +1');
    expect(describeGear('Bedroll')).toBe('');
    expect(describeGear('Rations (5)')).toBe('');
  });

  it('dual wields only two one-handed melee weapons', () => {
    expect(getDualWield({ hand_right: 'Steel Sword', hand_left: 'Dagger' })).toEqual({ main: 'Steel Sword', off: 'Dagger' });
    expect(getDualWield({ hand_right: 'Steel Sword', hand_left: 'Iron Shield' })).toBeNull();
    expect(getDualWield({ hand_right: 'Greatsword', hand_left: 'Dagger' })).toBeNull();
    expect(getDualWield({ hand_right: 'Hunting Bow', hand_left: 'Dagger' })).toBeNull();
    expect(getDualWield({ hand_right: 'Dagger' })).toBeNull();
  });
});
