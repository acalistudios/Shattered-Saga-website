import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const source = await readFile(new URL('./authCookies.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm' });
const { getAuthCookieScope } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));

test('production auth hosts retain the shared cookie domain', () => {
  for (const hostname of ['api.shatteredsaga.com', 'shatteredsaga.com', 'www.shatteredsaga.com']) {
    assert.deepEqual(getAuthCookieScope(`https://${hostname}`), { enabled: true, domain: '.shatteredsaga.com' });
  }
});

test('local, preview and unrelated hosts use host-only cookies', () => {
  for (const url of [undefined, 'http://127.0.0.1:8787', 'http://localhost:8787',
    'https://shattered-saga.pages.dev', 'https://shatteredsaga.com.example.test']) {
    assert.deepEqual(getAuthCookieScope(url), { enabled: false });
  }
});
