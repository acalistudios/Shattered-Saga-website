import type { Hono } from "hono";
import type { Env } from "./auth";

// ---------------------------------------------------------------------------
// Stripe billing.
//
// Uses Stripe Checkout (hosted): the browser is redirected to Stripe, card data
// never touches our origin, reducing PCI scope. Entitlements are ONLY
// ever granted from a signature-verified webhook — never from the browser
// returning to a success URL, which a user could simply navigate to directly.
// ---------------------------------------------------------------------------

const STRIPE_API = "https://api.stripe.com/v1";

// Stamped on every object we create in Stripe. The account is shared with other
// ACALI products and webhooks are account-wide, so this is how we tell our
// events apart from theirs.
const APP_TAG = "shattered-saga";

export function isShatteredSagaStripeObject(metadata: Record<string, string> | null | undefined) {
  return metadata?.app === APP_TAG;
}

export function isShatteredSagaPrice(price: {
  active?: boolean;
  metadata?: Record<string, string> | null;
} | null | undefined) {
  return !!price?.active && isShatteredSagaStripeObject(price.metadata);
}

/** What each purchasable thing grants. Prices live in Stripe; this maps intent. */
type PlanKey = "supporter" | "adventurer" | "legend";
type PackKey = "turns_200" | "turns_1500" | "gems_15";

const PACK_GRANTS: Record<PackKey, { energy?: number; gems?: number }> = {
  turns_200: { energy: 200 },
  turns_1500: { energy: 1500 },
  gems_15: { gems: 15 },
};

/**
 * Canonical lookup key for a purchasable item. Stripe lets you attach a stable
 * `lookup_key` to a price, so the Worker resolves prices by name at runtime
 * instead of storing nine price-id secrets that have to be re-copied by hand
 * whenever prices are rebuilt (and which are easy to mis-paste).
 */
function lookupKeyFor(kind: string, cycle?: string): string {
  return cycle ? `ss_${kind}_${cycle}`.toLowerCase() : `ss_${kind}`.toLowerCase();
}

/**
 * Resolve a price id. An explicit STRIPE_PRICE_* secret still wins if present
 * (useful for pinning a specific price), otherwise we look it up by lookup_key.
 */
async function resolvePriceId(env: Env, kind: string, cycle?: string): Promise<string | undefined> {
  const envKey = (cycle ? `STRIPE_PRICE_${kind}_${cycle}` : `STRIPE_PRICE_${kind}`).toUpperCase();
  const pinned = (env as any)[envKey];
  const lk = lookupKeyFor(kind, cycle);
  try {
    const price = pinned
      ? await stripe(env, `/prices/${encodeURIComponent(pinned)}`)
      : (await stripe(env, `/prices?lookup_keys[]=${encodeURIComponent(lk)}&active=true&limit=1`)).data?.[0];
    if (!price?.active) return undefined;
    if (price.metadata?.app && price.metadata.app !== APP_TAG) return undefined;
    if (price.lookup_key !== lk) return undefined;
    if (!isShatteredSagaPrice(price)) return undefined;
    return price.id;
  } catch {
    return undefined;
  }
}

/** The full catalogue, used both for price sync and for verification. */
export const CATALOG = [
  { kind: "supporter", cycle: "MONTHLY", product: "BYOK Supporter", amount: 100, interval: "month" },
  { kind: "supporter", cycle: "YEARLY", product: "BYOK Supporter", amount: 999, interval: "year" },
  { kind: "adventurer", cycle: "MONTHLY", product: "Heroic Adventurer", amount: 499, interval: "month" },
  { kind: "adventurer", cycle: "YEARLY", product: "Heroic Adventurer", amount: 3999, interval: "year" },
  { kind: "legend", cycle: "MONTHLY", product: "Legendary Hero", amount: 1500, interval: "month" },
  { kind: "legend", cycle: "YEARLY", product: "Legendary Hero", amount: 11999, interval: "year" },
  { kind: "turns_200", cycle: undefined, product: "200 Priority Turns", amount: 100, interval: null },
  { kind: "turns_1500", cycle: undefined, product: "1,500 Priority Turns", amount: 500, interval: null },
  { kind: "gems_15", cycle: undefined, product: "15 Chronicle Gems", amount: 300, interval: null },
] as const;

