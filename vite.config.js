import { defineConfig, loadEnv, createServer } from 'vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// AdSense needs two things on the live site once VITE_ADSENSE_CLIENT is set:
// its ownership tag in <head> (site approval) and /ads.txt (authorised sellers).
// Both are generated from the env var so nothing ad-related ships before then.
function adsensePlugin(client) {
  return {
    name: 'shattered-saga-adsense',
    transformIndexHtml(html) {
      if (!client) return html
      return html.replace('</head>', `    <meta name="google-adsense-account" content="${client}" />\n  </head>`)
    },
    generateBundle() {
      if (!client) return
      this.emitFile({
        type: 'asset',
        fileName: 'ads.txt',
        source: `google.com, ${client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`,
      })
    },
  }
}


// Crawlable content pages (src/content/sitePages.js), written into dist after
// the build: the adventure pages, peoples, the game manual, the landing page's
// text inside #root, sitemap.xml and robots.txt. Without them a crawler, and
// AdSense review, sees only an empty single-page-app shell (Hans 2026-11-26).
function sitePagesPlugin() {
  let outDir = 'dist'
  return {
    name: 'shattered-saga-site-pages',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir },
    async closeBundle() {
      const server = await createServer({ configFile: false, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
      try {
        const { buildSitePages } = await server.ssrLoadModule('/src/content/sitePages.js')
        const rules = readFileSync('src/data/GAME_RULES.md', 'utf8')
        const { pages, sitemap, robots, home } = buildSitePages(rules)
        for (const page of pages) {
          const file = join(outDir, page.path, 'index.html')
          mkdirSync(dirname(file), { recursive: true })
          writeFileSync(file, page.html)
        }
        writeFileSync(join(outDir, 'sitemap.xml'), sitemap)
        writeFileSync(join(outDir, 'robots.txt'), robots)
        const indexFile = join(outDir, 'index.html')
        const index = readFileSync(indexFile, 'utf8')
        writeFileSync(indexFile, index.replace('<div id="root"></div>', `<div id="root">${home}</div>`))
        console.log(`site pages: ${pages.length} pages, sitemap.xml, robots.txt`)
      } finally {
        await server.close()
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      adsensePlugin(env.VITE_ADSENSE_CLIENT),
      sitePagesPlugin(),
    ],
    build: {
      // Must stay true: with emptyOutDir disabled, dist/ accumulated stale assets
      // across builds (old .png/.wav files lingered alongside their replacements),
      // which roughly doubled the published site size. Everything that needs to be
      // published — including CNAME and .nojekyll — lives in public/ and is copied
      // on every build, so there is nothing in dist/ worth preserving.
      emptyOutDir: true
    }
  }
})
