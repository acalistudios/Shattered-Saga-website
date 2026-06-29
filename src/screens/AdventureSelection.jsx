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

const WORLD_REGIONS = [
  { id: 'region1', name: 'Region 1: Aethelgard', x: 35, y: 45, unlocked: true, desc: 'Central kingdom of grassy plains, whispering forests, and ancient ruins. Contains the gothic stronghold of Ashveil Keep, the Saltblood Mines, the Sunken Spire, and the clockwork spires of Baron von Rictor.' },
  { id: 'region2', name: 'Region 2: Ignis Ridge', x: 65, y: 30, unlocked: false, desc: 'A scorched volcanic wasteland separated from Aethelgard by the Boiling Sea. The magma rivers of Ignis Ridge are currently sealed by planar tempests.' },
  { id: 'region3', name: 'Region 3: Frostfire Glacier', x: 55, y: 75, unlocked: false, desc: 'A frozen northern wilderness where absolute-zero tempests freeze the land. Home to ancient cryo-vaults locked by elemental forces.' },
  { id: 'region4', name: 'Region 4: The Sapphire Deep', x: 20, y: 70, unlocked: false, desc: 'An abyssal ocean realm of submerged elven archives. Heavy siren song tides lock the portal gates from dry-landers.' }
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
  layoutMode = 'desktop',
  strongholdChest = [],
  onUpdateStrongholdChest,
  onUpdateCharacterStats
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const completedAdventures = character?.completed_adventures || [];
  
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [mapLevel, setMapLevel] = useState('world'); // 'world' or 'region1'
  const [selectedRegionId, setSelectedRegionId] = useState('region1');
  const [selectedNodeId, setSelectedNodeId] = useState('ashveil_keep');

  const selectedRegion = WORLD_REGIONS.find(r => r.id === selectedRegionId);
  const selectedAdventure = ADVENTURES_LIST.find(a => a.id === selectedNodeId);

  const [isChestOpen, setIsChestOpen] = useState(false);

  const ITEM_PRICES = {
    "creator's binding seal tile": 100,
    "demon-cult amulet": 80,
    "aldric's signet ring": 50,
    "+1 dagger (voss crest)": 120,
    "+1 shield (voss crest)": 150,
    "holy water": 30,
    "silver mirror": 40,
    "binding prayer scroll": 50,
    "iron shield": 30,
    "dagger": 15,
    "health potion": 40,
    "rations": 5,
    "heavy weapons": 100,
    "light weapons": 50,
    "chainmail": 150,
    "leather armor": 50,
    "plate mail": 300
  };

  const getItemBaseValue = (itemName) => {
    for (const adv of ADVENTURES_LIST) {
      const detail = adv.itemsDetail?.find(d => d.name.toLowerCase() === itemName.toLowerCase());
      if (detail) {
        if (detail.value !== undefined) return detail.value;
        if (detail.price !== undefined) return detail.price;
      }
    }
    const cleanName = itemName.toLowerCase().trim();
    if (ITEM_PRICES[cleanName] !== undefined) {
      return ITEM_PRICES[cleanName];
    }
    return 20; // Default fallback base value
  };

  const handleDepositToChest = (itemName) => {
    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => {
        const idx = prev.inventory.indexOf(itemName);
        if (idx === -1) return prev;
        const nextInv = [...prev.inventory];
        nextInv.splice(idx, 1);
        return { ...prev, inventory: nextInv };
      });
    }
    if (onUpdateStrongholdChest) {
      onUpdateStrongholdChest([...strongholdChest, itemName]);
    }
  };

  const handleWithdrawFromChest = (chestIdx) => {
    const itemName = strongholdChest[chestIdx];
    if (!itemName) return;

    if (character.inventory.length >= 20) {
      alert("Your character backpack is full (Max 20 items). Deposit or sell other items first!");
      return;
    }

    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => {
        return { ...prev, inventory: [...prev.inventory, itemName] };
      });
    }
    if (onUpdateStrongholdChest) {
      const nextChest = [...strongholdChest];
      nextChest.splice(chestIdx, 1);
      onUpdateStrongholdChest(nextChest);
    }
  };

  const handleSellFromChest = (chestIdx, sellPrice) => {
    const itemName = strongholdChest[chestIdx];
    if (!itemName) return;

    if (!window.confirm(`Are you sure you want to sell your ${itemName} for ${sellPrice} Gold?`)) {
      return;
    }

    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => {
        const nextStats = { ...prev.stats };
        nextStats.gold = (nextStats.gold || 0) + sellPrice;
        return { ...prev, stats: nextStats };
      });
    }
    if (onUpdateStrongholdChest) {
      const nextChest = [...strongholdChest];
      nextChest.splice(chestIdx, 1);
      onUpdateStrongholdChest(nextChest);
    }
  };
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
            <h1 className="font-extrabold text-amber-405 text-2xl font-serif">
              {mapLevel === 'world' ? 'WORLD MAP' : 'REGION 1: AETHELGARD'}
            </h1>
            <p className="text-slate-400 uppercase tracking-widest font-semibold text-5xs">
              {mapLevel === 'world' ? 'Select a region of the continent to explore' : 'Plot your course and select a destination'}
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
        
        {/* Character Summary Badge & Stash Button */}
        {character && (
          <div className="flex items-center gap-2">
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
            
            <button
              type="button"
              onClick={() => setIsChestOpen(true)}
              className="px-3 py-2 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-350 hover:text-amber-400 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title="Open Stronghold Stash Chest"
            >
              <span>📦</span>
              <span>Stash ({strongholdChest.length})</span>
            </button>
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
              
              {/* Map Background Aesthetics (Grid, Parchment Image) */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-0"></div>
              
              <img 
                src={mapLevel === 'world' ? '/images/world_map_parchment.png' : '/images/region_map_parchment.png'} 
                alt="Saga Campaign Map" 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.92] select-none pointer-events-none filter sepia-[10%] brightness-[92%] contrast-[105%] z-0"
              />
              
              {/* SVG Link lines */}
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {mapLevel === 'world' ? (
                  <>
                    {/* Dotted travel lines connecting regions on the world map */}
                    <path d="M 350 270 Q 500 220 650 180" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6,6" strokeOpacity="0.45" filter="url(#glow-gold)" />
                    <path d="M 350 270 Q 450 360 550 450" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6,6" strokeOpacity="0.45" filter="url(#glow-gold)" />
                    <path d="M 350 270 Q 250 345 200 420" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6,6" strokeOpacity="0.45" filter="url(#glow-gold)" />
                  </>
                ) : (
                  <>
                    {/* Node Connection Lines */}
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
                          x1={`${fromNode.x * 10}`}
                          y1={`${fromNode.y * 6}`}
                          x2={`${toNode.x * 10}`}
                          y2={`${toNode.y * 6}`}
                          className={isActive ? "stroke-amber-500/60 stroke-[3]" : "stroke-slate-900/35 stroke-[2]"}
                          strokeDasharray={isActive ? "none" : "5,5"}
                          filter={isActive ? "url(#glow-gold)" : "none"}
                        />
                      );
                    })}
                  </>
                )}
              </svg>

              {/* Zoom Out Button */}
              {mapLevel === 'region1' && (
                <button
                  onClick={() => setMapLevel('world')}
                  className="absolute top-4 left-4 z-20 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-400 hover:text-amber-400 cursor-pointer transition-colors shadow-lg flex items-center gap-1.5"
                  title="Return to World Map"
                >
                  🗺️ Zoom Out
                </button>
              )}

              {/* World Region Interactive Nodes */}
              {mapLevel === 'world' && WORLD_REGIONS.map((reg) => {
                const isSelected = selectedRegionId === reg.id;
                let markerStyle = "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed";

                if (reg.unlocked) {
                  markerStyle = "bg-slate-950 border-amber-500 text-amber-305 hover:scale-110 shadow-[0_0_15px_rgba(245,158,11,0.25)]";
                }

                if (isSelected) {
                  markerStyle += " ring-2 ring-amber-400 scale-115 z-10 border-amber-300";
                }

                return (
                  <div
                    key={reg.id}
                    style={{ left: `${reg.x}%`, top: `${reg.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                    onClick={() => {
                      setSelectedRegionId(reg.id);
                    }}
                    onDoubleClick={() => {
                      if (reg.unlocked) {
                        setMapLevel('region1');
                      }
                    }}
                  >

                    {/* Region Core Orb */}
                    <div className={`w-10 h-10 rounded-full border-[2px] flex items-center justify-center font-bold text-sm transition-all duration-300 ${markerStyle}`}>
                      {reg.unlocked ? "👁️" : "🔒"}
                    </div>

                    {/* Region Label */}
                    <div className="absolute pointer-events-none select-none text-center transition-all bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-350 mt-1 whitespace-nowrap group-hover:text-amber-305 group-hover:bg-slate-950 top-12">
                      {reg.name}
                      {!reg.unlocked && <span className="text-red-400 ml-1">🔒</span>}
                    </div>
                  </div>
                );
              })}

              {/* Map Interactive Nodes */}
              {mapLevel === 'region1' && ADVENTURES_LIST.map((adv) => {
                const coords = MAP_NODES[adv.id];
                if (!coords) return null;

                const { unlocked } = getUnlockStatus(adv.id, completedAdventures);
                const isNodeCompleted = completedAdventures.includes(adv.id);
                const isSelected = selectedNodeId === adv.id;

                let markerStyle = "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed";

                if (isNodeCompleted) {
                  markerStyle = "bg-emerald-950 border-emerald-500 text-emerald-400 hover:scale-115";
                } else if (unlocked) {
                  markerStyle = "bg-slate-950 border-amber-500 text-amber-305 hover:scale-115 shadow-[0_0_15px_rgba(245,158,11,0.25)]";
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
                    <div
                      style={
                        coords.labelOffset === 'top'
                          ? { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
                          : coords.labelOffset === 'right'
                          ? { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' }
                          : { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
                      }
                      className="absolute pointer-events-none select-none text-center transition-all bg-slate-950/85 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-300 whitespace-nowrap group-hover:text-amber-305 group-hover:bg-slate-950 z-20"
                    >
                      {adv.name}
                      {isNodeCompleted && <span className="text-emerald-400 ml-1">✓</span>}
                    </div>
                  </div>
                );
              })}

              {/* Decorative map boundary label */}
              <div className="absolute bottom-3 right-3 text-5xs uppercase tracking-widest text-slate-500 font-serif">
                {mapLevel === 'world' ? '"Shattered Saga" World Map' : '"Shattered Saga" Region 1 Map'}
              </div>
            </div>

            {/* Split Sidebar Detail Panel */}
            <div className={`flex flex-col justify-between bg-slate-900/35 border border-slate-850 rounded-xl p-5 shadow-lg ${isDesktopLayout ? 'col-span-4 h-[520px]' : ''}`}>
              {mapLevel === 'world' ? (
                selectedRegion ? (
                  <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div>
                      {/* Banner Image */}
                      <div className="h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/60 mb-4 flex items-center justify-center text-slate-500 font-serif text-3xs select-none relative">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <span className="text-amber-500/70 text-base mr-1.5">🗺️</span>
                        <span className="uppercase tracking-widest font-bold">Region Cartography</span>
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-xl font-extrabold text-amber-205 font-serif leading-tight">
                          {selectedRegion.name}
                        </h3>
                        <span className={`px-1.5 py-0.5 text-5xs uppercase tracking-wider rounded font-bold bg-slate-950 border border-slate-800 ${
                          selectedRegion.unlocked ? 'text-emerald-455 border-emerald-500/30' : 'text-red-400 border-red-500/30'
                        }`}>
                          {selectedRegion.unlocked ? 'Active' : 'Locked'}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        {selectedRegion.unlocked ? (
                          <span className="px-2 py-0.5 bg-emerald-955/60 text-emerald-400 border border-emerald-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
                            ✦ Exploration Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-955/60 text-red-400 border border-red-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
                            🔒 Story Sealed
                          </span>
                        )}
                      </div>

                      <p className="text-3xs text-slate-355 leading-relaxed mb-4">
                        {selectedRegion.desc}
                      </p>
                    </div>

                    {/* Actions Block */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80">
                      {selectedRegion.unlocked ? (
                        <button
                          onClick={() => setMapLevel('region1')}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-550 hover:from-amber-500 hover:to-amber-450 text-slate-950 rounded text-3xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-amber-500/10 transition-all text-center"
                        >
                          Enter Region Map
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-950 border border-slate-850 text-slate-500 rounded text-3xs font-extrabold uppercase tracking-widest cursor-not-allowed"
                        >
                          Region Locked
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-slate-500 text-3xs italic">
                    Select a region on the map to view details.
                  </div>
                )
              ) : selectedAdventure ? (
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
                        <span className="px-2 py-0.5 bg-emerald-955/60 text-emerald-400 border border-emerald-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
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
                          className="py-2.5 bg-emerald-955/60 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-emerald-200 rounded text-3xs font-bold uppercase tracking-wider cursor-pointer text-center transition-all"
                        >
                          🏰 Visit Area / Rest
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to replay the campaign? This will reset your story log for this area.")) {
                              onSelectAdventure(selectedAdventure.id, false);
                            }
                          }}
                          className="py-2.5 bg-slate-955 border border-slate-850 hover:border-amber-500/40 text-slate-350 hover:text-amber-400 rounded text-3xs font-bold uppercase tracking-wider cursor-pointer text-center transition-all"
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

      {/* Stronghold Chest Modal */}
      {isChestOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-slate-950 border border-amber-900/35 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] font-sans">
            
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-serif text-amber-400 tracking-wider flex items-center gap-2">
                  <span>🏰 Stronghold Chest (Stash)</span>
                </h3>
                <p className="text-3xs text-slate-400 uppercase tracking-widest mt-0.5">
                  Transfer gear between your character and home vault. Sell surplus items for 50% gold value.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChestOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 bg-slate-800 rounded cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/90">
              
              {/* Left Column: Character Inventory */}
              <div className="flex flex-col border border-slate-850 rounded-lg bg-slate-950 p-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                    <span>👤 Active Inventory</span>
                  </h4>
                  <div className="text-3xs text-slate-450 font-bold flex gap-3">
                    <span>💰 {character?.stats?.gold || 0} Gold</span>
                    <span>⚖️ Weight: {character?.inventory?.length || 0}/20 slots</span>
                  </div>
                </div>
                
                {(!character || !character.inventory || character.inventory.length === 0) ? (
                  <div className="flex-1 flex items-center justify-center text-3xs text-slate-500 italic py-12">
                    Your backpack is empty.
                  </div>
                ) : (
                  <ul className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                    {character.inventory.map((item, idx) => {
                      const value = getItemBaseValue(item);
                      return (
                        <li key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850 text-2xs">
                          <div>
                            <span className="font-semibold text-slate-250 capitalize">{item}</span>
                            <span className="text-[10px] text-slate-450 block">Value: {value}g (Sell: {Math.floor(value * 0.5)}g)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDepositToChest(item)}
                            className="px-2.5 py-1 rounded bg-amber-950 border border-amber-800/40 text-amber-400 hover:bg-amber-600/25 hover:border-amber-500/40 transition-colors text-3xs font-extrabold uppercase cursor-pointer"
                          >
                            Deposit 📥
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              
              {/* Right Column: Stronghold Chest */}
              <div className="flex flex-col border border-slate-850 rounded-lg bg-slate-950 p-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                    <span>📦 Stashed Items ({strongholdChest.length})</span>
                  </h4>
                </div>
                
                {strongholdChest.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-3xs text-slate-500 italic py-12">
                    Stash chest is empty. Items left on the ground during quests will appear here.
                  </div>
                ) : (
                  <ul className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                    {strongholdChest.map((item, idx) => {
                      const value = getItemBaseValue(item);
                      const sellPrice = Math.floor(value * 0.5);
                      return (
                        <li key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850 text-2xs">
                          <div>
                            <span className="font-semibold text-slate-250 capitalize">{item}</span>
                            <span className="text-[10px] text-slate-450 block">Value: {value}g (Sell: {sellPrice}g)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleWithdrawFromChest(idx)}
                              className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-600/25 hover:border-emerald-500/40 transition-colors text-3xs font-extrabold uppercase cursor-pointer"
                            >
                              Withdraw 📤
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSellFromChest(idx, sellPrice)}
                              className="px-2 py-1 rounded bg-red-955/30 border border-red-500/30 text-red-400 hover:bg-red-600/25 hover:border-red-500/40 transition-colors text-3xs font-extrabold uppercase cursor-pointer animate-pulse"
                            >
                              Sell 🪙
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              
            </div>
            
            {/* Modal Footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex justify-between items-center">
              <span className="text-3xs text-slate-500">
                Note: Equipping or unequipping items must be done during active play.
              </span>
              <button
                type="button"
                onClick={() => setIsChestOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-3xs font-extrabold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Close Vault
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-6 flex justify-center text-4xs text-slate-550 border-t border-slate-900 pt-3 text-center">
        <p>
          Complete quests to unlock further locations on the map. You can return to completed locations to rest, recover fatigue, and manage strongholds.
        </p>
      </div>

    </div>
  );
}
