// Crawlable content pages, built from the game's own data at build time
// (vite.config.js sitePagesPlugin). The game itself is a single-page app, so
// without these a crawler (and AdSense review) sees an empty shell (Hans,
// 2026-11-26: AdSense rejected the site for "screens without publisher
// content" and "low value content"). Because every page comes from the data,
// the pages grow with each release. Pure: returns strings, writes nothing.
import { ADVENTURES_LIST } from '../data/adventures';
import { WORLD_REGIONS, MAP_NODES } from '../data/cartography';
import { PEOPLES, PEOPLE_HUBS } from '../data/peoples';
import { TAVERNS } from '../data/downtimeMerchants';
import { ADVENTURE_ECONOMY_METADATA } from '../data/adventureEconomy';
import { merchantPortraitPath } from '../utils/artMoments';
import manifest from '../data/artManifest.json';

export const SITE_ORIGIN = 'https://shatteredsaga.com';
const PAINTED = new Set(manifest);

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const firstSentence = (s) => {
  const t = String(s || '').trim();
  const m = t.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : t).trim();
};

const regionName = (adventureId) => {
  const id = MAP_NODES[adventureId]?.region;
  return WORLD_REGIONS.find(r => r.id === id)?.name.replace(/^Region \d+: /, '') || '';
};

const roomImage = (adv) => {
  const img = adv.settingImages?.[adv.settings?.[0]];
  return typeof img === 'string' && img.startsWith('/images/') ? img : null;
};

const NAV = [
  ['/', 'Home'],
  ['/adventures/', 'Adventures'],
  ['/peoples/', 'Peoples'],
  ['/rules/', 'Game manual'],
];

const STYLE = `
:root{--bg:#020617;--panel:#0b1329;--gold:#f59e0b;--text:#e2e8f0;--muted:#94a3b8;--line:rgba(245,158,11,.2)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:'Outfit',system-ui,sans-serif;line-height:1.65}
a{color:var(--gold)}
header,main,footer{max-width:960px;margin:0 auto;padding:0 16px}
header{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;padding-top:20px;padding-bottom:12px;border-bottom:1px solid var(--line)}
header .brand{font-family:'Cinzel',serif;font-weight:800;font-size:1.25rem;color:var(--gold);text-decoration:none;margin-right:auto}
header nav a{color:var(--text);text-decoration:none;margin-right:14px}
.play{display:inline-block;background:var(--gold);color:#111;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none}
h1,h2,h3{font-family:'Cinzel',serif;color:#fcd34d;line-height:1.25}
h1{font-size:2rem;margin:28px 0 8px}
h2{margin-top:32px}
.lede{color:var(--muted);font-size:1.1rem}
img.hero{width:100%;height:auto;border-radius:8px;border:1px solid var(--line);margin:12px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:14px}
.card img{width:100%;height:auto;border-radius:6px}
.card h3{margin:8px 0 4px;font-size:1.05rem}
.meta{color:var(--muted);font-size:.9rem}
.people{display:flex;gap:12px;align-items:flex-start}
.people img{width:160px;flex:0 0 160px;height:auto;border-radius:6px}
footer{margin-top:48px;padding-top:16px;padding-bottom:32px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}
@media (max-width:600px){.people{flex-direction:column}.people img{width:100%;flex:none}}
`;

/** A complete standalone HTML page in the site's look. */
export function renderPage({ path, title, description, body, image }) {
  const url = SITE_ORIGIN + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${image ? `<meta property="og:image" content="${SITE_ORIGIN}${image}">\n` : ''}<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Outfit:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>${STYLE}</style>
</head>
<body>
${siteHeader()}
<main>
${body}
</main>
${siteFooter()}
</body>
</html>
`;
}

function siteHeader() {
  return `<header><a class="brand" href="/">Shattered Saga</a><nav>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav><a class="play" href="/">Play free</a></header>`;
}

function siteFooter() {
  return `<footer>Shattered Saga is a dark fantasy role-playing game in which an AI Game Master narrates your story while the game's own rules decide every roll, wound and reward. <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></footer>`;
}

function adventureCard(adv) {
  const img = roomImage(adv);
  return `<div class="card">${img ? `<a href="/adventures/${adv.id}/"><img src="${img}" alt="${esc(adv.name)}" loading="lazy" width="640" height="360"></a>` : ''}
<h3><a href="/adventures/${adv.id}/">${esc(adv.name)}</a></h3>
<div class="meta">${esc(regionName(adv.id))}${adv.element ? ` · ${esc(adv.element)} element` : ''}</div>
<p>${esc(adv.desc)}</p></div>`;
}

