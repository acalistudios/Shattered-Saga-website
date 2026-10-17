import { describe, it, expect } from 'vitest';
import {
  KEYSTONE_SHARDS,
  getKeystoneStatus,
  getKeystoneCount,
  isTier4Unlocked,
  getActiveKeystoneResonances,
  getKeystoneStatModifiers
} from './keystoneShards';

describe('Keystone Shards Data Model', () => {
  it('defines all 5 elemental keystone shards', () => {
    expect(KEYSTONE_SHARDS).toHaveLength(5);
    const elements = KEYSTONE_SHARDS.map(s => s.element);
    expect(elements).toEqual(expect.arrayContaining(['fire', 'earth', 'water', 'air', 'aether']));
  });

  it('reports all shards dormant for a fresh character', () => {
    const character = { completed_adventures: [], inventory: [] };
    const status = getKeystoneStatus(character);
    expect(status.every(s => !s.isAwakened)).toBe(true);
    expect(getKeystoneCount(character)).toBe(0);
    expect(isTier4Unlocked(character)).toBe(false);
  });

  it('awakens shards when their source adventure is completed', () => {
    const character = {
      completed_adventures: ['ashveil_keep', 'obsidian_vault'],
      inventory: [],
    };
    const status = getKeystoneStatus(character);
    const earth = status.find(s => s.id === 'earth');
    const fire = status.find(s => s.id === 'fire');
    const water = status.find(s => s.id === 'water');

    expect(earth.isAwakened).toBe(true);
    expect(fire.isAwakened).toBe(true);
    expect(water.isAwakened).toBe(false);
    expect(getKeystoneCount(character)).toBe(2);
    expect(isTier4Unlocked(character)).toBe(false);
  });

  it('unlocks Tier 4 when 3 or more shards are restored', () => {
    const character = {
      completed_adventures: ['ashveil_keep', 'obsidian_vault', 'sunken_spire'],
      inventory: [],
    };
    expect(getKeystoneCount(character)).toBe(3);
    expect(isTier4Unlocked(character)).toBe(true);
  });

  it('bypasses Tier 4 requirement in sandbox mode', () => {
    const character = { completed_adventures: [], inventory: [] };
    expect(isTier4Unlocked(character, true)).toBe(true);
  });

  it('returns empty resonances and zeroed stat modifiers when no shards are restored', () => {
    const character = { completed_adventures: [], inventory: [] };
    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toEqual([]);

    const mods = getKeystoneStatModifiers(character);
    expect(mods.attackDamageBonus).toBe(0);
    expect(mods.spellPowerBonus).toBe(0);
    expect(mods.maxHpBonus).toBe(0);
    expect(mods.crushingSoakBonus).toBe(0);
    expect(mods.maxFatigueBonus).toBe(0);
    expect(mods.dodgeBonus).toBe(0);
    expect(mods.initiativeBonus).toBe(0);
    expect(mods.maxArcaneSpBonus).toBe(0);
    expect(mods.maxDivineSpBonus).toBe(0);
    expect(mods.periodicHealHpPer2Hours).toBe(0);
    expect(mods.periodicStaunchBleedPer2Hours).toBe(0);
    expect(mods.restHpBonus).toBe(0);
    expect(mods.restBleedStaunch).toBe(0);
    expect(mods.skillBonuses).toEqual({});
  });

  it('correctly calculates Earth Shard (Granite Bastion) stat modifiers', () => {
    const character = { completed_adventures: ['saltblood_mines'], inventory: [] };
    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toHaveLength(1);
    expect(resonances[0].id).toBe('earth');
    expect(resonances[0].perkName).toBe('Granite Bastion');

    const mods = getKeystoneStatModifiers(character);
    expect(mods.maxHpBonus).toBe(5);
    expect(mods.crushingSoakBonus).toBe(1);
    expect(mods.skillBonuses.athletics).toBe(1);
  });

  it('correctly calculates Water Shard (Tidal Surge & Mend) stat modifiers', () => {
    const character = { completed_adventures: ['sunken_spire'], inventory: [] };
    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toHaveLength(1);
    expect(resonances[0].id).toBe('water');
    expect(resonances[0].perkName).toBe('Tidal Surge & Mend');

    const mods = getKeystoneStatModifiers(character);
    expect(mods.periodicHealHpPer2Hours).toBe(1);
    expect(mods.periodicStaunchBleedPer2Hours).toBe(1);
    expect(mods.restHpBonus).toBe(4);
    expect(mods.restBleedStaunch).toBe(4);
    expect(mods.skillBonuses.athletics).toBe(1);
    expect(mods.skillBonuses.survival).toBe(1);
  });

  it('correctly calculates Air Shard (Zephyr Stride) stat modifiers', () => {
    const character = { completed_adventures: ['blackroot_hollow'], inventory: [] };
    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toHaveLength(1);
    expect(resonances[0].id).toBe('air');
    expect(resonances[0].perkName).toBe('Zephyr Stride');

    const mods = getKeystoneStatModifiers(character);
    expect(mods.dodgeBonus).toBe(1);
    expect(mods.maxFatigueBonus).toBe(5);
    expect(mods.initiativeBonus).toBe(1);
    expect(mods.skillBonuses.acrobatics).toBe(1);
  });

  it('correctly calculates Fire Shard (Cinder Might) stat modifiers', () => {
    const character = { completed_adventures: ['obsidian_vault'], inventory: [] };
    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toHaveLength(1);
    expect(resonances[0].id).toBe('fire');
    expect(resonances[0].perkName).toBe('Cinder Might');

    const mods = getKeystoneStatModifiers(character);
    expect(mods.attackDamageBonus).toBe(1);
    expect(mods.spellDamageBonus).toBe(1);
    expect(mods.skillBonuses.intimidation).toBe(1);
  });

  it('correctly calculates Aether Shard (Void Weave) stat modifiers', () => {
    const character = { completed_adventures: ['clockwork_conservatory'], inventory: [] };
    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toHaveLength(1);
    expect(resonances[0].id).toBe('aether');
    expect(resonances[0].perkName).toBe('Void Weave');

    const mods = getKeystoneStatModifiers(character);
    expect(mods.spellPowerBonus).toBe(1);
    expect(mods.maxArcaneSpBonus).toBe(1);
    expect(mods.maxDivineSpBonus).toBe(1);
    expect(mods.skillBonuses.lore).toBe(1);
    expect(mods.skillBonuses.languages).toBe(1);
  });

  it('aggregates multi-shard resonance modifiers when all 5 are awakened', () => {
    const character = {
      completed_adventures: [
        'obsidian_vault',        // fire
        'saltblood_mines',       // earth
        'sunken_spire',          // water
        'blackroot_hollow',      // air
        'clockwork_conservatory' // aether
      ],
      inventory: []
    };

    const resonances = getActiveKeystoneResonances(character);
    expect(resonances).toHaveLength(5);

    const mods = getKeystoneStatModifiers(character);
    expect(mods.attackDamageBonus).toBe(1);
    expect(mods.spellPowerBonus).toBe(1);
    expect(mods.maxHpBonus).toBe(5);
    expect(mods.crushingSoakBonus).toBe(1);
    expect(mods.maxFatigueBonus).toBe(5);
    expect(mods.dodgeBonus).toBe(1);
    expect(mods.initiativeBonus).toBe(1);
    expect(mods.maxArcaneSpBonus).toBe(1);
    expect(mods.maxDivineSpBonus).toBe(1);
    expect(mods.periodicHealHpPer2Hours).toBe(1);
    expect(mods.periodicStaunchBleedPer2Hours).toBe(1);
    expect(mods.restHpBonus).toBe(4);
    expect(mods.restBleedStaunch).toBe(4);
    expect(mods.skillBonuses).toMatchObject({
      intimidation: 1,
      athletics: 2,
      survival: 1,
      acrobatics: 1,
      lore: 1,
      languages: 1
    });
  });
});
