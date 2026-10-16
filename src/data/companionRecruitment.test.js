import { describe, it, expect } from 'vitest';
import { COMPANIONS, getCompanionById, getPartingBoon, getCompanionsForAdventure } from './companions';
import { ADVENTURES_LIST } from './adventures';
import { ADVENTURE_SETTING_METADATA } from './adventureEnhancements';
import { ADVENTURE_ECONOMY_METADATA } from './adventureEconomy';
import { getPassiveRewardSkillBonus } from '../utils/rewardEngine';
import { SKILLS_LIST } from './gms';

const EXPECTED_PAIRS = [
  { adventureId: 'ashveil_keep', companionId: 'skritt_goblin', expectedItem: "Skritt's Lockpick Shim" },
  { adventureId: 'saltblood_mines', companionId: 'kaelen_miner', expectedItem: "Kaelen's Tempered Sledge" },
  { adventureId: 'blackroot_hollow', companionId: 'silas_hound', expectedItem: "Silas's Bone Fang" },
  { adventureId: 'merrin_abbey_plague_bells', companionId: 'sister_maren', expectedItem: 'Consecrated Healing Draught' },
  { adventureId: 'clockwork_conservatory', companionId: 'cogtail_familiar', expectedItem: 'Clockwork Mainspring' },
];

const VALID_SKILL_IDS = new Set(SKILLS_LIST.map(s => s.id));

