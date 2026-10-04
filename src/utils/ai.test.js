import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateCompletion } from './ai';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('offline sandbox isolation', () => {
  it.each(['air', 'earth', 'fire', 'water', 'aether'])('keeps %s PCs in the authored room without network calls', async element => {
    vi.useFakeTimers();
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const resultPromise = generateCompletion({
      provider: 'gemini', sandboxMode: true,
      systemPrompt: 'Authored Ashveil story',
      history: [{ role: 'user', content: 'Ask Martha about Oswin' }],
      characterData: { name: 'Test Hero', element },
      currentSituation: 'Ashveil Village Square',
    });
    await vi.runAllTimersAsync();
    const result = await resultPromise;
    expect(fetch).not.toHaveBeenCalled();
    expect(result.error).toBeNull();
    expect(result.totalTokens).toBe(0);
    expect(result.text).toContain('[Offline sandbox]');
    expect(result.text).toContain('Ashveil Village Square');
    expect(result.text).not.toMatch(/\[(location|objective_complete|add_item|currency|adventure_complete):/);
  });

  it('reports missing real credentials instead of silently using a mock or third party', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const result = await generateCompletion({ provider: 'gemini', history: [], sandboxMode: false });
    expect(result.error).toContain('Sign in');
    expect(result.text).toBe('');
    expect(fetch).not.toHaveBeenCalled();
  });
});
