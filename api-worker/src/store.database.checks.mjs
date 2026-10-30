// Real D1/SQLite execution for the gem store (A4).
// Run: node --test src/store.database.checks.mjs (from api-worker).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { transform } from 'esbuild';
import { Hono } from 'hono';
const source = await readFile(new URL('./store.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const { registerStoreRoutes, STORE_ITEMS } = await import('data:text/javascript;base64,' + Buffer.from(code + '\n//# sourceURL=store-under-test.mjs').toString('base64'));

test('gem store: server prices, atomic debit, no overdraft', async t => {
  const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("test")}}', d1Databases: ['DB'] });
  try {
    const db = await mf.getD1Database('DB');
    await db.exec("CREATE TABLE users(id TEXT PRIMARY KEY, gems INTEGER DEFAULT 0)");
    await db.prepare("INSERT INTO users(id,gems) VALUES('alice',25),('bob',4)").run();
    const app = new Hono();
    registerStoreRoutes(app, async c => {
      const id = c.req.header('x-user');
      return id ? { id } : null;
    });
    const env = { DATABASE: db };
    const buy = (user, itemId) => app.request('/api/store/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(user ? { 'x-user': user } : {}) },
      body: JSON.stringify({ itemId }),
    }, env);
    const gems = async id => (await db.prepare('SELECT gems FROM users WHERE id=?').bind(id).first()).gems;

    await t.test('charges the server price and names the item', async () => {
      const res = await buy('alice', 'rite_of_quiet_return');
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.item, 'Rite of Quiet Return');
      assert.equal(body.gems, 25 - STORE_ITEMS.rite_of_quiet_return.gems);
      assert.equal(await gems('alice'), body.gems);
    });

    await t.test('concurrent purchases never overdraw', async () => {
      // alice has 15: three concurrent Rites (10 each) -> exactly one succeeds.
      const results = await Promise.all([1, 2, 3].map(() => buy('alice', 'rite_of_quiet_return')));
      assert.equal(results.filter(r => r.status === 200).length, 1);
      assert.equal(results.filter(r => r.status === 402).length, 2);
      assert.equal(await gems('alice'), 5);
    });

    await t.test('refuses without enough gems, unknown items and anonymous callers', async () => {
      assert.equal((await buy('bob', 'thread_of_returning')).status, 402);
      assert.equal(await gems('bob'), 4);
      assert.equal((await buy('bob', 'free_gems')).status, 400);
      assert.equal((await buy(null, 'thread_of_returning')).status, 401);
    });
  } finally {
    await mf.dispose();
  }
});