describe('Companion Recruitment and Lifecycle (Model A)', () => {
  it('registers all 5 canonical companions with parting boons and verified local merchants', () => {
    expect(COMPANIONS).toHaveLength(5);

    for (const pair of EXPECTED_PAIRS) {
      const comp = getCompanionById(pair.companionId);
      expect(comp, `Companion ${pair.companionId} should exist`).toBeDefined();
      expect(comp.adventureId).toBe(pair.adventureId);
      expect(comp.skills.length).toBeGreaterThan(0);
      expect(comp.assistBonus).toBe(1);

      const boon = getPartingBoon(pair.companionId);
      expect(boon, `Boon for ${pair.companionId} should exist`).toBeDefined();
      expect(boon.partingTitle).toBeTruthy();
      expect(boon.partingNarrative).toBeTruthy();
      expect(boon.rewardItem).toBe(pair.expectedItem);
      expect(boon.reputation).toBeDefined();
      expect(boon.reputation.faction).toBeTruthy();
      expect(boon.reputation.amount).toBeGreaterThan(0);

      // Verify concrete local merchants exist in the corresponding adventure economy
      expect(Array.isArray(boon.reputation.merchants)).toBe(true);
      expect(boon.reputation.merchants.length).toBeGreaterThan(0);

      const adventureEcon = ADVENTURE_ECONOMY_METADATA[pair.adventureId];
      expect(adventureEcon, `Economy metadata must exist for ${pair.adventureId}`).toBeDefined();
      const availableMerchantNames = (adventureEcon.merchants || []).map(m => m.name);
      for (const merchantName of boon.reputation.merchants) {
        expect(
          availableMerchantNames,
          `Boon merchant "${merchantName}" should be recognized in ${pair.adventureId} economy`
        ).toContain(merchantName);
      }
    }

    // Silas-specific animal roll bonus
    const silasBoon = getPartingBoon('silas_hound');
    expect(silasBoon.animalBonus).toBe(1);
    expect(silasBoon.itemDetails.desc).toContain('all rolls involving animals');

    // Sister Maren-specific local NPC social bonus
    const marenBoon = getPartingBoon('sister_maren');
    expect(marenBoon.localNpcSocialBonus).toBe(1);
    expect(marenBoon.itemDetails.desc).toContain('all social skill checks with local NPCs');
  });

  it('maps each origin adventure to its corresponding companion', () => {
    for (const pair of EXPECTED_PAIRS) {
      const companions = getCompanionsForAdventure(pair.adventureId);
      expect(companions).toHaveLength(1);
      expect(companions[0].id).toBe(pair.companionId);
    }

    // Adventures without designated companions return an empty array
    expect(getCompanionsForAdventure('sunken_spire')).toEqual([]);
    expect(getCompanionsForAdventure('obsidian_vault')).toEqual([]);
  });

  it('includes companion NPCs in origin adventure profiles', () => {
    for (const pair of EXPECTED_PAIRS) {
      const adv = ADVENTURES_LIST.find(a => a.id === pair.adventureId);
      expect(adv, `Adventure ${pair.adventureId} must exist`).toBeDefined();
      expect(Array.isArray(adv.npcs)).toBe(true);

      const comp = getCompanionById(pair.companionId);
      const npcMatch = adv.npcs.find(npc => 
        npc.name.toLowerCase().includes(comp.name.split(' ')[0].toLowerCase())
      );
      expect(npcMatch, `NPC profile matching ${comp.name} must exist in ${pair.adventureId}`).toBeDefined();
    }
  });

  it('provides bespoke recruitment choices with [recruit_companion] tag in origin rooms', () => {
    for (const pair of EXPECTED_PAIRS) {
      const metadata = ADVENTURE_SETTING_METADATA[pair.adventureId];
      expect(metadata, `Metadata must exist for ${pair.adventureId}`).toBeDefined();
      expect(metadata.settingChoices, `Setting choices must exist for ${pair.adventureId}`).toBeDefined();

      let recruitmentFound = false;
      let recruitmentRoom = null;

      for (const [room, choices] of Object.entries(metadata.settingChoices)) {
        // Enforce the strict 3-choice room contract
        expect(choices.length, `Room "${room}" in ${pair.adventureId} must contain exactly 3 choices`).toBe(3);

        for (const choice of choices) {
          expect(choice.text).toBeTruthy();
          expect(VALID_SKILL_IDS.has(choice.skill), `Choice in ${room} must have a valid skill: ${choice.skill}`).toBe(true);
          expect(['novice', 'professional', 'veteran', 'legendary']).toContain(choice.difficulty);

          if (choice.text.includes(`[recruit_companion: ${pair.companionId}]`)) {
            recruitmentFound = true;
            recruitmentRoom = room;
          }
        }
      }

      expect(
        recruitmentFound,
        `Recruitment choice for [recruit_companion: ${pair.companionId}] must exist in an origin room of ${pair.adventureId}`
      ).toBe(true);
      expect(recruitmentRoom).toBeTruthy();
    }
  });

  it('safely handles unknown companion IDs for boons and profiles', () => {
    expect(getCompanionById('non_existent')).toBeNull();
    expect(getPartingBoon('non_existent')).toBeNull();
  });

  it('grants passive skill bonuses for carried companion parting relics', () => {
    // Silas's Bone Fang: +1 Animal Rapport and Tracking
    const silasChar = {
      equipment: {},
      inventory: ["Silas's Bone Fang"]
    };
    expect(getPassiveRewardSkillBonus(silasChar, 'animal_rapport').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(silasChar, 'tracking').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(silasChar, 'athletics').bonus).toBe(0);

    // Skritt's Lockpick Shim: +1 Thievery and Trapping
    const skrittChar = {
      equipment: {},
      inventory: ["Skritt's Lockpick Shim"]
    };
    expect(getPassiveRewardSkillBonus(skrittChar, 'thievery').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(skrittChar, 'trapping').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(skrittChar, 'insight').bonus).toBe(0);

    // Clockwork Mainspring: +1 Crafting and Arcane Drawing
    const cogtailChar = {
      equipment: {},
      inventory: ['Clockwork Mainspring']
    };
    expect(getPassiveRewardSkillBonus(cogtailChar, 'crafting').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(cogtailChar, 'arcane_drawing').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(cogtailChar, 'stealth').bonus).toBe(0);

    // Consecrated Healing Draught: +1 to social checks (Negotiation, Insight, Leadership, Empathy)
    const marenChar = {
      equipment: {},
      inventory: ['Consecrated Healing Draught']
    };
    expect(getPassiveRewardSkillBonus(marenChar, 'negotiation').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(marenChar, 'insight').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(marenChar, 'leadership').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(marenChar, 'empathy').bonus).toBe(1);
    expect(getPassiveRewardSkillBonus(marenChar, 'smithing').bonus).toBe(0);
  });
});
