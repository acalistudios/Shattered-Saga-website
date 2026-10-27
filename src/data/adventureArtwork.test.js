import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ADVENTURES_LIST } from './adventures';

describe('adventure preview artwork', () => {
  it.each(ADVENTURES_LIST)('$id uses an existing opening scene rather than a GM portrait', adventure => {
    const openingImage = adventure.settingImages[adventure.settings[0]];
    expect(adventure.artwork).toBe(openingImage);
    expect(existsSync(resolve('public', openingImage.slice(1)))).toBe(true);
  });
});
