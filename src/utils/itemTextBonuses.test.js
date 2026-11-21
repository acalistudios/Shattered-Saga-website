import { describe, expect, it } from 'vitest';
import { parseSkillBonus, getItemTextBonus, getItemTextSkillBonus } from './itemTextBonuses';
import { getPassiveRewardSkillBonus } from './rewardEngine';

const hero = (over = {}) => ({ inventory: [], equipment: {}, progression: {}, ...over });

describe('reading skill bonuses from item text', () => {
  it('reads the skills, the amount and what the bonus is meant for', () => {
    expect(parseSkillBonus('Grants +1 to Perception or Insight checks to identify masked guests.'))
      .toEqual({ skills: { perception: 1, insight: 1 }, situation: 'identify masked guests', oncePerAdventure: false, needsEquip: false });
    expect(parseSkillBonus('+2 Crafting and +2 Smithing checks when equipped or unpacked.'))
      .toMatchObject({ skills: { crafting: 2, smithing: 2 }, situation: null, needsEquip: true });
    expect(parseSkillBonus('Once per adventure, grants +1 to Insight or Deception by showing a flicker of a possible self.').oncePerAdventure).toBe(true);
  });

  it('leaves out consumables, combat skills and non-skill bonuses', () => {
    expect(parseSkillBonus('One-use ritual aid. Grants +1 to a Divine Manifestation check against Malachar.')).toBeNull();
    expect(parseSkillBonus('Three uses. Grants +1 to Survival, Animal Rapport, or Stealth checks against spiders.')).toBeNull();
    expect(parseSkillBonus('Grants +1 to Blocking checks and soaks 1d6 + 1 on a successful block.')).toBeNull();
    expect(parseSkillBonus('Counts as a +1 Light Weapon, dealing 1d6 blunt.')).toBeNull();
    expect(parseSkillBonus('Grants +2 to Athletics or Two-Handed Weapons checks made to set the keystone.').skills).toEqual({ athletics: 2 });
  });

  it('indexes adventure items and reward relics', () => {
    expect(getItemTextBonus('Master Mask List')).toMatchObject({ source: 'adventure', adventureId: 'glass_orchard_masquerade' });
    expect(getItemTextBonus("Saint Orra's Veil +3")).toMatchObject({ source: 'reward', skills: { insight: 3, divine_communion: 3 } });
    expect(getItemTextBonus('Rations (2)')).toBeNull();
  });
});

describe('which item bonuses apply to a check', () => {
  it('the Master Mask List helps Perception and Insight during the masquerade only', () => {
    const c = hero({ inventory: ['Master Mask List'] });
    const at = getItemTextSkillBonus(c, 'perception', { adventureId: 'glass_orchard_masquerade' });
    expect(at.bonus).toBe(1);
    expect(at.notes[0]).toMatch(/masked guests/);
    expect(getItemTextSkillBonus(c, 'insight', { adventureId: 'glass_orchard_masquerade' }).bonus).toBe(1);
    expect(getItemTextSkillBonus(c, 'stealth', { adventureId: 'glass_orchard_masquerade' }).bonus).toBe(0);
    expect(getItemTextSkillBonus(c, 'perception', { adventureId: 'ashveil_keep' }).bonus).toBe(0);
  });

  it('reward relics must be equipped; then they work in any adventure', () => {
    expect(getPassiveRewardSkillBonus(hero({ inventory: ["Saint Orra's Veil +3"] }), 'insight').bonus).toBe(0);
    expect(getPassiveRewardSkillBonus(hero({ equipment: { head: "Saint Orra's Veil +3" } }), 'insight', { adventureId: 'ashveil_keep' }).bonus).toBe(3);
  });

  it('a once-per-adventure charm works once in each adventure', () => {
    const c = hero({ inventory: ['Mirror Shard Charm'] });
    const first = getItemTextSkillBonus(c, 'insight', { adventureId: 'ashveil_keep' });
    expect(first).toMatchObject({ bonus: 1, onceUsed: ['mirror shard charm'] });
    const spent = hero({ inventory: ['Mirror Shard Charm'], progression: { itemBonusUses: { 'mirror shard charm': 'ashveil_keep' } } });
    expect(getItemTextSkillBonus(spent, 'insight', { adventureId: 'ashveil_keep' }).bonus).toBe(0);
    expect(getItemTextSkillBonus(spent, 'insight', { adventureId: 'thorn_treaty' }).bonus).toBe(1);
  });

  it('"when equipped" items need equipping', () => {
    expect(getItemTextSkillBonus(hero({ inventory: ['Masterwork Tool Kit +1'] }), 'crafting').bonus).toBe(0);
    expect(getItemTextSkillBonus(hero({ equipment: { backpack: 'Masterwork Tool Kit +1' } }), 'crafting').bonus).toBe(1);
  });
});
