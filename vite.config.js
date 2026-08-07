import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Must stay true: with emptyOutDir disabled, dist/ accumulated stale assets
    // across builds (old .png/.wav files lingered alongside their replacements),
    // which roughly doubled the published site size. Everything that needs to be
    // published — including CNAME and .nojekyll — lives in public/ and is copied
    // on every build, so there is nothing in dist/ worth preserving.
    emptyOutDir: true
  }
})
