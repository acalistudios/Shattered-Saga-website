import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PROGRESSION,
  getAdventureStartClock,
  getMagicBonus,
  getCooldownReady,
  setItemCooldownOnCharacter,
  addActiveItemEffectToCharacter,
  removeActiveItemEffectsFromCharacter,
  clearSceneItemEffectsFromCharacter,
  addTemporarySkillPenaltyToCharacter,
  applyRewardRestRecovery,
  characterHasAffinity,
  getPassiveRewardSkillBonus,
  getRewardWeaponProfile,
} from './rewardEngine';
import { getRewardItemByName } from '../data/rewardItems';
import { resolveGearRecovery, ADVENTURE_GEAR_RECOVERY } from '../data/gearRecovery';

const character = (over = {}) => ({
  element: 'fire',
  equipment: {},
  inventory: [],
  skills: {},
  stats: { day: 1, hour: 13.0 },
  progression: { ...DEFAULT_PROGRESSION },
  ...over,
});

describe('campaign clock at adventure entry', () => {
  it('honors a later authored opening', () => {
    expect(getAdventureStartClock({ day: 1, hour: 13 }, { startingDay: 1, startingHour: 22 }))
      .toEqual({ day: 1, hour: 22 });
  });
  it('never rewinds a recovery or cooldown clock on re-entry', () => {
    expect(getAdventureStartClock({ day: 4, hour: 7.5 }, { startingDay: 1, startingHour: 13 }))
      .toEqual({ day: 4, hour: 7.5 });
  });
  it('preserves midnight and normalizes overflowing hours', () => {
    expect(getAdventureStartClock({ day: 3, hour: 0 }, {})).toEqual({ day: 3, hour: 0 });
    expect(getAdventureStartClock({ day: 3, hour: 25 }, {})).toEqual({ day: 4, hour: 1 });
  });
});

describe('reward item lookup', () => {
  it('finds items by exact display name', () => {
    expect(getRewardItemByName('Black-Crown Longbow')?.id).toBe('black_crown_longbow');
  });

  it('is case insensitive', () => {
    expect(getRewardItemByName('frostfire glaive +3')?.id).toBe('frostfire_glaive_plus_3');
  });

  it('falls back to substring so suffixed names still resolve', () => {
    expect(getRewardItemByName('Glass Thorn Dagger (bloodied)')?.id).toBe('glass_thorn_dagger');
  });

  it('returns null for unknown items', () => {
    expect(getRewardItemByName('Rusty Spoon')).toBeNull();
  });
});

describe('attack bonuses', () => {
  it('reads +N out of a display name', () => {
    expect(getMagicBonus('Champion Maul +2')).toBe(2);
    expect(getMagicBonus('Hunting Bow')).toBe(0);
  });

  // Regression: the table declares bonus 1 but the name has no "+1", so
  // name-parsing alone silently granted +0.
  it('grants Black-Crown Longbow its +1 despite the name', () => {
    const profile = getRewardWeaponProfile('Black-Crown Longbow', character({ element: 'earth' }));
    expect(profile.attackBonus).toBe(1);
  });

  it('grants Glass Thorn Dagger its +1 despite the name', () => {
    const profile = getRewardWeaponProfile('Glass Thorn Dagger', character({ element: 'earth' }));
    expect(profile.attackBonus).toBe(1);
  });

  it('upgrades a carried bow to +3 with Starfall Bowstring, without stacking', () => {
    const c = character({ element: 'earth', inventory: ['Starfall Bowstring +3'] });
    const profile = getRewardWeaponProfile('Sky-Stalker Composite Bow +2', c);
    expect(profile.attackBonus).toBe(3);
  });

  it('does not apply the bowstring to melee weapons', () => {
    const c = character({ element: 'earth', inventory: ['Starfall Bowstring +3'] });
    expect(getRewardWeaponProfile('Champion Maul +2', c).attackBonus).toBe(2);
  });
});

