import React, { useState } from 'react';
import { ADVENTURES_LIST } from '../data/adventures';
import { GMS } from '../data/gms';
import { printCharacterSheet } from '../utils/print';

// Absolute coordinates of the adventure nodes on a 100% x 100% map canvas
const MAP_NODES = {
  ashveil_keep: { x: 18, y: 25, labelOffset: 'bottom' },
  saltblood_mines: { x: 18, y: 70, labelOffset: 'bottom' },
  clockwork_conservatory: { x: 45, y: 18, labelOffset: 'bottom' },
  sunken_spire: { x: 48, y: 40, labelOffset: 'right' },
  obsidian_vault: { x: 45, y: 62, labelOffset: 'bottom' },
  frostfire_crypt: { x: 48, y: 82, labelOffset: 'right' },
  astral_sky: { x: 80, y: 50, labelOffset: 'top' }
};

// Connections between nodes to render as SVG lines
const MAP_CONNECTIONS = [
  { from: 'ashveil_keep', to: 'clockwork_conservatory' },
  { from: 'ashveil_keep', to: 'sunken_spire' },
  { from: 'saltblood_mines', to: 'obsidian_vault' },
  { from: 'saltblood_mines', to: 'frostfire_crypt' },
  { from: 'clockwork_conservatory', to: 'astral_sky' },
  { from: 'obsidian_vault', to: 'astral_sky' }
];

// Helper to determine if a node is unlocked based on completed adventures
const getUnlockStatus = (advId, completedAdventures = []) => {
  if (advId === 'ashveil_keep' || advId === 'saltblood_mines') {
    return { unlocked: true, requirements: [] };
  }
  if (advId === 'clockwork_conservatory' || advId === 'sunken_spire') {
    const isUnlocked = completedAdventures.includes('ashveil_keep');
    return { unlocked: isUnlocked, requirements: ['Ashveil Keep'] };
  }
  if (advId === 'obsidian_vault' || advId === 'frostfire_crypt') {
    const isUnlocked = completedAdventures.includes('saltblood_mines');
    return { unlocked: isUnlocked, requirements: ['The Saltblood Mines'] };
  }
  if (advId === 'astral_sky') {
    const isUnlocked = completedAdventures.includes('clockwork_conservatory') || completedAdventures.includes('obsidian_vault');
    return { unlocked: isUnlocked, requirements: ['The Clockwork Conservatory', 'The Obsidian Vault'] };
  }
  return { unlocked: false, requirements: [] };
};

