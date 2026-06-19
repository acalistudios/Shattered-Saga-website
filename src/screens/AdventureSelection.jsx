import React from 'react';
import { ADVENTURES_LIST } from '../data/adventures';
import { GMS } from '../data/gms';
import { printCharacterSheet } from '../utils/print';

export default function AdventureSelection({
  character,
  onSelectAdventure,
  onBack,
  gems,
  onSpendGem,
  layoutMode = 'desktop'
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const handlePrintCharacter = () => {
    printCharacterSheet(character);
  };
  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-400 hover:text-amber-400 cursor-pointer transition-colors"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className={`font-extrabold text-amber-400 ${isDesktopLayout ? 'text-3xl' : 'text-2xl'}`}>SELECT ADVENTURE</h1>
            <p className={`text-slate-400 mt-0.5 uppercase tracking-widest font-semibold ${isDesktopLayout ? 'text-xs' : 'text-3xs'}`}>
              Choose your campaign destination
            </p>
          </div>
        </div>
        
        {/* Character Summary Badge */}
        {character && (
          <div className={`items-center gap-3 bg-slate-900/60 border border-slate-850 rounded-lg p-2 ${isDesktopLayout ? 'flex' : 'hidden'}`}>
            {character.portraitUrl && (
              <div className="w-10 h-10 rounded border border-amber-500/20 overflow-hidden bg-slate-950">
                <img src={character.portraitUrl} alt={character.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-right">
              <div className="text-xs font-bold text-amber-100 leading-tight">{character.name}</div>
              <div className="text-5xs text-slate-450 uppercase tracking-wider mt-0.5">
                Lvl {character.stats.level} • {character.element.toUpperCase()}-KIN
              </div>
              <button
                type="button"
                onClick={handlePrintCharacter}
                className="mt-1.5 px-2 py-0.5 rounded text-5xs uppercase tracking-wider font-extrabold border border-amber-550/20 text-amber-450 hover:text-amber-400 bg-amber-950/20 hover:bg-amber-950/45 cursor-pointer block text-center transition-all"
              >
                Print Signed Sheet ↗
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-start items-center py-4 my-auto">
        <h2 className="text-2xl font-bold text-center text-amber-100 mb-2">
          Where shall your saga lead?
        </h2>
        <p className="text-sm text-slate-400 text-center max-w-lg mb-8">
          Select an adventure. Your elements, attribute scores, and skills will shape how the Game Master narratively guides your choices.
        </p>

        {/* Adventures Grid */}
        <div className={`grid gap-6 w-full ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {ADVENTURES_LIST.map((adv) => {
            const gm = GMS.find(g => g.id === adv.suggestedGm);
            
            // Custom styles based on adventure element
            let elementColorClass = 'text-amber-505';
            let borderHoverClass = 'hover:border-amber-550 shadow-amber-500/10';
            if (adv.element === 'fire') {
              elementColorClass = 'text-red-400';
              borderHoverClass = 'hover:border-red-500 hover:shadow-red-500/10';
            } else if (adv.element === 'water') {
              elementColorClass = 'text-blue-400';
              borderHoverClass = 'hover:border-blue-500 hover:shadow-blue-500/10';
            } else if (adv.element === 'air') {
              elementColorClass = 'text-indigo-400';
              borderHoverClass = 'hover:border-indigo-500 hover:shadow-indigo-500/10';
            }

            return (
              <div
                key={adv.id}
                onClick={() => onSelectAdventure(adv.id)}
                className={`flex flex-col justify-between rounded-lg overflow-hidden border border-slate-800 bg-slate-900/35 hover:scale-103 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl ${borderHoverClass}`}
              >
                {/* Artwork Banner */}
                <div className="h-40 relative bg-slate-950 w-full overflow-hidden flex items-center justify-center border-b border-slate-800/65">
                  {adv.artwork ? (
                    <img
                      src={adv.artwork}
                      alt={adv.name}
                      className="w-full h-full object-cover opacity-75 hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="text-slate-600 font-bold uppercase tracking-widest text-xs">No Imagery</div>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 text-2xs uppercase tracking-wider rounded font-bold bg-slate-950/80 border border-slate-700 ${elementColorClass}`}>
                    {adv.element}
                  </span>
                </div>

                {/* Adventure Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-amber-200 mb-2 leading-tight">
                      {adv.name}
                    </h3>
                    <p className="text-xs text-slate-355 leading-relaxed mb-3">
                      {adv.desc}
                    </p>

                    <div className="space-y-3 mb-4 mt-2 text-left border-t border-slate-900/60 pt-3">
                      {/* Objectives */}
                      <div>
                        <span className="text-4xs uppercase tracking-widest text-amber-500/80 font-bold block mb-1">Key Objectives</span>
                        <ul className="text-5xs text-slate-400 space-y-0.5 list-disc list-inside">
                          {adv.objectives.map((o, idx) => (
                            <li key={idx} className="leading-normal">{o}</li>
                          ))}
                        </ul>
                      </div>

                      {/* NPCs */}
                      <div>
                        <span className="text-4xs uppercase tracking-widest text-amber-500/80 font-bold block mb-1">Key Characters</span>
                        <div className="text-5xs text-slate-400 space-y-1">
                          {adv.npcs.map((n, idx) => (
                            <div key={idx} className="leading-normal" title={n.desc}>
                              <strong className="text-amber-100">{n.name}</strong> — <span className="text-slate-450">{n.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Loot */}
                      <div>
                        <span className="text-4xs uppercase tracking-widest text-amber-500/80 font-bold block mb-1">Unique Loot</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {adv.items.map((it, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded-sm text-5xs">
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion & GM Details */}
                  <div className="border-t border-slate-800/80 pt-4 mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-4xs text-slate-500 uppercase tracking-widest block mb-0.5">Suggested Chronicler</span>
                      <span className="text-xs font-bold text-amber-100">{gm ? gm.name : 'Unknown GM'}</span>
                    </div>
                    {gm && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 bg-slate-950">
                        <img src={gm.avatar} alt={gm.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 flex justify-center text-xs text-slate-550 border-t border-slate-900 pt-4 text-center">
        <p>
          Characters can embark on multiple adventures in sequence. Quitting an adventure carries a Narrative Scar.
        </p>
      </div>

    </div>
  );
}
