import { describe, it, expect } from 'vitest';
import { getArmorPieces, getArmorPieceType, describeGear, getWeaponType, getParryDie, traitDamageMods } from '../data/gearStats';
import { mundaneImmunityFromArmor, mundaneDamageFactor, isMentalAttack, rollEnemyDefense } from './enemyDefense';
import { getAttackPenalty } from './combatModifiers';
import { getCombatSheet } from './combatSheet';

const hero = (over = {}) => ({
  attributes: { coordination: 3, power: 3, vigor: 3, willpower: 2, empathy: 2 },
  skills: { light_weapons: 2, acrobatics: 2, blocking: 2 },
  equipment: { hand_right: 'Steel Sword', hand_left: 'Iron Shield', body: 'Leather Armor' },
  inventory: [],
  stats: { hp: 16, maxHp: 16, fatigue: 15, maxFatigue: 15 },
  daysWithoutFood: 0,
  ...over,
});

describe('armour pieces', () => {
  it('counts metal and leather pieces in the helm/legs/feet/hands slots only', () => {
    expect(getArmorPieceType('Iron Plate Helm')).toBe('metal');
    expect(getArmorPieceType('Leather Boots')).toBe('leather');
    expect(getArmorPieceType('Mage Hood')).toBeNull();
    expect(getArmorPieceType('Iron Key')).toBeNull();
    expect(getArmorPieces({ head: 'Iron Plate Helm', legs: 'Plate Greaves', feet: 'Steel Sabatons', hands: 'Plate Gauntlets' }))
      .toEqual({ metal: 4, leather: 0, soak: 2, dodgePenalty: -2, blockPenalty: -1 });
    expect(getArmorPieces({ head: 'Leather Helmet', legs: 'Leather Pants', feet: 'Leather Boots', hands: 'Leather Gloves' }))
      .toMatchObject({ soak: 1, dodgePenalty: 0 });
    expect(getArmorPieces({ head: 'Iron Plate Helm' })).toMatchObject({ soak: 0, dodgePenalty: 0 });
    expect(describeGear('Plate Greaves')).toContain('Metal armour piece');
  });
});

describe('mundane immunity', () => {
  it('reads immune and resistant foes from their armour text', () => {
    expect(mundaneImmunityFromArmor('Incorporeal shadow; ignores mundane physical damage until weakened by the seal')).toBe('immune');
    expect(mundaneImmunityFromArmor('Projection; immune to physical damage.')).toBe('immune');
    expect(mundaneImmunityFromArmor('Incorporeal frostfire armor; mundane attacks are reduced unless braziers are lit')).toBe('resistant');
    expect(mundaneImmunityFromArmor('Chain coat, medium armor soak 1d4')).toBeNull();
  });

  it('blocks mundane steel until weakened, never magic', () => {
    const ghost = { name: 'Malachar', mundaneImmunity: 'immune' };
    expect(mundaneDamageFactor(ghost).factor).toBe(0);
    expect(mundaneDamageFactor(ghost, { magical: true }).factor).toBe(1);
    expect(mundaneDamageFactor({ ...ghost, weakened: true }).factor).toBe(1);
    expect(mundaneDamageFactor({ name: 'Wraith', mundaneImmunity: 'resistant' }).factor).toBe(0.5);
    expect(mundaneDamageFactor({ name: 'Guard' }).factor).toBe(1);
  });
});

describe('resist and attack penalties', () => {
  it('routes curses and terror to Resist', () => {
    expect(isMentalAttack({ vsSkill: 'Will' })).toBe(true);
    expect(isMentalAttack({ vsSkill: 'Dodge or Block' })).toBe(false);
  });

  it('applies hunger and exhaustion to attacks', () => {
    expect(getAttackPenalty(hero()).total).toBe(0);
    const tired = getAttackPenalty(hero({ daysWithoutFood: 2, stats: { fatigue: -1, maxFatigue: 15 } }));
    expect(tired.total).toBe(-4);
    expect(tired.text).toBe('hunger -2, exhaustion -2');
  });
});

