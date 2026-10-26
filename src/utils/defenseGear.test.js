import { describe, expect, it } from 'vitest';
import { getEquippedDefenseGear } from './items';

describe('equipped block/parry gear', () => {
  it.each(['hand_right', 'hand_left'])('recognizes a weapon in %s', slot => {
    expect(getEquippedDefenseGear({ [slot]: 'Dagger' })).toEqual({ weaponName: 'Dagger', shieldName: null });
  });
  it.each(['hand_right', 'hand_left'])('recognizes a shield in %s', slot => {
    expect(getEquippedDefenseGear({ [slot]: 'Wooden Shield' })).toEqual({ weaponName: null, shieldName: 'Wooden Shield' });
  });
  it('detects both weapon and buckler', () => {
    expect(getEquippedDefenseGear({ hand_right: 'Dagger', hand_left: 'Buckler' })).toEqual({ weaponName: 'Dagger', shieldName: 'Buckler' });
  });
  it.each([undefined, null, {}, { hand_right: null, hand_left: null }, { weapon: 'Dagger', shield: 'Wooden Shield' }, { hand_right: 'Rations (2)' }, { hip_left_sheathed: 'Dagger' }])('rejects empty hands, non-weapons and unheld aliases (%j)', equipment => {
    expect(getEquippedDefenseGear(equipment)).toEqual({ weaponName: null, shieldName: null });
  });
});
