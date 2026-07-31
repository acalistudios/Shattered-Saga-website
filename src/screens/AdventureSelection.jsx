import React, { useState } from 'react';
import { ADVENTURES_LIST } from '../data/adventures';
import { GMS } from '../data/gms';
import { printCharacterSheet } from '../utils/print';
import { getItemDetails } from '../utils/items';
import { coinValue } from '../data/economy';
import { WORLD_REGIONS, MAP_NODES, MAP_CONNECTIONS, MAP_IMAGES, REGION_TRANSIT_CHALLENGES } from '../data/cartography';

const isRegionStoryUnlocked = (regionId, completedAdventures = []) => {
  if (regionId === 'region1') return true;
  if (regionId === 'region2') {
    return completedAdventures.includes('saltblood_mines');
  }
  if (regionId === 'region3') {
    return completedAdventures.includes('ashveil_keep');
  }
  if (regionId === 'region4') {
    return completedAdventures.includes('sunken_spire') || completedAdventures.includes('clockwork_conservatory');
  }
  return false;
};

const isRegionUnlocked = (regionId, completedAdventures = [], character = {}) => {
  const storyUnlocked = isRegionStoryUnlocked(regionId, completedAdventures);
  if (!storyUnlocked) return false;
  return (character.unlocked_regions || ['region1']).includes(regionId) || regionId === 'region1';
};