describe('weapon traits', () => {
  it('gives each new weapon its trait and keeps names matched to the right type', () => {
    expect(getWeaponType('Battle Axe')).toMatchObject({ key: 'battleaxe', dice: '1d12', hands: 2, hitMod: -1 });
    expect(getWeaponType('Greataxe').key).toBe('battleaxe');
    expect(getWeaponType('Hand Axe').key).toBe('axe');
    expect(getWeaponType('Short Bow')).toMatchObject({ quick: { strikes: 2, hit: -2 } });
    expect(getWeaponType('Hunting Bow').key).toBe('bow');
    expect(getWeaponType('Crossbow')).toMatchObject({ reload: true, armorPierce: 2, dice: '1d10+1' });
    expect(getWeaponType('Rapier')).toMatchObject({ key: 'rapier', hitMod: 1 });
    expect(getWeaponType('Flail')).toMatchObject({ ignoresShield: true, hitMod: -1 });
    expect(getWeaponType('Warhammer').crushing).toBe(1);
    expect(getWeaponType('Pit Trident').reach).toBe(1);
    expect(getParryDie('Halberd')).toBe(6);
  });

  it('applies crushing only against armoured foes, and pierce always', () => {
    expect(traitDamageMods(getWeaponType('Mace'), '1d3')).toEqual({ damage: 0, pierce: 0 });
    expect(traitDamageMods(getWeaponType('Mace'), '1d4')).toEqual({ damage: 2, pierce: 0 });
    expect(traitDamageMods(getWeaponType('Crossbow'), '1d3')).toEqual({ damage: 0, pierce: 2 });
  });

  it('lets a flail ignore an enemy shield', () => {
    const enemy = { style: 'shield', shield: 'Iron Shield', defenses: { dodge: '5', block: '10' } };
    expect(rollEnemyDefense(enemy, 'none', Number).roll).toBe(13);
    expect(rollEnemyDefense(enemy, 'none', Number, { ignoreShield: true }).roll).toBe(10);
  });

  it('shows a short bow as two shots and a rapier with its +1', () => {
    expect(getCombatSheet(hero({ equipment: { hand_right: 'Short Bow' } }))).toMatchObject({ attacksPerAction: 2 });
    expect(getCombatSheet(hero({ equipment: { hand_right: 'Rapier' } })).attacks[0].hitMod).toBe(1);
  });
});

describe('combat stats panel numbers', () => {
  it('summarises a sword-and-shield fighter', () => {
    const s = getCombatSheet(hero());
    expect(s.style.key).toBe('shield');
    expect(s.attacksPerAction).toBe(1);
    expect(s.attacks[0]).toMatchObject({ weapon: 'Steel Sword', damage: '1d8', hitAvg: 12 });
    expect(s.soak).toMatchObject({ avg: 2 });
    expect(s.dodge.avg).toBe(10);
    expect(s.block).toMatchObject({ avg: 13, soak: '1d6 shield' });
  });

  it('renders the panel with every row', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { createElement } = await import('react');
    const { default: CombatStatsPanel } = await import('../components/CombatStatsPanel.jsx');
    const html = renderToStaticMarkup(createElement(CombatStatsPanel, { character: hero({ daysWithoutFood: 1 }) }));
    for (const text of ['Combat Stats', 'Shield fighter', 'Attacks per action', 'Steel Sword', 'to hit', 'Armour soak', 'Dodge', 'Block', 'Resist (Willpower)', 'Penalties now: hunger -1']) {
      expect(html).toContain(text);
    }
  });

  it('shows two attacks when dual wielding', () => {
    const s = getCombatSheet(hero({ equipment: { hand_right: 'Steel Sword', hand_left: 'Dagger' } }));
    expect(s.attacksPerAction).toBe(2);
    expect(s.attacks.map((a) => a.hitMod)).toEqual([-1, -1]);
  });
});
