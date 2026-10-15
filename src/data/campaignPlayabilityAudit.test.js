import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ADVENTURES_LIST } from './adventures';
import { ADVENTURE_PROGRESSION_METADATA, ADVENTURE_CHOICE_DIFFICULTY_CURVES } from './adventureProgression';
import { SKILLS_LIST } from './gms';
import {
  rollAttributePrimary,
  rollAttributeSecondary,
  rollSkillRanks,
  rollResistance,
} from '../utils/ai';

// 4 Standard Archetypes for Simulation
const ARCHETYPES = {
  soldier: {
    name: 'Soldier (Martial / Tough)',
    primaryAttr: 'power',
    attributes: { power: 4, coordination: 3, vigor: 3, willpower: 2, intellect: 1, charisma: 1, attunement: 1, empathy: 1 },
    skills: { heavy_weapons: 2, blocking: 2, athletics: 2, leadership: 1, intimidation: 1 },
  },
  duelist: {
    name: 'Duelist (Agile / Precision)',
    primaryAttr: 'coordination',
    attributes: { power: 2, coordination: 4, vigor: 2, willpower: 2, intellect: 2, charisma: 2, attunement: 1, empathy: 1 },
    skills: { light_weapons: 2, acrobatics: 2, insight: 1, brawling: 1, deception: 1 },
  },
  cleric: {
    name: 'Cleric (Holy / Resolute)',
    primaryAttr: 'willpower',
    attributes: { power: 2, coordination: 2, vigor: 2, willpower: 4, intellect: 2, charisma: 2, attunement: 1, empathy: 3 },
    skills: { divine_communion: 2, divine_manifestation: 2, healing: 2, lore: 1, leadership: 1 },
  },
  scholar: {
    name: 'Scholar (Mental / Occult)',
    primaryAttr: 'intellect',
    attributes: { power: 1, coordination: 2, vigor: 1, willpower: 3, intellect: 4, charisma: 2, attunement: 3, empathy: 2 },
    skills: { lore: 3, languages: 2, insight: 2, arcane_drawing: 1, appraise: 1 },
  },
};

// Skill classification
const PHYSICAL_SKILLS = new Set([
  'heavy_weapons', 'light_weapons', 'brawling', 'athletics', 'acrobatics', 'blocking', 'thrown_weapons', 'archery'
]);
const MENTAL_SKILLS = new Set([
  'lore', 'languages', 'insight', 'perception', 'arcane_drawing', 'arcane_shaping',
  'divine_communion', 'divine_manifestation', 'tracking', 'survival', 'herbalism',
  'appraise', 'trapping', 'lockpicking', 'alchemy', 'healing'
]);
const SOCIAL_SKILLS = new Set([
  'negotiation', 'deception', 'intimidation', 'leadership', 'empathy', 'perform'
]);

function getSkillCategory(skillId) {
  if (PHYSICAL_SKILLS.has(skillId)) return 'Physical';
  if (SOCIAL_SKILLS.has(skillId)) return 'Social';
  if (MENTAL_SKILLS.has(skillId)) return 'Mental';
  return 'Utility';
}

function simulateCheck(char, skillId, difficulty, iterations = 1000) {
  const skillObj = SKILLS_LIST.find(s => s.id === skillId);
  const primaryAttr = skillObj?.primary || 'power';
  const secondaryAttr = skillObj?.secondary || 'coordination';

  const pScore = char.attributes[primaryAttr] || 1;
  const sScore = char.attributes[secondaryAttr] || 1;
  const ranks = char.skills[skillId] || 0;

  let successes = 0;
  for (let i = 0; i < iterations; i++) {
    const roll = rollAttributePrimary(pScore) + rollAttributeSecondary(sScore) + rollSkillRanks(ranks);
    const dc = rollResistance(difficulty);
    if (roll >= dc) successes++;
  }
  return successes / iterations;
}

