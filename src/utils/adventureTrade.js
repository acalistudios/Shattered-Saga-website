// Trading with an adventure's merchants (Hans, 2026-11-12).
//
// Each adventure defines its merchants in data/adventureEconomy.js: where
// they stand, what they sell (price and stock) and which item categories they
// buy. A Trade screen opens when the player is in that merchant's room. The
// engine sets every price; the GM is only told what happened.
//
// Prices follow MERCHANT_TRADE_RULES: buy at list price, sell at 50% of an
// item's value. One Negotiation roll per merchant per in-game day can improve
// both by up to 25% (best purchase 75% of list, best sale 75% of value).
import { ADVENTURE_ECONOMY_METADATA } from '../data/adventureEconomy';
import { MERCHANT_TRADE_RULES, coinValue } from '../data/economy';
import { getItemDetails } from './items';
import { itemsOnLoan } from './discoveries';
import { MERCHANT_RESTOCK, completedCount } from '../data/merchantRestock';

const norm = (s) => String(s || '').trim().toLowerCase();
const QTY_RE = /^(.*?)\s*\((\d+)\)$/;

const coinCp = (c = {}) => (c.gp ?? c.gold ?? 0) * 100 + (c.sp || 0) * 10 + (c.cp || 0);
const withCoin = (c = {}, total) => {
  const gp = Math.floor(total / 100);
  return { ...c, gp, sp: Math.floor((total % 100) / 10), cp: total % 10, gold: gp };
};

export function getAdventureMerchants(adventureId) {
  return ADVENTURE_ECONOMY_METADATA[adventureId]?.merchants || [];
}

/** Merchants standing in the player's current room. */
export function merchantsAtLocation(adventureId, location) {
  const here = norm(location);
  if (!here) return [];
  return getAdventureMerchants(adventureId).filter((m) => norm(m.location) === here);
}

/** Merchants in this room that the player has actually visited/spoken with. */
export function metMerchantsAtLocation(character, adventureId, location) {
  const here = merchantsAtLocation(adventureId, location);
  if (!here.length) return [];
  const met = new Set((character?.progression?.metMerchants?.[adventureId] || []).map(norm));
  const traded = new Set(Object.keys(tradeLog(character, adventureId)).map(norm));
  return here.filter((m) => met.has(norm(m.name)) || traded.has(norm(m.name)));
}