const playable = () => ADVENTURES_LIST.filter(a => a.settings?.length && !a.isPatrol && !a.isArena);

/** The landing page's text, placed inside #root so crawlers see it; the game replaces it on load. */
export function homeContent() {
  const advs = playable();
  return `<div style="max-width:960px;margin:0 auto;padding:24px 16px;font-family:'Outfit',sans-serif;color:#e2e8f0">
<h1 style="font-family:'Cinzel',serif;color:#fcd34d">Shattered Saga: a dark fantasy RPG with an AI Game Master</h1>
<p>Shattered Saga is a text role-playing game set in a world broken by the Shattering. You create a character, choose an elemental affinity, and play through hand-written adventures while an AI Game Master narrates every scene. The game's own rules engine rolls the dice and tracks health, fatigue, gear, wounds and rewards, so the story stays fair.</p>
<h2 style="font-family:'Cinzel',serif;color:#fcd34d">What you will find</h2>
<ul>
<li>${advs.length} adventures across four regions, from the haunted keep of Ashveil to the floating isles of the Astral Reach.</li>
<li>Peoples with their own homes and grudges: goblin clans, dwarf forge holds, elves and their restless dead, tide-folk and sky-folk.</li>
<li>Real consequences: companions who remember you, merchants who raise or lower prices, peoples who welcome or hunt you depending on what you did.</li>
<li>A full game manual covering combat, magic, armour, death and resurrection.</li>
</ul>
<p><a href="/adventures/" style="color:#f59e0b">Browse the adventures</a> · <a href="/peoples/" style="color:#f59e0b">Meet the peoples</a> · <a href="/rules/" style="color:#f59e0b">Read the game manual</a></p>
</div>`;
}

export function adventuresIndexPage() {
  const advs = playable();
  const byRegion = WORLD_REGIONS.map(r => ({ r, list: advs.filter(a => MAP_NODES[a.id]?.region === r.id) })).filter(g => g.list.length);
  const body = `<h1>Adventures</h1>
<p class="lede">Every adventure in Shattered Saga is hand-written: its places, people, secrets and endings are fixed, and the AI Game Master brings them to life. These are the ${advs.length} adventures in the game today.</p>
${byRegion.map(({ r, list }) => `<h2>${esc(r.name.replace(/^Region \d+: /, ''))}</h2><p class="meta">${esc(r.desc)}</p><div class="grid">${list.map(adventureCard).join('\n')}</div>`).join('\n')}`;
  return { path: '/adventures/', title: 'Adventures — Shattered Saga', description: `The ${advs.length} hand-written adventures of Shattered Saga, a dark fantasy RPG with an AI Game Master.`, body };
}