/** Stripe wants form-encoded bodies, including for nested params. */
function formEncode(obj: Record<string, any>, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) {
      parts.push(formEncode(v, key));
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object") parts.push(formEncode(item, `${key}[${i}]`));
        else parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

async function stripe(env: Env, path: string, body?: Record<string, any>, idempotencyKey?: string) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2025-02-24.acacia",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: body ? formEncode(body) : undefined,
  });
  const data = await res.json<any>();
  if (!res.ok) throw new Error(data?.error?.message || `stripe_${res.status}`);
  return data;
}

// --- webhook signature verification ---------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify Stripe's `Stripe-Signature` header: v1 = HMAC-SHA256 of
 * "<timestamp>.<raw body>" keyed by the webhook secret. Rejects signatures
 * older than the tolerance to blunt replay attempts.
 */
export async function verifyStripeSignature(
  raw: string,
  header: string,
  secret: string,
  toleranceSec = 300
): Promise<boolean> {
  try {
    const parts = header.split(",").map((p) => {
      const [key, ...rest] = p.trim().split("=");
      return { key, value: rest.join("=") };
    });
    const t = Number(parts.find((part) => part.key === "t")?.value);
    const signatures = parts.filter((part) => part.key === "v1").map((part) => part.value);
    if (!t || signatures.length === 0) return false;
    if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${raw}`));
    const expected = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
    // Stripe can include more than one v1 during webhook-secret rotation.
    return signatures.some((signature) => timingSafeEqual(expected, signature));
  } catch {
    return false;
  }
}

// --- routes ----------------------------------------------------------------

export type BillingChange = {
 eventId:string; type:string; userId:string; subscriptionId?:string|null; tier?:string;
 status?:string; periodEnd?:number|null; observedAt:number; customerId?:string|null;
 grantId?:string|null; energy?:number; gems?:number;
};
export async function applySagaBilling(db:D1Database, change:BillingChange) {
 if (![change.energy??0,change.gems??0].every(n=>Number.isSafeInteger(n)&&n>=0)) throw new Error('invalid_grant');
 const token=crypto.randomUUID();
 const guard="EXISTS (SELECT 1 FROM billing_events WHERE event_id = ? AND claim_token = ?)";
 const statements:D1PreparedStatement[]=[
  db.prepare("INSERT OR IGNORE INTO billing_events(event_id,type,user_id,processed_at,claim_token,status) VALUES(?,?,?,?,?,'processing')")
    .bind(change.eventId,change.type,change.userId,Date.now(),token),
 ];
 if(change.subscriptionId) {
  statements.push(db.prepare(`INSERT INTO billing_subscriptions(subscription_id,user_id,tier,status,period_end,observed_at)
    SELECT ?,?,?,?,?,? WHERE ${guard}
    ON CONFLICT(subscription_id) DO UPDATE SET tier=excluded.tier,status=excluded.status,period_end=excluded.period_end,observed_at=excluded.observed_at
    WHERE billing_subscriptions.user_id=excluded.user_id AND billing_subscriptions.observed_at<=excluded.observed_at`)
   .bind(change.subscriptionId,change.userId,change.tier,change.status,change.periodEnd??null,change.observedAt,change.eventId,token));
  statements.push(db.prepare(`UPDATE users SET
    subscription_tier=COALESCE((SELECT tier FROM billing_subscriptions WHERE user_id=? AND tier!='free' AND (period_end IS NULL OR period_end>?)
      ORDER BY CASE tier WHEN 'legend' THEN 3 WHEN 'adventurer' THEN 2 ELSE 1 END DESC LIMIT 1),'free'),
    subscription_status=CASE WHEN EXISTS(SELECT 1 FROM billing_subscriptions WHERE user_id=? AND tier!='free' AND (period_end IS NULL OR period_end>?)) THEN 'active' ELSE ? END,
    subscription_period_end=(SELECT MAX(period_end) FROM billing_subscriptions WHERE user_id=? AND tier!='free'),
    stripe_subscription_id=COALESCE((SELECT subscription_id FROM billing_subscriptions WHERE user_id=? ORDER BY (tier!='free') DESC,observed_at DESC LIMIT 1),stripe_subscription_id)
    WHERE id=? AND ${guard}`)
   .bind(change.userId,Date.now(),change.userId,Date.now(),change.status,change.userId,change.userId,change.userId,change.eventId,token));
 }
 if(change.grantId) {
  statements.push(db.prepare(`INSERT OR IGNORE INTO billing_grants(grant_id,claim_token,user_id) SELECT ?,?,? WHERE ${guard}`)
   .bind(change.grantId,token,change.userId,change.eventId,token));
  statements.push(db.prepare(`UPDATE users SET energy_balance=energy_balance+?,gems=gems+? WHERE id=?
    AND EXISTS(SELECT 1 FROM billing_grants WHERE grant_id=? AND claim_token=?) AND ${guard}`)
    .bind(change.energy??0,change.gems??0,change.userId,change.grantId,token,change.eventId,token));
 }
 statements.push(db.prepare("UPDATE billing_events SET status='processed' WHERE event_id=? AND claim_token=?").bind(change.eventId,token));
 const result=await db.batch(statements);
 return result[0].meta.changes===0?'duplicate':'applied';
}
function idOf(value:any):string|null {return typeof value==='string'?value:value?.id??null}
function catalogPrice(price:any,requireActive=true) {
 const item=CATALOG.find(i=>lookupKeyFor(i.kind,i.cycle)===price?.lookup_key);
 if(!item || (requireActive&&!price.active) || price.metadata?.app!==APP_TAG || price.currency!=='usd' ||
   price.unit_amount!==item.amount || (price.recurring?.interval??null)!==item.interval ||
   (price.recurring && price.recurring.interval_count!==1)) throw new Error("price_scope_or_catalog_mismatch");
 return item;
}
async function allStripe(env:Env,path:string) {
 const values:any[]=[]; let after="";
 do {
  const page=await stripe(env,path+(after?"&starting_after="+encodeURIComponent(after):""));
  values.push(...page.data);
  if(!page.has_more)break;
  after=page.data.at(-1)?.id;
  if(!after)throw new Error("invalid_pagination");
 } while(true);
 return values;
}
export function registerBillingRoutes(app:Hono<{Bindings:Env}>,getUser:(c:any)=>Promise<{id:string;email:string}|null>) {
 app.get("/api/billing/status",c=>c.json({enabled:!!c.env.STRIPE_SECRET_KEY}));
 app.post("/api/billing/checkout",async c=>{
  const user=await getUser(c);if(!user)return c.json({error:"unauthorized"},401);
  if(!c.env.STRIPE_SECRET_KEY)return c.json({error:"not_configured"},503);
  let body:any;try{body=await c.req.json()}catch{return c.json({error:"invalid_request"},400)}
  const entry=CATALOG.find(i=> body.plan ? !body.pack && i.kind===body.plan && i.cycle===(body.cycle==="yearly"?"YEARLY":body.cycle==="monthly"?"MONTHLY":null) : i.kind===body.pack && !i.cycle);
  if(!entry)return c.json({error:"unknown_item"},400);
  const db=c.env.DATABASE,token=crypto.randomUUID();
  const lock=await db.prepare("INSERT INTO billing_checkout_locks VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at WHERE billing_checkout_locks.expires_at<?")
   .bind(user.id,token,Date.now()+120000,Date.now()).run();
  if(!lock.meta.changes)return c.json({error:"checkout_in_progress"},409);
  try {
   const priceId=await resolvePriceId(c.env,entry.kind,entry.cycle);
   if(!priceId)return c.json({error:"price_unavailable"},503);
   catalogPrice(await stripe(c.env,"/prices/"+priceId));
   const dbUser=await db.prepare("SELECT stripe_customer_id FROM users WHERE id=?").bind(user.id).first<{stripe_customer_id:string|null}>();
   if(!dbUser)throw new Error("missing_user");
   let customer=dbUser.stripe_customer_id;
   if(customer){
    const found=await stripe(c.env,"/customers/"+customer);
    if(found.deleted || found.metadata?.app!==APP_TAG || found.metadata?.user_id!==user.id)throw new Error("customer_scope_mismatch");
   }else {
    const found=await stripe(c.env,"/customers",{email:user.email,metadata:{app:APP_TAG,user_id:user.id}},APP_TAG+":customer:"+user.id);
    customer=found.id;await db.prepare("UPDATE users SET stripe_customer_id=? WHERE id=?").bind(customer,user.id).run();
   }
   if(entry.interval) {
    const subs=await allStripe(c.env,"/subscriptions?customer="+customer+"&status=all&limit=100");
    if(subs.some(s=>!["canceled","incomplete_expired"].includes(s.status)))return c.json({error:"subscription_exists",message:"Manage your existing subscription before starting another."},409);
   }
   const open=await allStripe(c.env,"/checkout/sessions?customer="+customer+"&status=open&limit=100");
   const pending=open.find(s=>s.metadata?.app===APP_TAG && s.mode===(entry.interval?"subscription":"payment"));
   if(pending){
    const lines=await stripe(c.env,"/checkout/sessions/"+pending.id+"/line_items?limit=2");
    if(lines.data.length===1 && lines.data[0].price?.id===priceId)return c.json({url:pending.url});
    if(entry.interval)return c.json({error:"pending_checkout",message:"Another subscription checkout is already open."},409);
   }
   const site=c.env.FRONTEND_URL||"https://shatteredsaga.com";
   const session=await stripe(c.env,"/checkout/sessions",{
    mode:entry.interval?"subscription":"payment",payment_method_types:["card"],customer,
    line_items:[{price:priceId,quantity:1}],client_reference_id:user.id,
    metadata:{app:APP_TAG,user_id:user.id},
    ...(entry.interval?{subscription_data:{metadata:{app:APP_TAG,user_id:user.id}}}:{payment_intent_data:{metadata:{app:APP_TAG,user_id:user.id}}}),
    success_url:site+"/?billing=success",cancel_url:site+"/?billing=cancelled",
    expires_at:Math.floor(Date.now()/1000)+1800,
   },APP_TAG+":checkout:"+user.id+":"+priceId+":"+Math.floor(Date.now()/300000));
   return c.json({url:session.url});
  }catch(e){console.error("checkout failed",e);return c.json({error:"checkout_failed"},502)}
  finally{await db.prepare("DELETE FROM billing_checkout_locks WHERE user_id=? AND token=?").bind(user.id,token).run()}
 });
 app.post("/api/billing/cancel",async c=>{
  const user=await getUser(c);if(!user)return c.json({error:"unauthorized"},401);
  try {
   const own=await c.env.DATABASE.prepare("SELECT stripe_subscription_id,stripe_customer_id FROM users WHERE id=?").bind(user.id).first<any>();
   if(!own?.stripe_subscription_id)return c.json({error:"no_subscription"},404);
   const sub=await stripe(c.env,"/subscriptions/"+own.stripe_subscription_id);
   if(sub.metadata?.app!==APP_TAG || idOf(sub.customer)!==own.stripe_customer_id || sub.metadata.user_id!==user.id)throw new Error("ownership_mismatch");
   for(const item of sub.items.data)catalogPrice(item.price,false);
   await stripe(c.env,"/subscriptions/"+sub.id,{cancel_at_period_end:true});
   return c.json({ok:true,cancel_at:sub.current_period_end??sub.items.data[0]?.current_period_end});
  }catch(e){console.error("cancel failed",e);return c.json({error:"cancel_failed"},502)}
 });
 app.post("/api/billing/webhook",async c=>{
  if(!c.env.STRIPE_WEBHOOK_SECRET)return c.json({error:"not_configured"},503);
  const raw=await c.req.text();
  if(!await verifyStripeSignature(raw,c.req.header("stripe-signature")||"",c.env.STRIPE_WEBHOOK_SECRET))return c.json({error:"invalid_signature"},400);
  let event:any;try{event=JSON.parse(raw)}catch{return c.json({error:"bad_payload"},400)}
  if(!event.id || !event.type)return c.json({error:"bad_payload"},400);
  if(!["checkout.session.completed","checkout.session.async_payment_succeeded","invoice.paid","customer.subscription.updated","customer.subscription.deleted"].includes(event.type))return c.json({received:true,ignored:"unsupported"});
  const obj=event.data?.object??{};
  try {
   const recordSkip=async(reason:string)=>{
    await c.env.DATABASE.prepare("INSERT OR IGNORE INTO billing_events(event_id,type,user_id,processed_at,status) VALUES(?,?,NULL,?,'processed')")
     .bind(event.id,event.type+":"+reason,Date.now()).run();
    return c.json({received:true,ignored:reason});
   };
   if(obj.metadata?.app && obj.metadata.app!==APP_TAG)return await recordSkip("other_app");
   let sub:any=null, session:any=null,invoice:any=null;
   const observedAt=Date.now();
   if(event.type==="invoice.paid"){
    const subId=idOf(obj.subscription??obj.parent?.subscription_details?.subscription);
    if(!subId)return await recordSkip("unmapped");
    sub=await stripe(c.env,"/subscriptions/"+subId);
   }else if(event.type.startsWith("customer.subscription.")){
    sub=await stripe(c.env,"/subscriptions/"+obj.id);
   }else{
    if(obj.metadata?.app!==APP_TAG)return await recordSkip("other_app");
    session=await stripe(c.env,"/checkout/sessions/"+obj.id);
    if(session.metadata?.app!==APP_TAG)return await recordSkip("other_app");
    if(!["paid","no_payment_required"].includes(session.payment_status))return c.json({received:true,ignored:"awaiting_payment"});
    if(session.mode==="subscription")sub=await stripe(c.env,"/subscriptions/"+idOf(session.subscription));
   }
   const object=sub??session;
   if(object?.metadata?.app!==APP_TAG)return await recordSkip("other_app");
   const userId=object.metadata.user_id;
   if(!userId)return await recordSkip("unmapped");
   const user=await c.env.DATABASE.prepare("SELECT id,stripe_customer_id FROM users WHERE id=?").bind(userId).first<any>();
   if(!user)return await recordSkip("unmapped");
   if(user.stripe_customer_id!==idOf(object.customer) || (session && session.client_reference_id!==userId))throw new Error("customer_mismatch");
   const change:BillingChange={eventId:event.id,type:event.type,userId,observedAt};
   if(sub){
    const existing=await c.env.DATABASE.prepare("SELECT user_id FROM billing_subscriptions WHERE subscription_id=?").bind(sub.id).first<any>();
    if(existing && existing.user_id!==userId)throw new Error("subscription_mismatch");
    if(sub.items.data.length!==1)throw new Error("unexpected_subscription_items");
    const item=catalogPrice(sub.items.data[0].price,false);
    if(!item.interval)throw new Error("invalid_subscription_price");
    change.subscriptionId=sub.id;change.tier=["active","trialing"].includes(sub.status)?item.kind:"free";
    change.status=sub.status;change.periodEnd=(sub.current_period_end??sub.items.data[0].current_period_end)*1000||null;
    if(event.type==="invoice.paid")invoice=await stripe(c.env,"/invoices/"+obj.id);
    else if(session && sub.latest_invoice)invoice=await stripe(c.env,"/invoices/"+idOf(sub.latest_invoice));
    if(invoice?.status==="paid" && ["subscription_create","subscription_cycle"].includes(invoice.billing_reason)){
     if(idOf(invoice.customer)!==user.stripe_customer_id || idOf(invoice.subscription??invoice.parent?.subscription_details?.subscription)!==sub.id)throw new Error("invoice_mismatch");
     change.grantId="invoice:"+invoice.id;
     const lines=await allStripe(c.env,"/invoices/"+invoice.id+"/lines?limit=100");
     for(const line of lines){
      if(line.proration || line.parent?.subscription_item_details?.proration)continue;
      const priceId=idOf(line.price??line.pricing?.price_details?.price);
      if(!priceId)throw new Error("missing_invoice_price");
      const paidItem=catalogPrice(await stripe(c.env,"/prices/"+priceId),false);
      if(!paidItem.interval || !Number.isSafeInteger(line.quantity??1) || (line.quantity??1)<1)throw new Error('invalid_invoice_line');
      const base=paidItem.kind==="legend"?650:paidItem.kind==="adventurer"?200:0;
      change.energy=(change.energy??0)+base*(paidItem.interval==="year"?12:1)*(line.quantity??1);
     }
    }
   }else{
    if(session.mode!=="payment")return await recordSkip("unsupported_mode");
    change.grantId="checkout:"+session.id;
    const lines=await allStripe(c.env,"/checkout/sessions/"+session.id+"/line_items?limit=100");
    if(!lines.length)throw new Error("empty_checkout");
    for(const line of lines){
     const item=catalogPrice(await stripe(c.env,"/prices/"+idOf(line.price)),false);
     if(item.interval || !Object.hasOwn(PACK_GRANTS,item.kind))throw new Error("invalid_pack");
     const grant=PACK_GRANTS[item.kind as PackKey],qty=line.quantity??1;
     if(!Number.isSafeInteger(qty)||qty<1)throw new Error("invalid_quantity");
     change.energy=(change.energy??0)+(grant.energy??0)*qty;change.gems=(change.gems??0)+(grant.gems??0)*qty;
    }
   }
   return c.json({received:true,outcome:await applySagaBilling(c.env.DATABASE,change)});
  }catch(e){console.error("billing fulfillment failed",event.id,e);return c.json({error:"processing_failed"},500)}
 });
}
