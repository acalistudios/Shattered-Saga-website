/** Presentation-only ranges. Text stays escaped by React, never interpreted as HTML. */
export function splitNarrationHighlights(text, destinations = []) {
  const ranges = [];
  for (const match of text.matchAll(/[^.!?\n]+\?/g)) {
    const leading = match[0].length - match[0].trimStart().length;
    ranges.push({ start: match.index + leading, end: match.index + match[0].length, kind: 'question' });
  }
  for (const destination of new Set(destinations.filter(Boolean))) {
    const escaped = destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
    for (const match of text.matchAll(new RegExp(escaped, 'gi'))) {
      const start = match.index;
      const end = start + match[0].length;
      if (!ranges.some(range => start < range.end && end > range.start)) {
        ranges.push({ start, end, kind: 'destination' });
      }
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) parts.push({ text: text.slice(cursor, range.start), kind: 'text' });
    parts.push({ text: text.slice(range.start, range.end), kind: range.kind });
    cursor = range.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), kind: 'text' });
  return parts;
}
