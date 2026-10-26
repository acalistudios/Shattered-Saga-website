import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AdventureSelection from './AdventureSelection';

describe('exhausted map recovery access', () => {
  it.each([{ hp: 1, fatigue: 10 }, { hp: 20, fatigue: -3 }])('keeps unlocked region accessible at %j', stats => {
    const html = renderToStaticMarkup(<AdventureSelection character={{
      name: 'Map QA', element: 'fire', stats: { level: 1, maxHp: 20, maxFatigue: 15, ...stats },
      inventory: [], attributes: {}, skills: {},
    }} />);
    expect(html).toContain('Enter Region Map');
    expect(html).not.toContain('Rest Required');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Road Patrol/);
  });
});