/** Detect which merchants in the current room were visited/addressed in text. */
export function detectMentionedMerchants(adventureId, location, text) {
  const here = merchantsAtLocation(adventureId, location);
  if (!here.length || !text) return [];
  const hay = norm(text);
  return here
    .filter((m) => {
      const full = norm(m.name);
      const first = full.split(/\s+/)[0];
      return hay.includes(full) || (first.length >= 4 && new RegExp(`\\b${first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(hay));
    })
    .map((m) => m.name);
}

const tradeLog = (character, adventureId) => character?.progression?.adventureTrades?.[adventureId] || {};

/**
 * Everything the merchant offers: their own goods, plus each restock tier the
 * player has unlocked by completing adventures (data/merchantRestock.js).
 * Restocked goods carry `restockAfter`; a restock of an item they already sell
 * adds to its stock instead.
 */
export function merchantOffer(character, merchant) {
  const done = completedCount(character);
  const offer = (merchant.sells || []).map((entry) => ({ ...entry }));
  for (const tier of MERCHANT_RESTOCK[merchant.name] || []) {
    if (done < tier.after) continue;
    for (const [item, priceCp, stock] of tier.sells) {
      const have = offer.find((e) => e.item === item);
      if (have) have.stock = (have.stock ?? 1) + stock;
      else offer.push({ item, priceCp, price: coinValue(priceCp), stock, restockAfter: tier.after });
    }
  }
  return offer;
}

/**
 * What the merchant still has for sale this run of the adventure. Anything the
 * player sold them goes on their shelf at its list value (Hans 2026-11-17), so
 * it can be bought back; `soldByYou` counts how many of the stock came from you.
 */
export function merchantStock(character, adventureId, merchant) {
  const log = tradeLog(character, adventureId)[merchant.name] || {};
  const bought = log.bought || {};
  const sold = log.sold || {};
  const offer = merchantOffer(character, merchant);
  for (const [item, count] of Object.entries(sold)) {
    if (count <= 0) continue;
    const have = offer.find((e) => e.item === item);
    if (have) {
      have.stock = (have.stock ?? 1) + count;
      have.soldByYou = count;
    } else {
      const { valueCp } = itemValuation(adventureId, item);
      const priceCp = Math.max(1, valueCp || 1);
      offer.push({ item, priceCp, price: coinValue(priceCp), stock: count, soldByYou: count });
    }
  }
  return offer.map((entry) => ({
    ...entry,
    remaining: Math.max(0, (entry.stock ?? 1) - (bought[entry.item] || 0)),
  }));
}

/**
 * Undos the player gets per visit with this merchant: one for every 20 points
 * of reputation with them (Hans 2026-11-17). Reputation is
 * localEconomy.relationships, -100..100.
 */
export const REP_PER_UNDO = 20;
export function undosPerVisit(character, merchant) {
  const rep = character?.localEconomy?.relationships?.[merchant.name] || 0;
  return Math.max(0, Math.floor(rep / REP_PER_UNDO));
}

const haggleKey = (character, merchantName) => `${merchantName}@day${character?.stats?.day ?? 1}`;

/** Today's haggle result with this merchant: null until rolled, else 0..0.25. */
export function haggleToday(character, adventureId, merchant) {
  const h = tradeLog(character, adventureId)[merchant.name]?.haggle;
  return h && h.key === haggleKey(character, merchant.name) ? h.adjustment : null;
}

/** Record a Negotiation roll: each point of margin is 5%, capped at the merchant's maximum. */
export function recordHaggle(character, adventureId, merchant, { success, margin }) {
  const cap = merchant.negotiationMaxAdjustment ?? MERCHANT_TRADE_RULES.negotiationMaxAdjustment;
  const adjustment = success ? Math.min(cap, Math.max(0, margin) * 0.05) : 0;
  return updateTradeLog(character, adventureId, merchant.name, (log) => ({
    ...log,
    haggle: { key: haggleKey(character, merchant.name), adjustment },
  }));
}

export function buyPriceCp(entry, haggle = 0) {
  return Math.max(1, Math.round(entry.priceCp * (1 - (haggle || 0))));
}

/** Value and category of an item, preferring this adventure's own valuation. */
export function itemValuation(adventureId, itemName) {
  const local = ADVENTURE_ECONOMY_METADATA[adventureId]?.itemValues?.[itemName];
  if (local) return { valueCp: local.valueCp, category: local.category };
  const m = String(itemName).match(QTY_RE);
  const details = getItemDetails(itemName);
  return { valueCp: details.valueCp || 0, category: details.valueCategory || 'misc', counted: !!m };
}

/**
 * Whether a merchant buys this category. Jewellers and relic dealers also buy
 * "treasure" (mirrors, seal tiles, sealed letters...), which no merchant
 * listed on its own (Hans, 2026-11-12).
 */
export function merchantBuys(merchant, category) {
  const buys = merchant.buys || [];
  if (buys.includes(category)) return true;
  return category === 'treasure' && (buys.includes('jewelry') || buys.includes('relics'));
}

// A counted stack ("Rations (3)") is sold one at a time.
const unitOf = (itemName) => {
  const m = String(itemName).match(QTY_RE);
  return m ? { name: m[1], qty: Number(m[2]), unit: `${m[1]} (1)` } : null;
};

/** What the merchant pays for one of this item, or null if they won't buy it. */
export function sellOfferCp(adventureId, merchant, itemName, haggle = 0, unsellable = []) {
  // `unsellable`: equipped gear, and anything an NPC lent you (itemsOnLoan).
  if (unsellable.includes(itemName)) return null;
  const { valueCp, category } = itemValuation(adventureId, unitOf(itemName)?.unit || itemName);
  if (!valueCp || !merchantBuys(merchant, category)) return null;
  const rate = Math.min(
    MERCHANT_TRADE_RULES.bestPlayerSaleRate,
    (merchant.buyRate ?? MERCHANT_TRADE_RULES.baseBuyRate) * (1 + (haggle || 0)),
  );
  return Math.max(1, Math.round(valueCp * rate));
}

function updateTradeLog(character, adventureId, merchantName, fn) {
  const progression = character.progression || {};
  const trades = progression.adventureTrades || {};
  const advLog = trades[adventureId] || {};
  return {
    ...character,
    progression: {
      ...progression,
      adventureTrades: { ...trades, [adventureId]: { ...advLog, [merchantName]: fn(advLog[merchantName] || {}) } },
    },
  };
}

/** Buy one item. Returns the same character if out of stock or too poor. */
export function buyFromMerchant(character, adventureId, merchant, itemName) {
  const entry = merchantStock(character, adventureId, merchant).find((s) => s.item === itemName);
  if (!entry || entry.remaining <= 0) return character;
  const price = buyPriceCp(entry, haggleToday(character, adventureId, merchant));
  const coin = coinCp(character.currency);
  if (coin < price) return character;
  const next = {
    ...character,
    currency: withCoin(character.currency, coin - price),
    inventory: addToStack(character.inventory || [], itemName),
  };
  return updateTradeLog(next, adventureId, merchant.name, (log) => ({
    ...log,
    bought: { ...(log.bought || {}), [itemName]: (log.bought?.[itemName] || 0) + 1 },
  }));
}

/** Sell one copy of an inventory item. Returns the same character if refused. */
export function sellToMerchant(character, adventureId, merchant, itemName, equipped = []) {
  const idx = (character.inventory || []).indexOf(itemName);
  if (idx === -1) return character;
  const offer = sellOfferCp(adventureId, merchant, itemName, haggleToday(character, adventureId, merchant), [...equipped, ...itemsOnLoan(character)]);
  if (offer === null) return character;
  const stack = unitOf(itemName);
  const inventory = stack && stack.qty > 1
    ? character.inventory.map((item, i) => (i === idx ? `${stack.name} (${stack.qty - 1})` : item))
    : character.inventory.filter((_, i) => i !== idx);
  const next = {
    ...character,
    currency: withCoin(character.currency, coinCp(character.currency) + offer),
    inventory,
  };
  // The merchant now has it on the shelf (merchantStock).
  const shelfItem = stack ? stack.unit : itemName;
  return updateTradeLog(next, adventureId, merchant.name, (log) => ({
    ...log,
    sold: { ...(log.sold || {}), [shelfItem]: (log.sold?.[shelfItem] || 0) + 1 },
  }));
}

/** The item a sale of `itemName` puts on the merchant's shelf ("Rations (1)" for a stack). */
export const shelfItemFor = (itemName) => unitOf(itemName)?.unit || itemName;

/**
 * Reverse one trade from this visit at the price it was made (an undo, granted
 * by reputation). `trade` is { action: 'buy'|'sell', item, priceCp } where
 * item is what changed hands ("Rations (1)" for one ration from a stack).
 * Returns the same character if it can't be undone (item gone, or too poor).
 */
export function undoTrade(character, adventureId, merchant, trade) {
  const coin = coinCp(character.currency);
  const inv = character.inventory || [];
  if (trade.action === 'buy') {
    // Give the item back for a refund.
    const unit = unitOf(trade.item);
    const idx = unit
      ? inv.findIndex((i) => unitOf(i)?.name.toLowerCase() === unit.name.toLowerCase() && unitOf(i).qty >= unit.qty)
      : inv.indexOf(trade.item);
    if (idx === -1) return character;
    const have = unitOf(inv[idx]);
    const inventory = unit && have.qty > unit.qty
      ? inv.map((item, i) => (i === idx ? `${have.name} (${have.qty - unit.qty})` : item))
      : inv.filter((_, i) => i !== idx);
    const next = { ...character, currency: withCoin(character.currency, coin + trade.priceCp), inventory };
    return updateTradeLog(next, adventureId, merchant.name, (log) => ({
      ...log,
      bought: { ...(log.bought || {}), [trade.item]: Math.max(0, (log.bought?.[trade.item] || 0) - 1) },
    }));
  }
  // Take back what you sold, returning the money.
  if (coin < trade.priceCp) return character;
  const next = { ...character, currency: withCoin(character.currency, coin - trade.priceCp), inventory: addToStack(inv, trade.item) };
  return updateTradeLog(next, adventureId, merchant.name, (log) => ({
    ...log,
    sold: { ...(log.sold || {}), [trade.item]: Math.max(0, (log.sold?.[trade.item] || 0) - 1) },
  }));
}

/** Add an item, folding "Rations (5)" into an existing "Rations (n)" stack. */
function addToStack(inventory, itemName) {
  const bought = unitOf(itemName);
  if (!bought) return [...inventory, itemName];
  const idx = inventory.findIndex((item) => unitOf(item)?.name.toLowerCase() === bought.name.toLowerCase());
  if (idx === -1) return [...inventory, itemName];
  const have = unitOf(inventory[idx]);
  return inventory.map((item, i) => (i === idx ? `${have.name} (${have.qty + bought.qty})` : item));
}