describe('cooldowns', () => {
  it('reports an untouched item as ready', () => {
    expect(getCooldownReady(character(), 'Blessed Bell Clapper', 'restore_divine_sp')).toBe(true);
  });

  it('blocks a rest-cooldown item until rest, regardless of time passing', () => {
    let c = setItemCooldownOnCharacter(character(), 'Blessed Bell Clapper', 'restore_divine_sp', 'rest');
    expect(getCooldownReady(c, 'Blessed Bell Clapper', 'restore_divine_sp')).toBe(false);

    c = { ...c, stats: { day: 5, hour: 13.0 } };
    expect(getCooldownReady(c, 'Blessed Bell Clapper', 'restore_divine_sp')).toBe(false);
  });

  it('clears rest cooldowns on rest', () => {
    const c = setItemCooldownOnCharacter(character(), 'Blessed Bell Clapper', 'restore_divine_sp', 'rest');
    const rested = applyRewardRestRecovery(c);
    expect(getCooldownReady(rested, 'Blessed Bell Clapper', 'restore_divine_sp')).toBe(true);
  });

  it('holds an 8-hour cooldown until the hours actually pass', () => {
    const c = setItemCooldownOnCharacter(character(), 'Black-Crown Longbow', 'fire_arrow', '8_hours', 8);
    expect(getCooldownReady(c, 'Black-Crown Longbow', 'fire_arrow')).toBe(false);

    const later = { ...c, stats: { day: 1, hour: 20.0 } };
    expect(getCooldownReady(later, 'Black-Crown Longbow', 'fire_arrow')).toBe(false);

    const ready = { ...c, stats: { day: 1, hour: 21.0 } };
    expect(getCooldownReady(ready, 'Black-Crown Longbow', 'fire_arrow')).toBe(true);
  });

  it('survives rest, since 8-hour cooldowns are not rest-based', () => {
    const c = setItemCooldownOnCharacter(character(), 'Black-Crown Longbow', 'fire_arrow', '8_hours', 8);
    expect(getCooldownReady(applyRewardRestRecovery(c), 'Black-Crown Longbow', 'fire_arrow')).toBe(false);
  });

  it('keys cooldowns per effect, not per item', () => {
    const c = setItemCooldownOnCharacter(character(), 'Frostfire Heart', 'frostfire_stance', 'rest');
    expect(getCooldownReady(c, 'Frostfire Heart', 'frostfire_stance')).toBe(false);
    expect(getCooldownReady(c, 'Frostfire Heart', 'some_other_effect')).toBe(true);
  });
});

describe('active effects', () => {
  it('replaces an effect of the same id rather than duplicating it', () => {
    let c = addActiveItemEffectToCharacter(character(), { id: 'stance', value: 1 });
    c = addActiveItemEffectToCharacter(c, { id: 'stance', value: 2 });
    expect(c.progression.activeItemEffects).toHaveLength(1);
    expect(c.progression.activeItemEffects[0].value).toBe(2);
  });

  it('removes only the named effects', () => {
    let c = addActiveItemEffectToCharacter(character(), { id: 'a' });
    c = addActiveItemEffectToCharacter(c, { id: 'b' });
    const next = removeActiveItemEffectsFromCharacter(c, ['a']);
    expect(next.progression.activeItemEffects.map(e => e.id)).toEqual(['b']);
  });

  // Scene-scoped effects used to survive until the next rest.
  it('expires scene-scoped effects at a scene boundary, keeping the others', () => {
    let c = addActiveItemEffectToCharacter(character(), { id: 'underwater_breathing', expires: 'scene' });
    c = addActiveItemEffectToCharacter(c, { id: 'pearl_memory_focus', expires: 'next_matching_check' });

    const next = clearSceneItemEffectsFromCharacter(c);
    expect(next.progression.activeItemEffects.map(e => e.id)).toEqual(['pearl_memory_focus']);
  });

  it('returns the same object when there is nothing scene-scoped to clear', () => {
    const c = addActiveItemEffectToCharacter(character(), { id: 'x', expires: 'next_matching_check' });
    expect(clearSceneItemEffectsFromCharacter(c)).toBe(c);
  });

  it('rest clears both temporary penalties and active effects', () => {
    let c = addTemporarySkillPenaltyToCharacter(character(), 'lore', 1);
    c = addActiveItemEffectToCharacter(c, { id: 'stance', expires: 'scene' });

    const rested = applyRewardRestRecovery(c);
    expect(rested.progression.temporarySkillPenalties).toEqual({});
    expect(rested.progression.activeItemEffects).toEqual([]);
  });

  it('accumulates repeated skill penalties', () => {
    let c = addTemporarySkillPenaltyToCharacter(character(), 'lore', 1);
    c = addTemporarySkillPenaltyToCharacter(c, 'lore', 1);
    expect(c.progression.temporarySkillPenalties.lore).toBe(2);
  });
});

describe('passive gear bonuses', () => {
  it("applies Saint Orra's Veil only to its own skills, and only when equipped", () => {
    const equipped = character({ equipment: { head: "Saint Orra's Veil +3" } });
    expect(getPassiveRewardSkillBonus(equipped, 'insight').bonus).toBe(3);
    expect(getPassiveRewardSkillBonus(equipped, 'brawling').bonus).toBe(0);

    const carried = character({ inventory: ["Saint Orra's Veil +3"] });
    expect(getPassiveRewardSkillBonus(carried, 'insight').bonus).toBe(0);
  });

  it('applies the Living Thorn Charm to its wilderness skills', () => {
    const c = character({ equipment: { neck: 'Living Thorn Charm' } });
    expect(getPassiveRewardSkillBonus(c, 'tracking').bonus).toBe(1);
  });

  it('stacks bonuses from different equipped items', () => {
    const c = character({
      equipment: { neck: 'Amulet of Tide-Taming', backpack: 'Masterwork Tool Kit +2' },
    });
    expect(getPassiveRewardSkillBonus(c, 'survival').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(c, 'crafting').bonus).toBe(2);
  });
});

