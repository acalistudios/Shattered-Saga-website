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
  layoutMode = 'desktop'
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const completedAdventures = character?.completed_adventures || [];
  
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [mapLevel, setMapLevel] = useState('world'); // 'world' or 'region1'
  const [selectedRegionId, setSelectedRegionId] = useState('region1');
  const [selectedNodeId, setSelectedNodeId] = useState('ashveil_keep');

  const selectedRegion = WORLD_REGIONS.find(r => r.id === selectedRegionId);
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
              
              {/* SVG Link lines and background map elements */}
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  {/* Mountain symbol */}
                  <g id="map-mountain" stroke="#d97706" strokeWidth="1" fill="#1e293b" fillOpacity="0.8">
                    <polygon points="0,-8 -8,8 8,8" />
                    <line x1="0" y1="-8" x2="-1" y2="8" stroke="#f59e0b" strokeWidth="0.8" />
                  </g>

                  {/* Volcanic peak symbol */}
                  <g id="map-volcano" stroke="#f43f5e" strokeWidth="1.2" fill="#1e1b4b" fillOpacity="0.8">
                    <polygon points="0,-10 -10,10 10,10" />
                    <polygon points="0,-10 -3,-3 3,-3" fill="#ef4444" stroke="none" />
                  </g>

                  {/* Pine tree symbol */}
                  <g id="map-tree" stroke="#059669" strokeWidth="0.8" fill="#064e3b" fillOpacity="0.85">
                    <polygon points="0,-5 -4,3 4,3" />
                    <polygon points="0,0 -5,8 5,8" />
                    <line x1="0" y1="8" x2="0" y2="10" stroke="#78350f" />
                  </g>

                  {/* Dead tree symbol (for graveyard/wasteland) */}
                  <g id="map-dead-tree" stroke="#64748b" strokeWidth="1" strokeLinecap="round">
                    <line x1="0" y1="8" x2="0" y2="0" />
                    <line x1="0" y1="3" x2="-3" y2="1" />
                    <line x1="0" y1="1" x2="3" y2="-1" />
                  </g>

                  {/* Snow mountain symbol */}
                  <g id="map-snow-mountain" stroke="#38bdf8" strokeWidth="1" fill="#0f172a" fillOpacity="0.8">
                    <polygon points="0,-8 -8,8 8,8" />
                    <polygon points="0,-8 -3,0 3,0" fill="#e0f2fe" stroke="none" />
                  </g>
                </defs>

                {mapLevel === 'world' ? (
                  <>
                    {/* --- WORLD MAP VISUALS --- */}
                    {/* High-level continent shape */}
                    <path 
                      d="M 150 150 C 250 80, 450 50, 600 100 C 750 150, 850 200, 820 350 C 790 480, 650 520, 500 500 C 350 480, 200 520, 150 400 C 100 280, 50 220, 150 150 Z" 
                      fill="#0f172a" 
                      fillOpacity="0.4" 
                      stroke="#d97706" 
                      strokeWidth="2" 
                      strokeOpacity="0.25" 
                    />
                    
                    {/* Oceans and Seas decoration */}
                    <text x="500" y="80" fill="#64748b" fontSize="12" fontStyle="italic" opacity="0.4" textAnchor="middle" letterSpacing="6">THE WHISPERING DEEP</text>
                    <text x="500" y="540" fill="#64748b" fontSize="12" fontStyle="italic" opacity="0.4" textAnchor="middle" letterSpacing="6">THE SHATTERED SEA</text>
                    <text x="150" y="480" fill="#64748b" fontSize="10" fontStyle="italic" opacity="0.3" textAnchor="middle" letterSpacing="4">FORBIDDEN REACHES</text>

                    {/* Dotted travel lines connecting regions */}
                    <path d="M 350 270 Q 500 220 650 180" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="6,6" strokeOpacity="0.2" />
                    <path d="M 350 270 Q 450 360 550 450" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="6,6" strokeOpacity="0.2" />
                    <path d="M 350 270 Q 250 345 200 420" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="6,6" strokeOpacity="0.2" />

                    {/* World Map decorative elements */}
                    <use href="#map-mountain" x="480" y="150" />
                    <use href="#map-mountain" x="510" y="180" />
                    <use href="#map-mountain" x="540" y="210" />
                    
                    <use href="#map-tree" x="250" y="180" />
                    <use href="#map-tree" x="280" y="210" />
                    <use href="#map-tree" x="220" y="220" />
                    
                    <use href="#map-snow-mountain" x="520" y="420" />
                    <use href="#map-snow-mountain" x="550" y="450" />
                  </>
                ) : (
                  <>
                    {/* --- REGION 1 MAP VISUALS --- */}
                    {/* Region 1 Landmass Outline */}
                    <path 
                      d="M 60 120 C 220 50, 520 30, 780 90 C 920 130, 970 280, 940 430 C 870 540, 620 570, 450 530 C 280 500, 90 550, 50 400 C 20 280, 10 160, 60 120 Z" 
                      fill="#0f172a" 
                      fillOpacity="0.35" 
                      stroke="#d97706" 
                      strokeWidth="1.5" 
                      strokeOpacity="0.25" 
                    />
                    
                    {/* Coastal wave rings */}
                    <path 
                      d="M 55 115 C 215 45, 515 25, 785 85 C 925 125, 975 275, 945 425 C 875 535, 625 565, 445 525 C 275 495, 85 545, 45 395 C 15 275, 5 155, 55 115 Z" 
                      fill="none" 
                      stroke="#d97706" 
                      strokeWidth="0.8" 
                      strokeOpacity="0.12" 
                    />

                    {/* Water Bodies (Lake Aetherius) */}
                    <ellipse cx="480" cy="240" rx="90" ry="60" fill="#1e3a8a" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
                    <ellipse cx="480" cy="240" rx="50" ry="33" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.3" />
                    
                    {/* Rivers */}
                    <path d="M 450 48 C 420 100, 400 120, 440 180 T 480 240" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.35" />
                    <path d="M 480 240 C 580 258, 640 288, 700 330 T 880 390" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.35" />
                    
                    {/* Forests (Whispering Woods near Ashveil Keep x:18% y:25% -> X:180 Y:150) */}
                    <use href="#map-tree" x="100" y="90" />
                    <use href="#map-tree" x="130" y="72" />
                    <use href="#map-tree" x="180" y="84" />
                    <use href="#map-tree" x="220" y="96" />
                    <use href="#map-tree" x="120" y="168" />
                    <use href="#map-tree" x="150" y="192" />
                    <use href="#map-tree" x="240" y="180" />
                    <use href="#map-tree" x="260" y="132" />

                    {/* Wastelands (Saltblood Mines area x:18% y:70% -> X:180 Y:420) */}
                    <use href="#map-dead-tree" x="120" y="372" />
                    <use href="#map-dead-tree" x="150" y="444" />
                    <use href="#map-dead-tree" x="220" y="390" />
                    <use href="#map-dead-tree" x="240" y="456" />
                    
                    {/* Volcanic Mountains (Obsidian Vault area x:45% y:62% -> X:450 Y:372) */}
                    <use href="#map-mountain" x="380" y="348" />
                    <use href="#map-mountain" x="400" y="384" />
                    <use href="#map-mountain" x="520" y="378" />
                    <use href="#map-mountain" x="490" y="342" />
                    
                    {/* Frozen Mountains (Frostfire Crypt area x:48% y:82% -> X:480 Y:492) */}
                    <use href="#map-snow-mountain" x="420" y="510" />
                    <use href="#map-snow-mountain" x="540" y="498" />
                    <use href="#map-snow-mountain" x="450" y="534" />

                    {/* Region Text Labels */}
                    <text x="140" y="108" fill="#64748b" fontSize="8" fontStyle="italic" opacity="0.65" textAnchor="middle">Whispering Woods</text>
                    <text x="120" y="468" fill="#64748b" fontSize="8" fontStyle="italic" opacity="0.65" textAnchor="middle">Saltblood Badlands</text>
                    <text x="370" y="384" fill="#b45309" fontSize="8" fontStyle="italic" opacity="0.65" textAnchor="end">Ignis Ridge</text>
                    <text x="480" y="276" fill="#3b82f6" fontSize="8" fontStyle="italic" opacity="0.65" textAnchor="middle">Lake Aetherius</text>
                    <text x="560" y="534" fill="#0ea5e9" fontSize="8" fontStyle="italic" opacity="0.65" textAnchor="start">Frostfire Glacier</text>

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
                          className={isActive ? "stroke-amber-500/50 stroke-[2.5]" : "stroke-slate-800/40 stroke-[1.5]"}
                          strokeDasharray={isActive ? "none" : "6,6"}
                          filter={isActive ? "url(#glow-gold)" : "none"}
                        />
                      );
                    })}
                  </>
                )}
              </svg>

              {/* Decorative Compass Rose SVG */}
              <div className="absolute bottom-4 left-4 w-16 h-16 opacity-25 pointer-events-none rotate-12">
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

      {/* Footer info */}
      <div className="mt-6 flex justify-center text-4xs text-slate-550 border-t border-slate-900 pt-3 text-center">
        <p>
          Complete quests to unlock further locations on the map. You can return to completed locations to rest, recover fatigue, and manage strongholds.
        </p>
      </div>

    </div>
  );
}
