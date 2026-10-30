import { describe, expect, it } from 'vitest';
import { splitNarrationHighlights } from './narrationHighlights';

describe('narration highlights', () => {
  it('highlights destinations and decision questions without changing text', () => {
    const text = "From Martha’s Provisions, you hear weeping. Vance's Forge is open. Where do you go first?";
    const parts = splitNarrationHighlights(text, ["Martha's Provisions", "Vance's Forge"]);
    expect(parts.map(p => p.text).join('')).toBe(text);
    expect(parts.filter(p => p.kind === 'destination')).toHaveLength(2);
    expect(parts.find(p => p.kind === 'question')?.text).toBe('Where do you go first?');
  });
  it('does not nest destination highlights within a question', () => {
    expect(splitNarrationHighlights('Enter Ashveil Keep?', ['Ashveil Keep'])).toEqual([
      { text: 'Enter Ashveil Keep?', kind: 'question' },
    ]);
  });
  it('escapes regex symbols and preserves arbitrary markup as text', () => {
    const text = '<img src=x onerror=alert(1)> A+B';
    expect(splitNarrationHighlights(text, ['A+B']).map(p => p.text).join('')).toBe(text);
    expect(splitNarrationHighlights(text, ['A+B']).at(-1).kind).toBe('destination');
  });
});
