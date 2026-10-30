import { describe, it, expect } from 'vitest';
import {
  installStarfallBowstring, strungBonus, strungBowName, parseStrungBow, canTakeBowstring, STARFALL_BOWSTRING,
} from './bowstring';
import { getMagicBonus } from './rewardEngine';
import { getItemDetails } from './items';

describe('Starfall Bowstring install (A7, Hans 2026-10-28)', () => {
  it('is +3 plus half the bow\'s own bonus, rounded up', () => {
    expect(strungBonus('Hunting Bow')).toBe(3);
    expect(strungBonus('Hunting Bow +1')).toBe(4);
    expect(strungBonus('Sky-Stalker Composite Bow +2')).toBe(4);
    expect(strungBonus('Ashwood Longbow +3')).toBe(5);
  });

  it('reads a bonus from the reward table when the name does not show it', () => {
    expect(strungBonus('Black-Crown Longbow')).toBe(4); // +1 by the reward table
  });

  it('installs on a carried bow, consumes the string, and renames the equipped copy too', () => {
    const c = {
      inventory: ['Sky-Stalker Composite Bow +2', STARFALL_BOWSTRING, 'Rations (2)'],
      equipment: { hand_right: 'Sky-Stalker Composite Bow +2' },
    };
    const next = installStarfallBowstring(c, 'Sky-Stalker Composite Bow +2');
    const strung = 'Sky-Stalker Composite Bow +2 (Starfall-strung +4)';
    expect(next.inventory).toEqual([strung, 'Rations (2)']);
    expect(next.equipment.hand_right).toBe(strung);
    expect(getMagicBonus(strung)).toBe(4);
  });

  it('cannot be removed or installed twice', () => {
    const strung = strungBowName('Hunting Bow');
    expect(parseStrungBow(strung)).toEqual({ baseName: 'Hunting Bow', bonus: 3 });
    expect(canTakeBowstring(strung)).toBe(false);
    const c = { inventory: [strung, STARFALL_BOWSTRING] };
    expect(installStarfallBowstring(c, strung)).toBe(c);
  });

  it('only goes on bows, and needs the string', () => {
    expect(canTakeBowstring('Iron Greatsword')).toBe(false);
    const c = { inventory: ['Hunting Bow'] };
    expect(installStarfallBowstring(c, 'Hunting Bow')).toBe(c);
  });

  it('a strung bow is still a two-handed bow and is worth the bow plus the string', () => {
    const d = getItemDetails('Hunting Bow (Starfall-strung +3)');
    expect(d.slot).toBe(getItemDetails('Hunting Bow').slot);
    expect(d.valueCp).toBe(getItemDetails('Hunting Bow').valueCp + getItemDetails(STARFALL_BOWSTRING).valueCp);
  });
});