// Helper to determine if a node is unlocked based on completed adventures
const getUnlockStatus = (advId, completedAdventures = []) => {
  // Base starting adventures in Region 1
  if (advId === 'ashveil_keep' || advId === 'saltblood_mines' || advId === 'elemental_crucible') {
    return { unlocked: true, requirements: [] };
  }
  
  // Unlocked by completing Ashveil Keep
  if (advId === 'clockwork_conservatory' || advId === 'sunken_spire' || advId === 'greywash_bandit_crown') {
    const isUnlocked = completedAdventures.includes('ashveil_keep');
    return { unlocked: isUnlocked, requirements: ['Ashveil Keep'] };
  }
  
  // Unlocked by completing Saltblood Mines
  if (advId === 'harvest_hill_hunger' || advId === 'thorn_treaty') {
    const isUnlocked = completedAdventures.includes('saltblood_mines');
    return { unlocked: isUnlocked, requirements: ['The Saltblood Mines'] };
  }
  
  // Unlocked by completing Elemental Crucible
  if (advId === 'mirror_war_saint_orra') {
    const isUnlocked = completedAdventures.includes('elemental_crucible');
    return { unlocked: isUnlocked, requirements: ['The Elemental Crucible'] };
  }
  
  // Region 2: Ignis Ridge (requires entering the region / completing Saltblood Mines)
  if (advId === 'obsidian_vault') {
    const isUnlocked = completedAdventures.includes('saltblood_mines');
    return { unlocked: isUnlocked, requirements: ['The Saltblood Mines'] };
  }
  if (advId === 'iron_colosseum' || advId === 'brass_plague_tinkertown') {
    const isUnlocked = completedAdventures.includes('obsidian_vault');
    return { unlocked: isUnlocked, requirements: ['The Obsidian Vault'] };
  }
  
  // Region 3: Frostfire Glacier (requires entering the region / completing Ashveil Keep)
  if (advId === 'frostfire_crypt') {
    const isUnlocked = completedAdventures.includes('ashveil_keep');
    return { unlocked: isUnlocked, requirements: ['Ashveil Keep'] };
  }
  if (advId === 'blackroot_hollow' || advId === 'merrin_abbey_plague_bells') {
    const isUnlocked = completedAdventures.includes('frostfire_crypt');
    return { unlocked: isUnlocked, requirements: ['The Frostfire Crypt'] };
  }
  
  // Region 4: Sapphire Deep (requires entering the region / completing Sunken Spire or Clockwork Conservatory)
  if (advId === 'astral_sky') {
    const isUnlocked = completedAdventures.includes('sunken_spire') || completedAdventures.includes('clockwork_conservatory');
    return { unlocked: isUnlocked, requirements: ['Whispers of the Sunken Spire or The Clockwork Conservatory'] };
  }
  if (advId === 'drowned_market' || advId === 'glass_orchard_masquerade') {
    const isUnlocked = completedAdventures.includes('astral_sky');
    return { unlocked: isUnlocked, requirements: ['Threads of the Astral Sky'] };
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
  onUpdateCharacterStats,
  sandboxMode = false,
  onOpenDowntimeMarket,
  unlockRegion,
  consumeItem,
  onExportSaveFile
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const completedAdventures = character?.completed_adventures || [];
  
  const currentHp = character?.stats?.hp || 10;
  const maxHp = character?.stats?.maxHp || 10;
  const minTravelHp = Math.min(maxHp, Math.max(10, Math.floor(maxHp * 0.5)));
  const isHealthSufficientForTravel = currentHp >= minTravelHp;

  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [mapLevel, setMapLevel] = useState('world'); // 'world' or 'region1'
  const [selectedRegionId, setSelectedRegionId] = useState('region1');
  const [selectedNodeId, setSelectedNodeId] = useState('ashveil_keep');

  const [activeTransitChallengeId, setActiveTransitChallengeId] = useState(null); // 'region2' | 'region3' | 'region4'
  const [transitRollResult, setTransitRollResult] = useState(null);
  const [transitMessage, setTransitMessage] = useState('');

  const rollDie = (s) => Math.floor(Math.random() * s) + 1;
  const rollAttribute = (score) => {
    if (score <= 1) return rollDie(4);
    if (score === 2) return rollDie(6);
    if (score === 3) return rollDie(8);
    if (score === 4) return rollDie(10);
    if (score === 5) return rollDie(12);
    if (score === 6) return rollDie(20);
    if (score === 7) return rollDie(20) + rollDie(4);
    if (score === 8) return rollDie(20) + rollDie(6);
    if (score === 9) return rollDie(20) + rollDie(8);
    return rollDie(20) + rollDie(10);
  };

  const handleTransitItemBypass = (challenge) => {
    const itemName = challenge.item;
    if (!character.inventory.includes(itemName) && !sandboxMode) return;
    
    if (!sandboxMode && consumeItem) {
      consumeItem(itemName);
    }
    if (unlockRegion) {
      unlockRegion(activeTransitChallengeId);
    }
    setTransitRollResult({ success: true, bypass: true });
    setTransitMessage(`You present the ${itemName}. ${challenge.successDesc}`);
  };

  const handleTransitSkillCheck = (challenge) => {
    const attr1 = challenge.attributes[0];
    const attr2 = challenge.attributes[1];
    const val1 = character.attributes[attr1] || 1;
    const val2 = character.attributes[attr2] || 1;
    const roll1 = rollAttribute(val1);
    const roll2 = rollAttribute(val2);
    const totalRoll = roll1 + roll2;
    const isSuccess = totalRoll >= challenge.difficulty || sandboxMode;

    if (isSuccess) {
      if (unlockRegion) {
        unlockRegion(activeTransitChallengeId);
      }
      setTransitRollResult({ success: true, totalRoll, roll1, roll2, attr1, attr2 });
      setTransitMessage(`[Success! Roll: ${totalRoll} (${attr1}: ${roll1}, ${attr2}: ${roll2}) vs Diff ${challenge.difficulty}]. ${challenge.successDesc}`);
    } else {
      if (onUpdateCharacterStats) {
        onUpdateCharacterStats(prev => {
          const nextHp = Math.max(1, prev.stats.hp - challenge.failDamage);
          return {
            ...prev,
            stats: {
              ...prev.stats,
              hp: nextHp
            }
          };
        });
      }
      setTransitRollResult({ success: false, totalRoll, roll1, roll2, attr1, attr2 });
      setTransitMessage(`[Failure! Roll: ${totalRoll} (${attr1}: ${roll1}, ${attr2}: ${roll2}) vs Diff ${challenge.difficulty}]. ${challenge.failDesc}`);
    }
  };

  const selectRegion = (regionId) => {
    setSelectedRegionId(regionId);
    setActiveTransitChallengeId(null);
    setTransitRollResult(null);
    setTransitMessage('');
  };

  const selectedRegion = WORLD_REGIONS.find(r => r.id === selectedRegionId);
  const selectedAdventure = ADVENTURES_LIST.find(a => a.id === selectedNodeId);

  const [isChestOpen, setIsChestOpen] = useState(false);

  const formatCoin = (coins) => {
    const parts = [];
    if (coins.gp > 0) parts.push(`${coins.gp}g`);
    if (coins.sp > 0) parts.push(`${coins.sp}s`);
    if (coins.cp > 0 || parts.length === 0) parts.push(`${coins.cp}c`);
    return parts.join(' ');
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

  const handleSellFromChest = (chestIdx, sellPriceCp, displayPrice) => {
    const itemName = strongholdChest[chestIdx];
    if (!itemName) return;

    if (!window.confirm(`Are you sure you want to sell your ${itemName} for ${displayPrice}?`)) {
      return;
    }

    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => {
        const currGp = prev.currency?.gp ?? prev.currency?.gold ?? 0;
        const currSp = prev.currency?.sp ?? 0;
        const currCp = prev.currency?.cp ?? 0;
        
        const totalCp = currGp * 100 + currSp * 10 + currCp + sellPriceCp;
        
        const newGp = Math.floor(totalCp / 100);
        const newSp = Math.floor((totalCp % 100) / 10);
        const newCp = totalCp % 10;
        
        return {
          ...prev,
          currency: {
            gp: newGp,
            sp: newSp,
            cp: newCp,
            gold: newGp,
            fateCoins: prev.currency?.fateCoins ?? 0
          }
        };
      });
    }
    if (onUpdateStrongholdChest) {
      const nextChest = [...strongholdChest];
      nextChest.splice(chestIdx, 1);
      onUpdateStrongholdChest(nextChest);
    }
  };

  const handleEmbarkWithWarning = (adventureId, isReplay) => {
    const unusedSlots = character?.trainingSlots || 0;
    if (unusedSlots > 2) {
      const excess = unusedSlots - 2;
      if (!window.confirm(`Warning: You have ${unusedSlots} unused training slots. You can only bank up to 2 training slots between adventures. Starting this quest now will waste ${excess} training slot(s). Do you wish to embark anyway?`)) {
        return;
      }
    }
    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => ({
        ...prev,
        trainingSlots: Math.min(2, prev.trainingSlots || 0)
      }));
    }
    onSelectAdventure(adventureId, isReplay);
  };

  const unlockState = selectedAdventure 
    ? (sandboxMode ? { unlocked: true, requirements: [] } : getUnlockStatus(selectedAdventure.id, completedAdventures)) 
    : { unlocked: false, requirements: [] };
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
              {mapLevel === 'world' ? 'CONTINENT MAP' : (WORLD_REGIONS.find(r => r.id === mapLevel)?.name || 'REGION MAP').toUpperCase()}
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
            
            {character.trainingSlots > 0 && (
              <div className="px-2.5 py-2 rounded bg-amber-950/40 border border-amber-800/40 text-[10px] font-extrabold text-amber-300 flex items-center gap-1.5 shadow-sm" title="Available Training Slots">
                <span>🎓</span>
                <span>Training: {character.trainingSlots}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsChestOpen(true)}
              className="px-3 py-2 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-350 hover:text-amber-400 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title="Open Stronghold Stash Chest"
            >
              <span>📦</span>
              <span>Stash ({strongholdChest.length})</span>
            </button>

            <button
              type="button"
              onClick={onOpenDowntimeMarket}
              className="px-3 py-2 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-355 hover:text-amber-400 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title="Visit Downtime Marketplace"
            >
              <span>🛒</span>
              <span>Market</span>
            </button>

            {onExportSaveFile && (
              <button
                type="button"
                onClick={onExportSaveFile}
                className="px-3 py-2 rounded bg-slate-905 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-355 hover:text-amber-400 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm bg-gradient-to-b from-slate-900 to-slate-950"
                title="Download JSON Game Save File"
              >
                <span>💾</span>
                <span>Save File</span>
              </button>
            )}
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
                src={MAP_IMAGES[mapLevel] || MAP_IMAGES.world} 
                alt="Saga Campaign Map" 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.92] select-none pointer-events-none filter sepia-[10%] brightness-[92%] contrast-[105%] z-0"
              />
              {/* SVG overlay (used for potential canvas effects/filters) */}
              <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <defs>
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
              </svg>

              {/* Zoom Out Button */}
              {mapLevel !== 'world' && (
                <button
                  onClick={() => setMapLevel('world')}
                  className="absolute top-4 left-4 z-20 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-400 hover:text-amber-400 cursor-pointer transition-colors shadow-lg flex items-center gap-1.5"
                  title="Return to Continent Map"
                >
                  🗺️ Zoom Out
                </button>
              )}

              {/* World Region Interactive Nodes */}
              {mapLevel === 'world' && WORLD_REGIONS.map((reg) => {
                const isSelected = selectedRegionId === reg.id;
                const storyUnlocked = sandboxMode || isRegionStoryUnlocked(reg.id, completedAdventures);
                const travelUnlocked = sandboxMode || isRegionUnlocked(reg.id, completedAdventures, character);
                
                let markerStyle = "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed opacity-50";
                let icon = "🔒";

                if (storyUnlocked) {
                  if (travelUnlocked) {
                    markerStyle = "bg-slate-950 border-amber-500 text-amber-305 hover:scale-110 shadow-[0_0_15px_rgba(245,158,11,0.25)]";
                    icon = "👁️";
                  } else {
                    markerStyle = "bg-slate-950 border-orange-500 text-orange-400 hover:scale-110 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse";
                    icon = "⚠️";
                  }
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
                      selectRegion(reg.id);
                    }}
                    onDoubleClick={() => {
                      if (storyUnlocked && travelUnlocked && isHealthSufficientForTravel) {
                        setMapLevel(reg.id);
                      }
                    }}
                  >

                    {/* Region Core Orb */}
                    <div className={`w-10 h-10 rounded-full border-[2px] flex items-center justify-center font-bold text-sm transition-all duration-300 ${markerStyle}`}>
                      {icon}
                    </div>

                    {/* Region Label */}
                    <div className="absolute pointer-events-none select-none text-center transition-all bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-bold text-slate-355 mt-1 whitespace-nowrap group-hover:text-amber-305 group-hover:bg-slate-950 top-12">
                      {reg.name}
                      {!storyUnlocked && <span className="text-red-400 ml-1">🔒</span>}
                      {storyUnlocked && !travelUnlocked && <span className="text-orange-400 ml-1">⚠️</span>}
                    </div>
                  </div>
                );
              })}

              {/* Map Interactive Nodes */}
              {mapLevel !== 'world' && ADVENTURES_LIST.map((adv) => {
                const coords = MAP_NODES[adv.id];
                if (!coords || coords.region !== mapLevel) return null;

                const { unlocked } = sandboxMode ? { unlocked: true } : getUnlockStatus(adv.id, completedAdventures);
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
                {mapLevel === 'world' ? '"Shattered Saga" Continent Map' : `"Shattered Saga" ${WORLD_REGIONS.find(r => r.id === mapLevel)?.name || 'Region Map'}`}
              </div>
            </div>

            {/* Split Sidebar Detail Panel */}
            <div className={`flex flex-col justify-between bg-slate-900/35 border border-slate-850 rounded-xl p-5 shadow-lg ${isDesktopLayout ? 'col-span-4 h-[520px]' : ''}`}>
              {mapLevel === 'world' ? (
                selectedRegion ? (
                  activeTransitChallengeId ? (() => {
                    const challenge = REGION_TRANSIT_CHALLENGES[activeTransitChallengeId];
                    if (!challenge) return null;
                    const hasItem = character.inventory.includes(challenge.item);

                    return (
                      <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                        <div>
                          {/* Header */}
                          <div className="h-28 rounded-lg overflow-hidden border border-red-500/20 bg-red-955/20 mb-4 flex flex-col items-center justify-center text-slate-350 font-serif text-3xs p-3 text-center relative">
                            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                            <span className="text-red-400 text-lg mb-1 animate-pulse">⚠️ DANGEROUS TRANSIT</span>
                            <span className="font-extrabold uppercase text-amber-205">{challenge.name}</span>
                          </div>

                          <h3 className="text-lg font-extrabold text-amber-205 font-serif mb-2">
                            Crossing Hazard
                          </h3>

                          <p className="text-3xs text-slate-300 leading-relaxed mb-4">
                            {challenge.peril}
                          </p>

                          {/* Current HP Status Indicator */}
                          <div className="flex justify-between items-center bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg mb-4 text-3xs">
                            <span className="text-slate-400 font-bold">❤️ Your Health:</span>
                            <span className="font-mono font-extrabold text-red-400">
                              {character.stats.hp} / {character.stats.maxHp || 10} HP
                            </span>
                          </div>

                          {transitRollResult ? (
                            <div className={`p-3 rounded border text-3xs mb-4 leading-normal ${
                              transitRollResult.success 
                                ? 'bg-emerald-955/20 border-emerald-500/20 text-emerald-300' 
                                : 'bg-red-955/20 border-red-500/20 text-red-300'
                            }`}>
                              <div className="font-extrabold mb-1">
                                {transitRollResult.success ? '✦ SUCCESS' : '✕ FAILURE'}
                              </div>
                              <p>{transitMessage}</p>
                            </div>
                          ) : (
                            <div className="space-y-3 mt-4">
                              {!isHealthSufficientForTravel && (
                                <div className="p-3 bg-red-955/20 border border-red-500/25 text-red-300 rounded-lg text-3xs leading-relaxed">
                                  <span className="font-extrabold block mb-1">⚠️ WOUNDED / EXHAUSTED</span>
                                  You are too weak to travel between regions. You must have at least <strong className="text-red-200">{minTravelHp} HP</strong> (current: {currentHp} HP). Stay at Dermot's Hearthstone Inn (or other taverns) or use healing herbs/poultices to recover.
                                </div>
                              )}

                              {/* Option A: Item Bypass */}
                              <button
                                onClick={() => handleTransitItemBypass(challenge)}
                                disabled={!isHealthSufficientForTravel || (!hasItem && !sandboxMode)}
                                className={`w-full py-2 px-3 border rounded text-3xs font-bold flex flex-col items-center transition-all ${
                                  isHealthSufficientForTravel && (hasItem || sandboxMode) 
                                    ? 'border-emerald-600 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/40 cursor-pointer' 
                                    : 'border-slate-850 bg-slate-950 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                <span className="uppercase tracking-widest font-extrabold">Use {challenge.item}</span>
                                <span className="text-4xs font-normal text-slate-400">
                                  {hasItem ? '(Consumes 1 item from inventory)' : '(Requires item in inventory)'}
                                </span>
                              </button>

                              {/* Option B: Skill Roll Check */}
                              <button
                                onClick={() => handleTransitSkillCheck(challenge)}
                                disabled={!isHealthSufficientForTravel}
                                className={`w-full py-2 px-3 border rounded text-3xs font-bold flex flex-col items-center transition-all ${
                                  isHealthSufficientForTravel
                                    ? 'border-amber-600 bg-amber-955/20 hover:bg-amber-900/30 text-amber-200 cursor-pointer'
                                    : 'border-slate-850 bg-slate-950 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                <span className="uppercase tracking-widest font-extrabold">
                                  Attempt Attribute Check
                                </span>
                                <span className="text-4xs font-normal text-amber-400/85">
                                  Roll: {challenge.attributes.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(' + ')} (Diff {challenge.difficulty})
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex gap-2">
                          {transitRollResult?.success ? (
                            <button
                              onClick={() => {
                                setMapLevel(activeTransitChallengeId);
                                setActiveTransitChallengeId(null);
                                setTransitRollResult(null);
                                setTransitMessage('');
                              }}
                              className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-550 hover:from-emerald-500 hover:to-emerald-450 text-slate-950 rounded text-3xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg transition-all text-center"
                            >
                              Enter Region Map
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveTransitChallengeId(null);
                                setTransitRollResult(null);
                                setTransitMessage('');
                              }}
                              className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 rounded text-3xs font-extrabold uppercase tracking-widest cursor-pointer transition-all text-center"
                            >
                              {transitRollResult?.success === false ? 'Return to Map' : 'Go Back'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })() : (() => {
                    const storyUnlocked = sandboxMode || isRegionStoryUnlocked(selectedRegion.id, completedAdventures);
                    const travelUnlocked = sandboxMode || isRegionUnlocked(selectedRegion.id, completedAdventures, character);

                    return (
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
                              travelUnlocked ? 'text-emerald-455 border-emerald-500/30' : !storyUnlocked ? 'text-red-400 border-red-500/30' : 'text-orange-400 border-orange-500/30'
                            }`}>
                              {travelUnlocked ? 'Active' : !storyUnlocked ? 'Locked' : 'Blocked'}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-3">
                            {travelUnlocked ? (
                              <span className="px-2 py-0.5 bg-emerald-955/60 text-emerald-400 border border-emerald-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
                                ✦ Exploration Active
                              </span>
                            ) : !storyUnlocked ? (
                              <span className="px-2 py-0.5 bg-red-955/60 text-red-400 border border-red-500/20 text-4xs uppercase tracking-wider font-extrabold rounded">
                                🔒 Story Sealed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-955/60 text-orange-400 border border-orange-500/20 text-4xs uppercase tracking-wider font-extrabold rounded animate-pulse">
                                ⚠️ Hazard Crossing Required
                              </span>
                            )}
                          </div>

                          <p className="text-3xs text-slate-355 leading-relaxed mb-4">
                            {selectedRegion.desc}
                          </p>
                        </div>

                        {/* Actions Block */}
                        <div className="mt-4 pt-4 border-t border-slate-800/80">
                          {!isHealthSufficientForTravel && storyUnlocked ? (
                            <>
                              <div className="p-3 bg-red-955/20 border border-red-500/25 text-red-300 rounded-lg text-3xs mb-3 leading-relaxed">
                                <span className="font-extrabold block mb-1">⚠️ WOUNDED / EXHAUSTED</span>
                                You are too weak to travel between regions. You must have at least <strong className="text-red-200">{minTravelHp} HP</strong> (current: {currentHp} HP). Stay at Dermot's Hearthstone Inn (or other taverns) or use healing herbs/poultices to recover.
                              </div>
                              <button
                                disabled
                                className="w-full py-2 bg-slate-950 border border-slate-850 text-slate-500 rounded text-3xs font-extrabold uppercase tracking-widest cursor-not-allowed"
                              >
                                Rest Required
                              </button>
                            </>
                          ) : storyUnlocked && travelUnlocked ? (
                            <button
                              onClick={() => setMapLevel(selectedRegion.id)}
                              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-550 hover:from-amber-500 hover:to-amber-450 text-slate-950 rounded text-3xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-amber-500/10 transition-all text-center"
                            >
                              Enter Region Map
                            </button>
                          ) : storyUnlocked && !travelUnlocked ? (
                            <button
                              onClick={() => {
                                setActiveTransitChallengeId(selectedRegion.id);
                                setTransitRollResult(null);
                                setTransitMessage('');
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-orange-550 hover:from-orange-500 hover:to-orange-450 text-slate-955 rounded text-3xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-orange-500/10 transition-all text-center"
                            >
                              Embark Transit Passage
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
                    );
                  })()
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
                          {isCompleted ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedAdventure.items.slice(0, 4).map((it, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-slate-955 border border-slate-800 text-slate-300 rounded text-5xs">
                                  {it}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-5xs text-slate-500 italic block">
                              🔒 Unlocked upon first quest completion.
                            </span>
                          )}
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
                            const isSandbox = sandboxMode;
                            const hasHourglass = character?.inventory?.some(item => item.toLowerCase().includes("chronicle hourglass"));
                            if (!isSandbox && !hasHourglass) {
                              alert("You need a Chronicle Hourglass in your inventory to replay a completed quest. You can purchase one from any Lore Keeper in the Downtime Market.");
                              return;
                            }
                            if (window.confirm("Are you sure you want to replay the campaign? This will reset your story log for this area." + (isSandbox ? "" : " This will consume 1 Chronicle Hourglass from your inventory."))) {
                              if (!isSandbox) {
                                if (onUpdateCharacterStats) {
                                  onUpdateCharacterStats(prev => {
                                    const updatedInv = [...(prev.inventory || [])];
                                    const idx = updatedInv.findIndex(item => item.toLowerCase().includes("chronicle hourglass"));
                                    if (idx !== -1) {
                                      updatedInv.splice(idx, 1);
                                    }
                                    return { ...prev, inventory: updatedInv };
                                  });
                                }
                              }
                              handleEmbarkWithWarning(selectedAdventure.id, false);
                            }
                          }}
                          className="py-2.5 bg-slate-955 border border-slate-850 hover:border-amber-500/40 text-slate-355 hover:text-amber-400 rounded text-3xs font-bold uppercase tracking-wider cursor-pointer text-center transition-all"
                        >
                          🔁 Replay Quest
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEmbarkWithWarning(selectedAdventure.id, false)}
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
              const { unlocked, requirements } = sandboxMode ? { unlocked: true, requirements: [] } : getUnlockStatus(adv.id, completedAdventures);
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
                    <span>💰 {formatCoin(character?.currency || { gp: 0, sp: 0, cp: 0 })}</span>
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
                      const details = getItemDetails(item);
                      const basePrice = formatCoin(details.value);
                      const sellPriceCp = Math.floor(details.valueCp * 0.5) || 1;
                      const sellPrice = formatCoin(coinValue(sellPriceCp));
                      return (
                        <li key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850 text-2xs">
                          <div>
                            <span className="font-semibold text-slate-250 capitalize">{item}</span>
                            <span className="text-[10px] text-slate-450 block">Value: {basePrice} (Sell: {sellPrice})</span>
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
                      const details = getItemDetails(item);
                      const basePrice = formatCoin(details.value);
                      const sellPriceCp = Math.floor(details.valueCp * 0.5) || 1;
                      const sellPrice = formatCoin(coinValue(sellPriceCp));
                      return (
                        <li key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850 text-2xs">
                          <div>
                            <span className="font-semibold text-slate-250 capitalize">{item}</span>
                            <span className="text-[10px] text-slate-450 block">Value: {basePrice} (Sell: {sellPrice})</span>
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
                              onClick={() => handleSellFromChest(idx, sellPriceCp, sellPrice)}
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