describe('affinity-gated effects', () => {
  it('matches the character element', () => {
    expect(characterHasAffinity(character({ element: 'fire' }), 'fire')).toBe(true);
    expect(characterHasAffinity(character({ element: 'water' }), 'fire')).toBe(false);
  });

  it('raises Glass Thorn poison chance for water characters', () => {
    const dry = getRewardWeaponProfile('Glass Thorn Dagger', character({ element: 'earth' }));
    const wet = getRewardWeaponProfile('Glass Thorn Dagger', character({ element: 'water' }));
    expect(dry.effects.find(e => e.type === 'poison').chance).toBe(0.5);
    expect(wet.effects.find(e => e.type === 'poison').chance).toBe(0.75);
  });

  it('gives the Black-Crown fire arrow only to fire characters', () => {
    const fire = getRewardWeaponProfile('Black-Crown Longbow', character({ element: 'fire' }));
    const earth = getRewardWeaponProfile('Black-Crown Longbow', character({ element: 'earth' }));
    expect(fire.effects.some(e => e.effectId === 'fire_arrow')).toBe(true);
    expect(earth.effects.some(e => e.effectId === 'fire_arrow')).toBe(false);
    expect(fire.damageBonus).toBe(3); // +1 base, +2 fire
    expect(earth.damageBonus).toBe(1);
  });

  it('shortens the Basalt Warhammer recharge for fire characters', () => {
    const fire = getRewardWeaponProfile('Basalt Warhammer +2', character({ element: 'fire' }));
    const earth = getRewardWeaponProfile('Basalt Warhammer +2', character({ element: 'earth' }));
    expect(fire.effects.find(e => e.effectId === 'fire_core_strike').reset).toBe('8_hours');
    expect(earth.effects.find(e => e.effectId === 'fire_core_strike').reset).toBe('rest');
  });

  it('drops the cooldown effect once it has been spent', () => {
    const spent = setItemCooldownOnCharacter(
      character({ element: 'fire' }), 'Basalt Warhammer +2', 'fire_core_strike', 'rest'
    );
    const profile = getRewardWeaponProfile('Basalt Warhammer +2', spent);
    expect(profile.effects.some(e => e.effectId === 'fire_core_strike')).toBe(false);
    expect(profile.damageBonus).toBe(0);
  });
});

describe('target-specific weapon effects', () => {
  it('adds Dawnbound damage against pact-bound growth', () => {
    const c = character({ element: 'earth' });
    const vsRoot = getRewardWeaponProfile('Dawnbound Sickle +3', c, { name: 'Root-Heart Thrall' });
    const vsGuard = getRewardWeaponProfile('Dawnbound Sickle +3', c, { name: 'Town Guard' });
    expect(vsRoot.damageBonus).toBe(2);
    expect(vsGuard.damageBonus).toBe(0);
  });

  it('fires the starfall shot only against astral-type targets', () => {
    const c = character({ element: 'air', inventory: ['Starfall Bowstring +3'] });
    const vsWraith = getRewardWeaponProfile('Sky-Stalker Composite Bow +2', c, { name: 'Wraith' });
    const vsBoar = getRewardWeaponProfile('Sky-Stalker Composite Bow +2', c, { name: 'Wild Boar' });
    expect(vsWraith.effects.some(e => e.effectId === 'starfall_shot')).toBe(true);
    expect(vsBoar.effects.some(e => e.effectId === 'starfall_shot')).toBe(false);
  });
});

describe('gear recovery after death', () => {
  it('covers every adventure', () => {
    expect(Object.keys(ADVENTURE_GEAR_RECOVERY)).toHaveLength(18);
  });

  it('has human killers carry the gear', () => {
    const r = resolveGearRecovery('saltblood_mines', 'Threx');
    expect(r.mode).toBe('carrier');
    expect(r.location).toBe("Threx's Office");
  });

  it('leaves beast and undead kills at a marked site', () => {
    expect(resolveGearRecovery('blackroot_hollow', 'Mother Silken').mode).toBe('cache');
    expect(resolveGearRecovery('frostfire_crypt', 'Kaelen-Ghar (Wraith)').mode).toBe('cache');
  });

  it('matches killers named loosely by the GM', () => {
    const r = resolveGearRecovery('greywash_bandit_crown', 'Tamsin Crowe, the Bandit Crown');
    expect(r.killer).toBe('Tamsin Crowe');
  });

  it('falls back to the adventure cache site for an unknown killer', () => {
    const r = resolveGearRecovery('ashveil_keep', 'Some Wandering Thing');
    expect(r.mode).toBe('cache');
    expect(r.location).toBe('Great Hall');
  });

  it('lets carriers move sooner than caches scatter', () => {
    const carrier = resolveGearRecovery('greywash_bandit_crown', 'Tamsin Crowe');
    const cache = resolveGearRecovery('blackroot_hollow', 'Mother Silken');
    expect(carrier.movesAfterHours).toBeLessThan(cache.movesAfterHours);
  });

  it('returns null for an unknown adventure', () => {
    expect(resolveGearRecovery('not_an_adventure', 'x')).toBeNull();
  });
});
