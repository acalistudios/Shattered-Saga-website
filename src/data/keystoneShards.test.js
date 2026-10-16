import { describe, it, expect } from 'vitest';
import { KEYSTONE_SHARDS, getKeystoneStatus, getKeystoneCount, isTier4Unlocked } from './keystoneShards';

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
});