describe('18-Adventure Campaign Playability and Challenge Audit', () => {
  it('audits all 18 adventures and writes a comprehensive report', () => {
    const report = {
      summary: {
        totalAdventures: ADVENTURES_LIST.length,
        tiers: { 1: 0, 2: 0, 3: 0, 4: 0 },
        totalRooms: 0,
        skillCategoryCounts: { Physical: 0, Mental: 0, Social: 0, Utility: 0 },
      },
      adventures: [],
    };

    for (const adventure of ADVENTURES_LIST) {
      const prog = ADVENTURE_PROGRESSION_METADATA[adventure.id] || {};
      const tier = prog.tier || 1;
      report.summary.tiers[tier]++;

      const advData = {
        id: adventure.id,
        name: adventure.name,
        tier,
        campaignOrder: prog.campaignOrder || 0,
        element: adventure.element,
        threatProfile: prog.threatProfile || 'unknown',
        combatExpectation: prog.combatExpectation || 'unknown',
        difficultyNotes: prog.difficultyNotes || '',
        roomCount: adventure.settings.length,
        rooms: [],
        bossAudit: [],
        archetypeSimulations: {
          soldier: { roomPassRates: [] },
          duelist: { roomPassRates: [] },
          cleric: { roomPassRates: [] },
          scholar: { roomPassRates: [] },
        },
      };

      report.summary.totalRooms += adventure.settings.length;

      // 1. Audit Rooms & Choices
      for (const room of adventure.settings) {
        const choices = adventure.settingChoices[room] || [];
        const roomData = {
          name: room,
          choices: choices.map((c, idx) => {
            const cat = getSkillCategory(c.skill);
            report.summary.skillCategoryCounts[cat] = (report.summary.skillCategoryCounts[cat] || 0) + 1;
            return {
              text: c.text,
              skill: c.skill,
              category: cat,
              difficulty: c.difficulty,
            };
          }),
        };
        advData.rooms.push(roomData);

        // 2. Simulate Archetype Performance in this Room
        for (const [archKey, char] of Object.entries(ARCHETYPES)) {
          // Player picks the best choice for their build in this room
          let bestChoiceWinRate = 0;
          let bestChoiceSkill = '';

          for (const choice of choices) {
            const winRate = simulateCheck(char, choice.skill, choice.difficulty, 500);
            if (winRate > bestChoiceWinRate) {
              bestChoiceWinRate = winRate;
              bestChoiceSkill = choice.skill;
            }
          }

          advData.archetypeSimulations[archKey].roomPassRates.push({
            room,
            bestSkill: bestChoiceSkill,
            winRate: Math.round(bestChoiceWinRate * 100),
          });
        }
      }

      // Calculate aggregate pass rate for each archetype across all rooms of this adventure
      for (const [archKey, sim] of Object.entries(advData.archetypeSimulations)) {
        const rates = sim.roomPassRates.map(r => r.winRate);
        sim.averageOptimalPassRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
        sim.minRoomPassRate = Math.min(...rates);
      }

      // 3. Audit Bosses & Major Threat NPCs
      const bossNpcs = (adventure.npcs || []).filter(npc => {
        const role = (npc.role || '').toLowerCase();
        const desc = (npc.desc || '').toLowerCase();
        return (
          role.includes('boss') ||
          role.includes('demon') ||
          role.includes('guardian') ||
          role.includes('trial') ||
          role.includes('lord') ||
          role.includes('leader') ||
          role.includes('champion') ||
          role.includes('beast') ||
          (npc.stats && npc.stats.HP >= 20)
        );
      });

      for (const boss of bossNpcs) {
        const special = boss.special || '';
        const armor = boss.armor || '';
        const weaknesses = boss.weaknesses || [];
        const attacks = boss.stats?.attacks || [];

        const hasImmunityOrGimmick =
          armor.toLowerCase().includes('incorporeal') ||
          armor.toLowerCase().includes('cannot be harmed') ||
          armor.toLowerCase().includes('immune') ||
          special.toLowerCase().includes('incorporeal') ||
          special.toLowerCase().includes('cannot be harmed');

        advData.bossAudit.push({
          name: boss.name,
          role: boss.role,
          hp: boss.stats?.HP || 0,
          attacks: attacks.map(a => `${a.name} (${a.damage})`),
          armor: boss.armor || 'Standard',
          hasImmunityOrGimmick,
          special: special || 'None',
          weaknesses,
        });
      }

      report.adventures.push(advData);
    }

    // Sort adventures by campaignOrder
    report.adventures.sort((a, b) => a.campaignOrder - b.campaignOrder);

    // Save JSON audit log to artifacts scratch directory
    const artifactDir = 'C:\\Users\\hansi\\.gemini\\antigravity\\brain\\d917b103-4655-435d-9a0d-cf433fb73ff2\\scratch';
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
    const outputPath = path.join(artifactDir, 'campaign_18_adventures_audit.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`Campaign Audit Complete: Saved to ${outputPath}`);
  });
});
