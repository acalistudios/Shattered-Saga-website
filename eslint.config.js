import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This app has not yet been refactored for the stricter React Compiler
      // rules bundled with eslint-plugin-react-hooks v7. Keep Rules of Hooks
      // and exhaustive-deps active, but disable compiler purity policies here.
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // A variable read before its `let`/`const` in the same function throws at
      // runtime. That is how every healing item broke (2026-11-20). References
      // from inner functions, which run later, are allowed.
      'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
    },
  },
])
