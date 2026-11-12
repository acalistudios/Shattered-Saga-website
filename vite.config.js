import { defineConfig, loadEnv } from 'vite'
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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      adsensePlugin(env.VITE_ADSENSE_CLIENT),
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