export function adventurePage(adv) {
  const img = roomImage(adv);
  const people = (adv.npcs || []).map(n => {
    const id = n.portrait?.id;
    const src = id ? `/images/npcs/${adv.id}/${id}.webp` : null;
    const pic = src && PAINTED.has(src) ? `<img src="${src}" alt="${esc(n.name)}" loading="lazy" width="320" height="180">` : '';
    return `<div class="card people">${pic}<div><h3>${esc(n.name)}</h3><div class="meta">${esc(n.role)}</div><p>${esc(firstSentence(n.desc))}</p></div></div>`;
  });
  const merchants = ADVENTURE_ECONOMY_METADATA[adv.id]?.merchants || [];
  const tavern = TAVERNS[adv.id];
  const places = (adv.settings || []).map(room => {
    const pic = adv.settingImages?.[room];
    return `<div class="card">${typeof pic === 'string' && pic.startsWith('/images/') ? `<img src="${pic}" alt="${esc(room)}" loading="lazy" width="640" height="360">` : ''}<h3>${esc(room)}</h3><p>${esc(adv.settingDescriptions?.[room] || '')}</p></div>`;
  });
  const body = `<h1>${esc(adv.name)}</h1>
<p class="meta">${esc(regionName(adv.id))}${adv.element ? ` · ${esc(adv.element)} element` : ''}</p>
${img ? `<img class="hero" src="${img}" alt="${esc(adv.name)}" width="1280" height="720">` : ''}
<p class="lede">${esc(adv.desc)}</p>
<h2>The story</h2>
<p>${esc(adv.backstory)}</p>
${adv.objectives?.length ? `<h2>What you must do</h2><ul>${adv.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
<h2>Places</h2>
<div class="grid">${places.join('\n')}</div>
<h2>People you will meet</h2>
<div class="grid">${people.join('\n')}</div>
${merchants.length || tavern ? `<h2>Trade and rest</h2><ul>${merchants.map(m => `<li><strong>${esc(m.name)}</strong>, ${esc(m.role)} (${esc(m.location)})${m.notes ? `: ${esc(m.notes)}` : ''}</li>`).join('')}${tavern ? `<li><strong>${esc(tavern.name)}</strong>, kept by ${esc(tavern.keeper)}: ${esc(tavern.mealName)}.</li>` : ''}</ul>` : ''}
${Object.keys(adv.rewards || {}).length ? `<h2>How it can end</h2><p>This adventure has ${Object.keys(adv.rewards).length} different endings, each with its own rewards and consequences for the rest of your campaign.</p>` : ''}
<p><a class="play" href="/">Play ${esc(adv.name)} free</a></p>`;
  return { path: `/adventures/${adv.id}/`, title: `${adv.name} — Shattered Saga adventure`, description: firstSentence(adv.desc) || adv.name, body, image: img };
}

export function peoplesPage() {
  const sections = Object.entries(PEOPLES).map(([id, p]) => {
    const hub = PEOPLE_HUBS.find(h => h.id === p.hub);
    const keeper = hub && TAVERNS[hub.id];
    const merchants = hub ? (ADVENTURE_ECONOMY_METADATA[hub.id]?.merchants || []) : [];
    const faces = [...merchants.map(m => ({ name: m.name, role: m.role, src: merchantPortraitPath(hub.id, m.portrait) })),
      ...(keeper ? [{ name: keeper.keeper, role: `keeper of ${keeper.name}`, src: merchantPortraitPath(hub.id, keeper.portrait) }] : [])]
      .filter(f => PAINTED.has(f.src));
    return `<h2 id="${id}">${esc(p.name)}</h2>
<p class="meta">${esc(WORLD_REGIONS.find(r => r.id === p.region)?.name.replace(/^Region \d+: /, '') || '')}${hub ? ` · home: ${esc(hub.name)}` : ''}</p>
<p>${esc(p.summary)}</p>
<p>How they greet you on the road depends on what you have done: a friend may be welcomed into their home, a stranger is met with caution, and someone who wronged them is hunted.</p>
${faces.length ? `<div class="grid">${faces.map(f => `<div class="card"><img src="${f.src}" alt="${esc(f.name)}" loading="lazy" width="640" height="360"><h3>${esc(f.name)}</h3><div class="meta">${esc(f.role)}</div></div>`).join('')}</div>` : ''}`;
  });
  const body = `<h1>Peoples of the Shattered World</h1>
<p class="lede">Humans are not alone in the Shattered world. These peoples have their own homes, trades and long memories, and they treat you according to what you have done.</p>
${sections.join('\n')}`;
  return { path: '/peoples/', title: 'Peoples of the Shattered World — Shattered Saga', description: 'Goblins, dwarves, elves, tide-folk and sky-folk: the peoples of Shattered Saga and how they treat the player.', body };
}

/** The player's manual (GAME_RULES.md) as HTML: headings, lists, quotes and paragraphs. */
export function markdownToHtml(md) {
  const out = [];
  let list = false;
  const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
  for (const raw of String(md).split(/\r?\n/)) {
    const line = raw.trimEnd();
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (!li && list) { out.push('</ul>'); list = false; }
    if (h) out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    else if (li) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inline(li[1])}</li>`); }
    else if (line.startsWith('>')) out.push(`<p class="meta">${inline(line.replace(/^>\s?/, ''))}</p>`);
    else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push('</ul>');
  return out.join('\n');
}

export function rulesPage(rulesMarkdown) {
  const body = markdownToHtml(String(rulesMarkdown)
    .replace(/^> Generated from.*$/m, '')
    .replace(/^# .*$/m, '# The Shattered Saga game manual'));
  return { path: '/rules/', title: 'Game manual — Shattered Saga', description: 'The complete rules of Shattered Saga: checks, combat, magic, armour, gear, companions, death and resurrection.', body };
}

/** Every content page, plus sitemap.xml and robots.txt. */
export function buildSitePages(rulesMarkdown) {
  const pages = [adventuresIndexPage(), ...playable().map(adventurePage), peoplesPage(), rulesPage(rulesMarkdown)];
  const urls = ['/', ...pages.map(p => p.path), '/privacy', '/terms'];
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_ORIGIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
  return { pages: pages.map(p => ({ ...p, html: renderPage(p) })), sitemap, robots, home: homeContent() };
}
