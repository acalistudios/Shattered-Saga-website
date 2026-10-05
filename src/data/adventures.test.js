import { describe, expect, it } from 'vitest';
import { ADVENTURES_LIST } from './adventures';
import { SKILLS_LIST } from './gms';

const skillIds = new Set(SKILLS_LIST.map(skill => skill.id));
const difficulties = ['novice', 'professional', 'veteran', 'legendary'];

describe('authored adventure room contracts', () => {
  it('has unique adventure IDs', () => {
    expect(new Set(ADVENTURES_LIST.map(adventure => adventure.id)).size).toBe(ADVENTURES_LIST.length);
  });
  it.each(ADVENTURES_LIST)('$id has usable choices and artwork metadata for each authored room', adventure => {
    expect(adventure.settings.length).toBeGreaterThan(0);
    for (const room of adventure.settings) {
      expect(adventure.settingDescriptions[room], room).toBeTruthy();
      const choices = adventure.settingChoices[room];
      expect(choices, room).toHaveLength(3);
      for (const choice of choices) {
        expect(choice.text.trim().length).toBeGreaterThan(10);
        expect(skillIds.has(choice.skill), `${room}: ${choice.skill}`).toBe(true);
        expect(difficulties).toContain(choice.difficulty);
      }
      expect(adventure.settingImages[room]).toMatch(new RegExp(`^/images/adventures/${adventure.id}/[^/]+\\.(webp|png|jpg)$`));
    }
  });
  it('grounds Ashveil opening choices in the named NPCs and missing children', () => {
    const adventure = ADVENTURES_LIST.find(entry => entry.id === 'ashveil_keep');
    const text = adventure.settingChoices['Ashveil Village Square'].map(choice => choice.text).join(' ');
    expect(text).toContain('Martha'); expect(text).toContain('Vance'); expect(text).toContain('children');
    expect(text).not.toContain('locks, seams');
    expect(adventure.startingPrompt).not.toContain('Ask the player');
  });
});
