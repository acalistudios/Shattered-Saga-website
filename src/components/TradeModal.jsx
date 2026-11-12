import { useState } from 'react';
import { formatCoin } from '../data/payouts';
import { merchantStock, buyPriceCp, sellOfferCp, haggleToday } from '../utils/adventureTrade';
import { getLoan, returnableLoans } from '../utils/discoveries';

const coinCp = (c = {}) => (c.gp ?? c.gold ?? 0) * 100 + (c.sp || 0) * 10 + (c.cp || 0);

/**
 * Buy from and sell to the merchants in the current room. Every price comes
 * from the engine (utils/adventureTrade.js); closing the screen writes one line
 * into the story so the GM knows what changed hands.
 */
export default function TradeModal({ merchants, character, adventureId, onTrade, onHaggle, onReturnLoan, onClose }) {
  const [activeName, setActiveName] = useState(merchants[0]?.name);
  const [log, setLog] = useState([]);
  const [haggleNote, setHaggleNote] = useState(null);
  const merchant = merchants.find((m) => m.name === activeName) || merchants[0];
  if (!merchant) return null;

  const haggle = haggleToday(character, adventureId, merchant);
  const purse = coinCp(character.currency);
  const equipped = Object.values(character.equipment || {}).filter(Boolean);
  const stock = merchantStock(character, adventureId, merchant);

  // One row per distinct item in the pack, with its count.
  const counts = new Map();
  (character.inventory || []).forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));
  const pack = [...counts.entries()].map(([item, count]) => ({
    item,
    count,
    isEquipped: equipped.includes(item),
    offer: sellOfferCp(adventureId, merchant, item, haggle || 0, equipped),
  })).sort((a, b) => (b.offer ?? -1) - (a.offer ?? -1));

  const record = (line) => setLog((prev) => [...prev, line]);
  // Returning writes its own story line (useGameState.returnLoanToOwner).
  const loansHere = onReturnLoan ? returnableLoans(character, merchant.name) : [];

  const buy = (entry) => {
    const price = buyPriceCp(entry, haggle || 0);
    if (onTrade('buy', merchant.name, entry.item)) record(`bought ${entry.item} from ${merchant.name} for ${formatCoin(price)}`);
  };
  const sell = (row) => {
    // A counted stack sells one at a time: "sold 1 × Rations", not "Rations (3)".
    const label = /\(\d+\)$/.test(row.item) ? `1 × ${row.item.replace(/\s*\(\d+\)$/, '')}` : row.item;
    if (onTrade('sell', merchant.name, row.item)) record(`sold ${label} to ${merchant.name} for ${formatCoin(row.offer)}`);
  };
  const doHaggle = () => {
    const result = onHaggle(merchant.name);
    if (!result) return;
    setHaggleNote(result.adjustment > 0
      ? `${result.text} ${merchant.name} gives you ${Math.round(result.adjustment * 100)}% better prices today.`
      : `${result.text} ${merchant.name} won't budge today.`);
    record(`haggled with ${merchant.name}`);
  };

  const close = () => onClose(log.length ? `You trade at the ${merchant.location}: ${log.join('; ')}.` : null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Trade">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-950 border border-amber-900/40 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold font-serif text-amber-400 tracking-wider">🛒 Trade</h3>
            <p className="text-4xs text-slate-500">{merchant.location} · Your purse: <strong className="text-amber-300">{formatCoin(purse)}</strong></p>
          </div>
          <button type="button" onClick={close} className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 text-3xs uppercase font-bold cursor-pointer">Done</button>
        </div>

        {merchants.length > 1 && (
          <div className="flex gap-1 px-5 pt-3">
            {merchants.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => { setActiveName(m.name); setHaggleNote(null); }}
                className={`px-3 py-1.5 rounded-t text-3xs font-bold cursor-pointer ${m.name === merchant.name ? 'bg-slate-800 text-amber-300' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
          <p className="text-3xs text-slate-400"><strong className="text-slate-200">{merchant.name}</strong>, {merchant.role}. Buys: {(merchant.buys || []).join(', ')}.</p>
          <button
            type="button"
            onClick={doHaggle}
            disabled={haggle !== null}
            title="One Negotiation roll per merchant per day. Success improves buying and selling prices by up to 25%."
            className="px-3 py-1.5 rounded bg-violet-700 hover:bg-violet-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-4xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
          >
            {haggle === null ? '🎲 Haggle (Negotiation)' : haggle > 0 ? `Haggled: ${Math.round(haggle * 100)}% better` : 'Haggled today'}
          </button>
        </div>
        {haggleNote && <p className="px-5 pt-2 text-4xs text-violet-300">{haggleNote}</p>}

        {loansHere.length > 0 && (
          <div className="mx-5 mt-3 p-3 rounded border border-amber-700/50 bg-amber-950/30 space-y-2">
            {loansHere.map((item) => (
              <div key={item} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <p className="text-3xs text-amber-200">
                  <strong>{item}</strong> belongs to {getLoan(item).ownerShort}. Giving it back unused keeps your word; keeping it costs you their trust.
                </p>
                <button
                  type="button"
                  onClick={() => onReturnLoan(item)}
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-4xs font-black uppercase cursor-pointer shrink-0"
                >
                  Return to {getLoan(item).ownerShort}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 overflow-y-auto">
          <section>
            <h4 className="text-3xs uppercase tracking-widest text-slate-500 font-bold mb-2">For sale</h4>
            <ul className="space-y-1.5">
              {stock.map((entry) => {
                const price = buyPriceCp(entry, haggle || 0);
                const disabled = entry.remaining <= 0 || purse < price;
                return (
                  <li key={entry.item} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded px-3 py-2">
                    <div className="text-left">
                      <span className="text-2xs text-slate-200 font-bold">{entry.item}</span>
                      <span className="block text-4xs text-slate-500">{entry.remaining > 0 ? `${entry.remaining} left` : 'Sold out'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => buy(entry)}
                      disabled={disabled}
                      className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-4xs font-black uppercase cursor-pointer shrink-0"
                    >
                      Buy · {formatCoin(price)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h4 className="text-3xs uppercase tracking-widest text-slate-500 font-bold mb-2">Your pack</h4>
            <ul className="space-y-1.5">
              {pack.map((row) => (
                <li key={row.item} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded px-3 py-2">
                  <div className="text-left">
                    <span className="text-2xs text-slate-200 font-bold">{row.item}{row.count > 1 ? ` ×${row.count}` : ''}</span>
                    <span className="block text-4xs text-slate-500">
                      {row.isEquipped ? 'Equipped: unequip it to sell'
                        : getLoan(row.item) ? `On loan from ${getLoan(row.item).ownerShort}: not yours to sell`
                        : row.offer === null ? `${merchant.name} doesn't buy this` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => sell(row)}
                    disabled={row.offer === null}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-4xs font-black uppercase cursor-pointer shrink-0"
                  >
                    {row.offer === null ? 'Sell' : `Sell · ${formatCoin(row.offer)}`}
                  </button>
                </li>
              ))}
              {pack.length === 0 && <li className="text-4xs text-slate-500">Your pack is empty.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