export default function AdventureSelection({
  character,
  onSelectAdventure,
  onBack,
  gems,
  onSpendGem,
  layoutMode = 'desktop'
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const completedAdventures = character?.completed_adventures || [];
  
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedNodeId, setSelectedNodeId] = useState('ashveil_keep');

  const selectedAdventure = ADVENTURES_LIST.find(a => a.id === selectedNodeId);
  const unlockState = selectedAdventure ? getUnlockStatus(selectedAdventure.id, completedAdventures) : { unlocked: false, requirements: [] };
  const isCompleted = completedAdventures.includes(selectedNodeId);

  const handlePrintCharacter = () => {
    printCharacterSheet(character);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-4">
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
            <h1 className="font-extrabold text-amber-405 text-2xl font-serif">WORLD MAP</h1>
            <p className="text-slate-400 uppercase tracking-widest font-semibold text-5xs">
              Plot your course and select a destination
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-850">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded text-5xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
              viewMode === 'map' ? 'bg-amber-955 text-amber-300 shadow-sm border border-amber-500/30' : 'text-slate-450 hover:text-slate-300'
            }`}
          >
            🗺️ Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-5xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-amber-955 text-amber-300 shadow-sm border border-amber-500/30' : 'text-slate-450 hover:text-slate-300'
            }`}
          >
            📜 List View
          </button>
        </div>
        
        {/* Character Summary Badge */}
        {character && (
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/60 border border-slate-850 rounded-lg p-2">
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
            </div>
          </div>
        )}
      </div>

      {/* Main Campaign Screen */}
      <div className="flex-1 flex flex-col justify-start">
        
        {viewMode === 'map' ? (
          /* MAP VIEW WITH SPLIT SIDEBAR */
          <div className={`flex-1 grid gap-5 ${isDesktopLayout ? 'grid-cols-12' : 'grid-cols-1'}`}>
            
            {/* The Visual Cartography Map Box */}
            <div className={`relative bg-slate-955/40 border border-slate-850 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between ${isDesktopLayout ? 'col-span-8 h-[520px]' : 'h-[380px]'}`}>
              
              {/* Map Background Aesthetics (Coastlines, Compass, Grid) */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
              
              {/* SVG Link lines between nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {MAP_CONNECTIONS.map((conn, idx) => {
                  const fromNode = MAP_NODES[conn.from];
                  const toNode = MAP_NODES[conn.to];
                  if (!fromNode || !toNode) return null;
                  
                  const fromUnlock = getUnlockStatus(conn.from, completedAdventures);
                  const toUnlock = getUnlockStatus(conn.to, completedAdventures);
                  const isActive = fromUnlock.unlocked && toUnlock.unlocked;

                  return (
                    <line
                      key={idx}
                      x1={`${fromNode.x}%`}
                      y1={`${fromNode.y}%`}
                      x2={`${toNode.x}%`}
                      y2={`${toNode.y}%`}
                      className={isActive ? "stroke-amber-500/50 stroke-[2.5]" : "stroke-slate-800/40 stroke-[1.5]"}
                      strokeDasharray={isActive ? "none" : "6,6"}
                      filter={isActive ? "url(#glow-gold)" : "none"}
                    />
                  );
                })}
              </svg>

              {/* Decorative Compass Rose SVG */}
              <div className="absolute top-4 left-4 w-16 h-16 opacity-25 pointer-events-none rotate-12">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-550 fill-none stroke-1">
                  <circle cx="50" cy="50" r="45" />
                  <circle cx="50" cy="50" r="41" strokeDasharray="3,3" />
                  <line x1="50" y1="5" x2="50" y2="95" />
                  <line x1="5" y1="50" x2="95" y2="50" />
                  <polygon points="50,5 53,40 50,47" fill="#d97706" />
                  <polygon points="50,5 47,40 50,47" fill="#f59e0b" />
                  <polygon points="50,95 53,60 50,53" fill="#d97706" />
                  <polygon points="50,95 47,60 50,53" fill="#f59e0b" />
                  <polygon points="95,50 60,53 53,50" fill="#d97706" />
                  <polygon points="95,50 60,47 53,50" fill="#f59e0b" />
                  <polygon points="5,50 40,53 47,50" fill="#d97706" />
                  <polygon points="5,50 40,47 47,50" fill="#f59e0b" />
                </svg>
              </div>

              {/* Map Interactive Nodes */}
              {ADVENTURES_LIST.map((adv) => {
                const coords = MAP_NODES[adv.id];
                if (!coords) return null;

                const { unlocked } = getUnlockStatus(adv.id, completedAdventures);
                const isNodeCompleted = completedAdventures.includes(adv.id);
                const isSelected = selectedNodeId === adv.id;

                let markerStyle = "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed";
                let pulseClass = "";

                if (isNodeCompleted) {
                  markerStyle = "bg-emerald-950 border-emerald-500 text-emerald-400 hover:scale-115";
                } else if (unlocked) {
                  markerStyle = "bg-slate-950 border-amber-500 text-amber-305 hover:scale-115 shadow-[0_0_15px_rgba(245,158,11,0.25)]";
                  pulseClass = "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-20";
                }

                if (isSelected) {
                  markerStyle += " ring-2 ring-amber-400 scale-120 z-10 border-amber-300";
                }

                return (
                  <div
                    key={adv.id}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                    onClick={() => setSelectedNodeId(adv.id)}
                  >
                    {/* Ring Pulse for active hubs */}
                    {unlocked && !isNodeCompleted && (
                      <span className="relative flex h-8 w-8 justify-center items-center">
                        <span className={pulseClass}></span>
                      </span>
                    )}

                    {/* Node Core Orb */}
                    <div className={`w-8 h-8 rounded-full border-[2px] flex items-center justify-center font-bold text-2xs transition-all duration-300 ${markerStyle}`}>
                      {isNodeCompleted ? (
                        <span>✓</span>
                      ) : !unlocked ? (
                        <span className="text-4xs">🔒</span>
                      ) : (
                        <span className="text-4xs">✦</span>
                      )}
                    </div>

                    {/* Node Label */}
                    <div className={`absolute pointer-events-none select-none text-center transition-all bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-300 mt-1 whitespace-nowrap group-hover:text-amber-305 group-hover:bg-slate-950 ${
                      coords.labelOffset === 'top' ? '-top-8' :
                      coords.labelOffset === 'right' ? '-right-2 translate-x-full' :
                      'top-8'
                    }`}>
                      {adv.name}
                      {isNodeCompleted && <span className="text-emerald-400 ml-1">✓</span>}
                    </div>
                  </div>
                );
              })}

              {/* Decorative map boundary label */}
              <div className="absolute bottom-3 right-3 text-5xs uppercase tracking-widest text-slate-500 font-serif">
                Saga Region Cartography • V4
              </div>
            </div>

            {/* Split Sidebar Detail Panel */}
            <div className={`flex flex-col justify-between bg-slate-900/35 border border-slate-850 rounded-xl p-5 shadow-lg ${isDesktopLayout ? 'col-span-4 h-[520px]' : ''}`}>
              {selectedAdventure ? (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                  <div>
                    {/* Banner Image */}
                    {selectedAdventure.artwork && (
                      <div className="h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 mb-4">
                        <img src={selectedAdventure.artwork} alt={selectedAdventure.name} className="w-full h-full object-cover opacity-80" />
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-xl font-extrabold text-amber-205 font-serif leading-tight">
                        {selectedAdventure.name}
                      </h3>
                      <span className={`px-1.5 py-0.5 text-5xs uppercase tracking-wider rounded font-bold bg-slate-950 border border-slate-800 ${
                        selectedAdventure.element === 'fire' ? 'text-red-400' :
                        selectedAdventure.element === 'water' ? 'text-blue-400' :
                        selectedAdventure.element === 'air' ? 'text-indigo-400' : 'text-amber-505'
                      }`}>
                        {selectedAdventure.element}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3">
                      {isCompleted ? (
                        <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
                          ✓ Completed Campaign
                        </span>
                      ) : !unlockState.unlocked ? (
                        <div className="px-2 py-1 bg-red-955/40 text-red-300 border border-red-500/20 text-4xs rounded font-medium">
                          🔒 **Locked**. Requires completion of: <strong className="text-red-200">{unlockState.requirements.join(', ')}</strong>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-955/60 text-amber-300 border border-amber-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
                          ✦ Available Quest
                        </span>
                      )}
                    </div>

                    <p className="text-3xs text-slate-355 leading-relaxed mb-4">
                      {selectedAdventure.backstory || selectedAdventure.desc}
                    </p>

                    {/* Objectives & Loot Details */}
                    {unlockState.unlocked && (
                      <div className="space-y-3 pt-3 border-t border-slate-900/60 text-left">
                        <div>
                          <span className="text-4xs uppercase tracking-widest text-amber-500/80 font-bold block mb-1">Objectives</span>
                          <ul className="text-4xs text-slate-400 space-y-0.5 list-disc list-inside">
                            {selectedAdventure.objectives.slice(0, 3).map((o, idx) => (
                              <li key={idx} className="leading-snug text-slate-350">{o}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-4xs uppercase tracking-widest text-amber-500/80 font-bold block mb-1">Loot & Rewards</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedAdventure.items.slice(0, 4).map((it, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-955 border border-slate-800 text-slate-300 rounded text-5xs">
                                {it}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Block */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    {!unlockState.unlocked ? (
                      <button
                        disabled
                        className="w-full py-2 bg-slate-950 border border-slate-850 text-slate-500 rounded text-3xs font-extrabold uppercase tracking-widest cursor-not-allowed"
                      >
                        Location Locked
                      </button>
                    ) : isCompleted ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => onSelectAdventure(selectedAdventure.id, true)}
                          className="py-2.5 bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 rounded text-3xs font-bold uppercase tracking-wider cursor-pointer text-center transition-all"
                        >
                          🏰 Visit Area / Rest
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to replay the campaign? This will reset your story log for this area.")) {
                              onSelectAdventure(selectedAdventure.id, false);
                            }
                          }}
                          className="py-2.5 bg-slate-950 border border-slate-850 hover:border-amber-500/40 text-slate-350 hover:text-amber-400 rounded text-3xs font-bold uppercase tracking-wider cursor-pointer text-center transition-all"
                        >
                          🔁 Replay Quest
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectAdventure(selectedAdventure.id, false)}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-550 hover:from-amber-500 hover:to-amber-450 text-slate-950 rounded text-3xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-amber-500/10 transition-all text-center"
                      >
                        Embark on Quest
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-3xs italic">
                  Select a node on the map to view quest details.
                </div>
              )}
            </div>

          </div>
        ) : (
          /* CLASSIC GRID LIST VIEW */
          <div className={`grid gap-6 w-full ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {ADVENTURES_LIST.map((adv) => {
              const gm = GMS.find(g => g.id === adv.suggestedGm);
              const { unlocked, requirements } = getUnlockStatus(adv.id, completedAdventures);
              const isLocCompleted = completedAdventures.includes(adv.id);

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
                  onClick={() => {
                    if (unlocked) {
                      setSelectedNodeId(adv.id);
                      setViewMode('map'); // Switch to map view to display actions
                    }
                  }}
                  className={`flex flex-col justify-between rounded-lg overflow-hidden border bg-slate-900/35 transition-all duration-300 shadow-lg ${
                    !unlocked ? 'border-slate-950 opacity-45 cursor-not-allowed' : `border-slate-800 hover:scale-103 cursor-pointer ${borderHoverClass}`
                  }`}
                >
                  {/* Artwork Banner */}
                  <div className="h-32 relative bg-slate-950 w-full overflow-hidden flex items-center justify-center border-b border-slate-800/65">
                    {adv.artwork ? (
                      <img
                        src={adv.artwork}
                        alt={adv.name}
                        className="w-full h-full object-cover opacity-70"
                      />
                    ) : (
                      <div className="text-slate-600 font-bold uppercase tracking-widest text-4xs">No Imagery</div>
                    )}
                    <span className={`absolute top-2.5 right-2.5 px-1.5 py-0.5 text-5xs uppercase tracking-wider rounded font-bold bg-slate-950/80 border border-slate-700 ${elementColorClass}`}>
                      {adv.element}
                    </span>
                    {!unlocked ? (
                      <span className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-red-400 text-3xs font-extrabold uppercase tracking-widest gap-1">
                        🔒 Locked
                      </span>
                    ) : isLocCompleted ? (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-5xs uppercase tracking-wider rounded font-extrabold bg-emerald-950/85 border border-emerald-500/30 text-emerald-400">
                        ✓ Completed
                      </span>
                    ) : null}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-amber-205 leading-tight mb-1">
                        {adv.name}
                      </h3>
                      <p className="text-4xs text-slate-400 leading-normal mb-3">
                        {adv.desc}
                      </p>
                      
                      {!unlocked && requirements.length > 0 && (
                        <div className="bg-red-955/20 border border-red-500/10 p-2 rounded text-5xs text-red-300">
                          Requires: {requirements.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-5xs text-slate-500 uppercase tracking-widest block">Chronicler</span>
                        <span className="text-2xs font-bold text-amber-100">{gm ? gm.name : 'Unknown GM'}</span>
                      </div>
                      {gm && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-800 bg-slate-950">
                          <img src={gm.avatar} alt={gm.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer info */}
      <div className="mt-6 flex justify-center text-4xs text-slate-550 border-t border-slate-900 pt-3 text-center">
        <p>
          Complete quests to unlock further locations on the map. You can return to completed locations to rest, recover fatigue, and manage strongholds.
        </p>
      </div>

    </div>
  );
}
