import { describe, it, expect } from 'vitest';
import {
  getWeaponType, getShieldSoakDie, getShieldRollBonus, getParryDie, describeGear, getDualWield, getDualWieldPenalty, gearValue,
  getPlayerFightingStyle, inferFightingStyle, getMatchupModifiers,
} from './gearStats';
import { getWeaponProperties, getRewardWeaponProfile } from '../utils/rewardEngine';
import { getItemDetails } from '../utils/items';
import { enemyStyleFromNpc, enemyStyleFromWeapon, rollEnemyDefense } from '../utils/enemyDefense';

describe('gear stats', () => {
  it('gives the Iron War Scythe real two-handed stats, a price and a hand slot', () => {
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
    expect(describeGear('Dagger')).toBe('1d4+1 piercing · One-Handed Weapons skill · one hand · parries 1d2 · dual-wield ±0 main / -1 off hand to hit · can be thrown (Thrown Weapons skill): 1d4, -1 to hit');
    expect(describeGear('Throwing Knife')).toMatch(/Made to throw: thrown 1d4\+1, \+1 to hit · thrown with the Thrown Weapons skill; always recovered/);
    expect(describeGear('Iron War Scythe')).toBe('1d10 edged · Two-Handed Weapons skill · two hands · parries 1d4 · Balanced: no drawback');
    expect(describeGear('Halberd')).toContain('Long haft: parries 1d6');
    expect(describeGear('Halberd')).not.toContain('parries 1d4');
    expect(describeGear('Iron Shield')).toContain('+3 to Blocking rolls, blocks 1d6');
    expect(describeGear('Leather Armor')).toContain('absorbs 1d3');
    expect(describeGear('+1 Shield (Voss Crest)')).toContain('1d6 +1');
    expect(describeGear('Bedroll')).toBe('');
    expect(describeGear('Rations (5)')).toBe('');
  });

  it('parries by weight and gives shields a block bonus', () => {
    expect(getRewardWeaponProfile('Iron War Scythe', {}).damageBonus).toBe(0);
    expect(getParryDie('Steel Sword')).toBe(2);
    expect(getParryDie('Greatsword')).toBe(4);
    expect(getParryDie('Hunting Bow')).toBe(0);
    expect(getShieldRollBonus('Buckler')).toBe(1);
    expect(getShieldRollBonus('Wooden Shield')).toBe(2);
    expect(getShieldRollBonus('Iron Shield')).toBe(3);
    expect(getShieldRollBonus('Tower Shield')).toBe(4);
  });

  it('scales the dual-wield penalty with weapon weight', () => {
    expect(getDualWieldPenalty('Dagger', 'main')).toEqual({ hit: 0, damage: 0 });
    expect(getDualWieldPenalty('Dagger', 'off')).toEqual({ hit: -1, damage: 0 });
    expect(getDualWieldPenalty('Steel Sword', 'main')).toEqual({ hit: -1, damage: 0 });
    expect(getDualWieldPenalty('Steel Sword', 'off')).toEqual({ hit: -2, damage: -1 });
  });

  it('dual wields only two one-handed melee weapons', () => {
    expect(getDualWield({ hand_right: 'Steel Sword', hand_left: 'Dagger' })).toEqual({ main: 'Steel Sword', off: 'Dagger' });
    expect(getDualWield({ hand_right: 'Steel Sword', hand_left: 'Iron Shield' })).toBeNull();
    expect(getDualWield({ hand_right: 'Greatsword', hand_left: 'Dagger' })).toBeNull();
    expect(getDualWield({ hand_right: 'Hunting Bow', hand_left: 'Dagger' })).toBeNull();
    expect(getDualWield({ hand_right: 'Dagger' })).toBeNull();
  });
});

describe('fighting styles', () => {
  it('reads the player style from what is in hand', () => {
    expect(getPlayerFightingStyle({ hand_right: 'Steel Sword', hand_left: 'Iron Shield' })).toBe('shield');
    expect(getPlayerFightingStyle({ hand_right: 'Iron War Scythe' })).toBe('two_handed');
    expect(getPlayerFightingStyle({ hand_right: 'Dagger', hand_left: 'Dagger' })).toBe('dual');
    expect(getPlayerFightingStyle({ hand_right: 'Steel Sword' })).toBe('none');
    expect(getPlayerFightingStyle({ hand_right: 'Longbow' }, 'ranged')).toBe('ranged');
  });

  it('infers enemy styles from gear and named weapons, and falls back to none', () => {
    expect(inferFightingStyle(['Overseer Mace', 'Iron Shield'])).toBe('shield');
    expect(inferFightingStyle('Heavy Mining Pick')).toBe('two_handed');
    expect(inferFightingStyle('Twin Sabres')).toBe('dual');
    expect(inferFightingStyle('sword and dagger')).toBe('dual');
    expect(inferFightingStyle('Shortbow')).toBe('ranged');
    expect(inferFightingStyle('club and wooden shield')).toBe('shield');
    expect(inferFightingStyle('claws and teeth')).toBe('none');
    expect(inferFightingStyle()).toBe('none');
  });

  it('applies each matchup rule, and nothing for unrelated styles', () => {
    expect(getMatchupModifiers('two_handed', 'shield', 'block', true).shieldFactor).toBe(0.75);
    expect(getMatchupModifiers('dual', 'shield', 'block', true).rollBonus).toBe(0);
    expect(getMatchupModifiers('ranged', 'two_handed', 'block', false)).toMatchObject({ canParry: false, rollBonus: -2 });
    expect(getMatchupModifiers('ranged', 'none', 'dodge', false).rollBonus).toBe(-2);
    expect(getMatchupModifiers('ranged', 'shield', 'block', true)).toMatchObject({ canParry: true, rollBonus: 0 });
    expect(getMatchupModifiers('none', 'shield', 'block', true)).toMatchObject({ rollBonus: 0, shieldFactor: 1, notes: [] });
  });

  it('gives enemies a style and lets shield-bearers block', () => {
    const threx = { stats: { equipment: ['Overseer Mace', 'Iron Shield'], attacks: [{ name: 'Overseer Mace' }] } };
    expect(enemyStyleFromNpc(threx)).toEqual({ style: 'shield', shield: 'Iron Shield' });
    expect(enemyStyleFromWeapon('spear and hide shield')).toEqual({ style: 'shield', shield: 'spear and hide shield' });
    const enemy = { style: 'shield', shield: 'Iron Shield', defenses: { dodge: '5', block: '10' } };
    expect(rollEnemyDefense(enemy, 'none', Number)).toMatchObject({ roll: 13, defence: 'block', blockDie: 6 });
    expect(rollEnemyDefense(enemy, 'two_handed', Number)).toMatchObject({ roll: 12, blockDie: 4 });
    expect(rollEnemyDefense({ style: 'two_handed', defenses: { dodge: '5', block: '10' } }, 'ranged', Number)).toMatchObject({ roll: 3, defence: 'dodge' });
  });
});
