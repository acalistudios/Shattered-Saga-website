// Real D1/SQLite execution, not a JavaScript imitation of transaction semantics.
// Run: node --test src/billing.database.checks.mjs (from api-worker).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { transform } from 'esbuild';
import { Hono } from 'hono';
const source = await readFile(new URL('./billing.ts', import.meta.url), 'utf8');
const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'es2022' });
const { applySagaBilling, registerBillingRoutes, verifyStripeSignature } = await import('data:text/javascript;base64,' + Buffer.from(code+'\n//# sourceURL=billing-under-test.mjs').toString('base64'));

test('signature tampering, expiry and rotation',async()=>{
 const secret='whsec_fixture',raw='{}',now=Math.floor(Date.now()/1000);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${now}.${raw}`))).toString('hex');
 assert.equal(await verifyStripeSignature(raw,`t=${now},v1=invalid,v1=${signature}`,secret),true);
 assert.equal(await verifyStripeSignature('{"changed":true}',`t=${now},v1=${signature}`,secret),false);
 assert.equal(await verifyStripeSignature(raw,`t=${now-600},v1=${signature}`,secret),false);
});

test('D1 atomic billing and independent subscription projections', async t => {
 const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("test")}}', d1Databases: ['DB'] });
 try {
  const db = await mf.getD1Database('DB');
  await db.exec("CREATE TABLE users(id TEXT PRIMARY KEY,subscription_tier TEXT DEFAULT 'free',energy_balance INTEGER DEFAULT 0,gems INTEGER DEFAULT 0)");
  for (const file of ['0002_billing.sql','0003_scope_billing_to_app.sql','0004_atomic_billing_events.sql','0005_billing_subscriptions.sql']) {
   const sql = await readFile(new URL('../drizzle/' + file, import.meta.url),'utf8');
   // D1 exec splits by line; prepared statements preserve multiline triggers.
   const parts = sql.replace(/--[^\n]*/g,'').split(/;(?!\s*END\b)/i).map(s=>s.trim()).filter(Boolean);
   for (const part of parts) await db.prepare(part).run();
  }
  await db.prepare("INSERT INTO users(id,stripe_customer_id) VALUES('alice','cus_a'),('bob','cus_b')").run();
  const state = () => db.prepare("SELECT * FROM users WHERE id='alice'").first();
  const count = async table => (await db.prepare(`SELECT count(*) n FROM ${table}`).first()).n;
  const base = {userId:'alice',type:'test',observedAt:100};
  await t.test('concurrent duplicate event grants once', async () => {
   await Promise.all(Array.from({length:8},()=>applySagaBilling(db,{...base,eventId:'evt1',grantId:'checkout:1',energy:200})));
   assert.equal((await state()).energy_balance,200); assert.equal(await count('billing_events'),1);
  });
  await t.test('different event IDs for same invoice grant once', async () => {
   await Promise.all(['evt2','evt3'].map(eventId=>applySagaBilling(db,{...base,eventId,grantId:'invoice:1',energy:650})));
   assert.equal((await state()).energy_balance,850);
  });
  await t.test('write failure rolls back claim and grants; same event retries', async () => {
   await db.prepare("CREATE TRIGGER fail_balance BEFORE UPDATE OF gems ON users WHEN NEW.gems=999 BEGIN SELECT RAISE(ABORT,'injected failure'); END").run();
   const before=await count('billing_events');
   await assert.rejects(applySagaBilling(db,{...base,eventId:'retry',grantId:'checkout:retry',gems:999}));
   assert.equal(await count('billing_events'),before);
   await applySagaBilling(db,{...base,eventId:'retry',grantId:'checkout:retry',gems:15});
   assert.equal((await state()).gems,15);
  });
  const future = Date.now()+86400000;
  await t.test('old cancellation cannot downgrade a newer subscription', async () => {
   await applySagaBilling(db,{...base,eventId:'old-active',subscriptionId:'sub-old',tier:'adventurer',status:'active',periodEnd:future});
   await applySagaBilling(db,{...base,eventId:'new-active',subscriptionId:'sub-new',tier:'legend',status:'active',periodEnd:future,observedAt:200});
   await applySagaBilling(db,{...base,eventId:'old-cancel',subscriptionId:'sub-old',tier:'free',status:'canceled',periodEnd:future,observedAt:300});
   assert.equal((await state()).subscription_tier,'legend');
  });
  await t.test('payment recovery restores catalog tier; stale snapshot cannot undo it', async () => {
   await applySagaBilling(db,{...base,eventId:'new-failed',subscriptionId:'sub-new',tier:'free',status:'past_due',periodEnd:future,observedAt:400});
   assert.equal((await state()).subscription_tier,'free');
   await applySagaBilling(db,{...base,eventId:'new-recovered',subscriptionId:'sub-new',tier:'adventurer',status:'active',periodEnd:future,observedAt:600});
   await applySagaBilling(db,{...base,eventId:'stale',subscriptionId:'sub-new',tier:'free',status:'past_due',periodEnd:future,observedAt:500});
   assert.equal((await state()).subscription_tier,'adventurer');
  });
  await t.test('conflicting subscription owner aborts entire transaction', async () => {
   const before=await count('billing_events');
   await assert.rejects(applySagaBilling(db,{...base,eventId:'stolen',userId:'bob',subscriptionId:'sub-new',tier:'legend',status:'active',periodEnd:future,observedAt:900,grantId:'invoice:stolen',energy:650}));
   assert.equal(await count('billing_events'),before);
   assert.equal((await db.prepare("SELECT energy_balance FROM users WHERE id='bob'").first()).energy_balance,0);
  });
  await t.test('signed HTTP routes with actual D1 and Stripe network fixtures', async t => {
   await db.prepare("INSERT INTO users(id,stripe_customer_id) VALUES('route','cus_route')").run();
   const app=new Hono(); registerBillingRoutes(app,async()=>({id:'route',email:'test@example.test'}));
   const env={DATABASE:db,STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture'};
   const originalFetch=globalThis.fetch;
   const price={id:'price_turns',active:true,lookup_key:'ss_turns_200',metadata:{app:'shattered-saga'},currency:'usd',unit_amount:100,recurring:null};
   const plan={...price,id:'price_legend',lookup_key:'ss_legend_monthly',unit_amount:1500,recurring:{interval:'month',interval_count:1}};
   let paid=false,foreign=false,existing=false;const calls=[];
   const list=data=>({data,has_more:false});
   globalThis.fetch=async(input,init={})=>{
    const path=new URL(input).pathname; calls.push({path,...init});let data;
    if(path==='/v1/checkout/sessions/cs_route')data={id:'cs_route',mode:'payment',payment_status:paid?'paid':'unpaid',customer:'cus_route',client_reference_id:'route',metadata:{app:'shattered-saga',user_id:'route'}};
    else if(path==='/v1/checkout/sessions/cs_route/line_items')data=list([{price,quantity:1}]);
    else if(path==='/v1/prices/price_turns')data=price;
    else if(path==='/v1/prices/price_legend')data=plan;
    else if(path==='/v1/prices')data=list([plan]);
    else if(path==='/v1/customers/cus_route')data={id:'cus_route',metadata:{app:'shattered-saga',user_id:'route'}};
    else if(path==='/v1/subscriptions')data=list(existing?[{id:'sub_route',status:'active'}]:[]);
    else if(path==='/v1/checkout/sessions')data=init.method==='POST'?{id:'cs_new',url:'https://checkout.stripe.com/fixture'}:list([]);
    else if(path==='/v1/subscriptions/sub_route')data={id:'sub_route',customer:'cus_route',metadata:{app:foreign?'viastellis':'shattered-saga',user_id:'route'},status:'active',current_period_end:Math.floor(Date.now()/1000)+86400,items:{data:[{price:plan}]}};
    else if(path==='/v1/invoices/in_route')data={id:'in_route',status:'paid',billing_reason:'subscription_cycle',customer:'cus_route',subscription:'sub_route'};
    else if(path==='/v1/invoices/in_route/lines')data=list([{pricing:{price_details:{price:'price_legend'}},quantity:1}]);
    else throw new Error('Unexpected fixture request: '+path);
    return Response.json(data);
   };
   const deliver=async(type,object,id='route_event')=>{
    const raw=JSON.stringify({id,type,data:{object}}),timestamp=Math.floor(Date.now()/1000);
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const sig=Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${raw}`))).toString('hex');
    return app.fetch(new Request('http://test/api/billing/webhook',{method:'POST',body:raw,headers:{'stripe-signature':`t=${timestamp},v1=${sig}`}}),env);
   };
   const row=()=>db.prepare("SELECT * FROM users WHERE id='route'").first();
   try {
    await t.test('unpaid, async success, and duplicate delivery',async()=>{
     assert.equal((await deliver('checkout.session.completed',{id:'cs_route',metadata:{app:'shattered-saga'}})).status,200);assert.equal((await row()).energy_balance,0);
     paid=true;assert.equal((await deliver('checkout.session.async_payment_succeeded',{id:'cs_route',metadata:{app:'shattered-saga'}},'async')).status,200);
     await deliver('checkout.session.completed',{id:'cs_route',metadata:{app:'shattered-saga'}},'paid_duplicate');assert.equal((await row()).energy_balance,200);
    });
    await t.test('modern invoice grants subscription turns and tier',async()=>{
     assert.equal((await deliver('invoice.paid',{id:'in_route',parent:{subscription_details:{subscription:'sub_route'}}},'renewal')).status,200);
     assert.equal((await row()).energy_balance,850);assert.equal((await row()).subscription_tier,'legend');
    });
    await t.test('foreign invoice cannot downgrade same customer',async()=>{
     foreign=true;assert.equal((await deliver('invoice.paid',{id:'in_route',subscription:'sub_route'},'foreign')).status,200);assert.equal((await row()).subscription_tier,'legend');foreign=false;
    });
    await t.test('checkout uses catalog, stamps metadata, and blocks duplicates',async()=>{
     const start=()=>app.fetch(new Request('http://test/api/billing/checkout',{method:'POST',body:JSON.stringify({plan:'legend',cycle:'monthly'})}),env);
     assert.equal((await start()).status,200);
     const params=new URLSearchParams(calls.find(c=>c.path==='/v1/checkout/sessions'&&c.method==='POST').body);
     assert.equal(params.get('metadata[app]'),'shattered-saga');assert.equal(params.get('subscription_data[metadata][app]'),'shattered-saga');assert.equal(params.get('line_items[0][price]'),'price_legend');
     existing=true;assert.equal((await start()).status,409);
    });
    await t.test('cancel validates product even for a stored subscription',async()=>{
     foreign=true;const before=calls.filter(c=>c.path==='/v1/subscriptions/sub_route'&&c.method==='POST').length;
     assert.equal((await app.fetch(new Request('http://test/api/billing/cancel',{method:'POST'}),env)).status,502);
     assert.equal(calls.filter(c=>c.path==='/v1/subscriptions/sub_route'&&c.method==='POST').length,before);
    });
   }finally{globalThis.fetch=originalFetch}
  });
 } finally { await mf.dispose(); }
});
