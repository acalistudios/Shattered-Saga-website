import { describe, expect, it } from 'vitest';
import { getCoating, coatingDamage, getScroll, isThrowOnly, isMajorPotion } from './itemUses';
import { getPassiveRewardSkillBonus } from './rewardEngine';

const roll = () => 3;

describe('shop item uses', () => {
  it('coatings add their die, except where they cannot work', () => {
    const venom = getCoating('Venom Vial');
    const oil = getCoating('Ember Oil');
    expect(venom).toMatchObject({ die: '1d4', hits: 3 });
    expect(coatingDamage(venom, { name: 'Bandit' }, roll).damage).toBe(3);
    expect(coatingDamage(venom, { name: 'Rotting Skeleton' }, roll).damage).toBe(0);
    expect(coatingDamage(venom, { name: 'Guardian Golem' }, roll).damage).toBe(0);
    expect(coatingDamage(oil, { name: 'Ember Maw' }, roll).damage).toBe(0);
    expect(coatingDamage(oil, { name: 'Lord Voss', mundaneImmunity: 'immune' }, roll).damage).toBe(0);
    expect(coatingDamage({ ...venom, hits: 0 }, { name: 'Bandit' }, roll).damage).toBe(0);
  });

  it('scrolls, throw-only items and the major potion are recognised', () => {
    expect(getScroll('Rare Scroll').bonus).toBe(4);
    expect(getScroll('Common Scroll').bonus).toBe(2);
    expect(isThrowOnly('Acid Flask')).toBe(true);
    expect(isThrowOnly("Hedda's Smoke Bombs")).toBe(true);
    expect(isThrowOnly('Holy Water')).toBe(false); // can still be drunk
    expect(isMajorPotion('Major Potion or Elixir')).toBe(true);
    expect(isMajorPotion('Minor Potion or Elixir')).toBe(false);
  });

  it('tool kits and fine clothes give their bonus when carried', () => {
    const c = { inventory: ['Smithing Tools', 'Fine Clothing'], equipment: {} };
    expect(getPassiveRewardSkillBonus(c, 'smithing').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(c, 'crafting').bonus).toBe(0);
    expect(getPassiveRewardSkillBonus(c, 'negotiation').bonus).toBe(1);
  });
});
