import { GMS } from '../data/gms';

/**
 * Choose a Game Master. Each GM is a different AI behind the same game: The
 * Chronicler costs 1 turn per action, The Loremaster more, with a stronger
 * model and a longer memory (data/gms.js). Used in character creation and in
 * the in-game GM window.
 */
export function GmCards({ selectedId, onSelect, balance = null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {GMS.map((gm) => {
        const selected = gm.id === selectedId;
        const affordable = balance === null || balance >= gm.turnCost;
        return (
          <button
            key={gm.id}
            type="button"
            onClick={() => onSelect(gm.id)}
            aria-pressed={selected}
            className={`text-left rounded-lg border p-4 transition-all cursor-pointer ${
              selected ? `bg-slate-900 ${gm.theme.glowClass} shadow-lg` : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 shrink-0 rounded-full overflow-hidden border ${gm.theme.avatarBorder} bg-slate-900`}>
                <img src={gm.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className={`block text-sm font-bold font-serif whitespace-nowrap ${gm.theme.accentText}`}>{gm.name}</span>
                <span className="block text-4xs text-slate-400 uppercase tracking-wider">{gm.tagline}</span>
                <span className={`inline-block mt-1 text-4xs font-extrabold uppercase px-1.5 py-0.5 rounded ${gm.theme.badgeClass}`}>
                  {gm.turnCost} {gm.turnCost === 1 ? 'turn' : 'turns'} per action
                </span>
              </div>
            </div>
            <p className="text-3xs text-slate-400 leading-relaxed mb-2">{gm.description}</p>
            <ul className="text-4xs text-slate-300 space-y-0.5">
              {gm.strengths.map((s) => <li key={s}>• {s}</li>)}
            </ul>
            {!affordable && (
              <p className="mt-2 text-4xs text-rose-400">
                You have {balance} turns: not enough for one action with {gm.name}.
              </p>
            )}
            {selected && <p className={`mt-2 text-4xs font-bold uppercase tracking-wider ${gm.theme.accentText}`}>✓ Selected</p>}
          </button>
        );
      })}
    </div>
  );
}

/** In-game window: compare the GMs and switch. */
export default function GmPickerModal({ activeGmId, balance, isByok, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gm-picker-title"
      onClick={onClose}
    >
      <div
        className="fantasy-panel-gold rounded-xl p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-amber-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-amber-500/20 pb-2 mb-3">
          <h3 id="gm-picker-title" className="text-md font-bold text-amber-300 font-serif">Choose your Game Master</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer">✕</button>
        </div>
        <p className="text-3xs text-slate-400 leading-relaxed mb-3">
          Each GM is a different AI narrating the same world. Your choice applies from your next action
          and stays with this character until you change it.
          {balance !== null && <> You have <strong className="text-slate-200">{balance}</strong> turns.</>}
        </p>
        {isByok && (
          <p className="text-3xs text-amber-400/90 leading-relaxed mb-3">
            You're playing with your own API key, so no turns are used: the GM sets the narration style.
          </p>
        )}
        <GmCards selectedId={activeGmId} balance={isByok ? null : balance} onSelect={(id) => { onSelect(id); onClose(); }} />
      </div>
    </div>
  );
}
