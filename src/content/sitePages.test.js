import { describe, expect, it } from 'vitest';
import fs from 'fs';
import { buildSitePages, markdownToHtml, esc } from './sitePages';
import { ADVENTURES_LIST } from '../data/adventures';

const rules = fs.readFileSync('src/data/GAME_RULES.md', 'utf8');
const site = buildSitePages(rules);
const page = (path) => site.pages.find(p => p.path === path);
const text = (html) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('crawlable site pages', () => {
  it('has a page for every adventure, the index, peoples and the manual', () => {
    for (const a of ADVENTURES_LIST.filter(x => x.settings?.length)) expect(page(`/adventures/${a.id}/`), a.id).toBeTruthy();
    for (const p of ['/adventures/', '/peoples/', '/rules/']) expect(page(p), p).toBeTruthy();
  });

  it('every page carries real reading content, not an empty shell', () => {
    for (const p of site.pages) {
      expect(text(p.html).split(' ').length, p.path).toBeGreaterThan(250);
      expect(p.html).toContain(`<link rel="canonical" href="https://shatteredsaga.com${p.path}">`);
      expect(p.html).toMatch(/<meta name="description" content="[^"]{20,}">/);
    }
  });

  it('only uses images that exist', () => {
    for (const p of site.pages) {
      for (const [, src] of p.html.matchAll(/<img src="([^"]+)"/g)) expect(fs.existsSync(`public${src}`), `${p.path} ${src}`).toBe(true);
    }
  });

  it('lists every page in the sitemap and points robots.txt at it', () => {
    for (const p of site.pages) expect(site.sitemap).toContain(`<loc>https://shatteredsaga.com${p.path}</loc>`);
    expect(site.robots).toContain('Sitemap: https://shatteredsaga.com/sitemap.xml');
  });

  it('escapes text and renders the manual', () => {
    expect(esc('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;');
    expect(markdownToHtml('## Title\n- one\n- **two**\n\ntext')).toBe('<h2>Title</h2>\n<ul>\n<li>one</li>\n<li><strong>two</strong></li>\n</ul>\n<p>text</p>');
    expect(page('/rules/').html).not.toContain('Do not edit by hand');
  });

  it('the landing page text names the real adventure count', () => {
    expect(site.home).toContain(`${ADVENTURES_LIST.filter(a => a.settings?.length && !a.isPatrol && !a.isArena).length} adventures`);
  });
});
