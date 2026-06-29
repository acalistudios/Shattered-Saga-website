import React, { useState, useEffect, useRef } from 'react';
import { SKILLS_LIST, ATTRIBUTE_LIST } from '../data/gms';
import { printCharacterSheet, printAdventureLog } from '../utils/print';
import { signCharacter } from '../utils/secureHash';
import { ADVENTURES_LIST } from '../data/adventures';
import { PRESET_METADATA } from '../data/portraits';
import storage from '../utils/storage';
import { calculateWeightAndVolume, getItemDetails, getItemSlot } from '../utils/items';

const MOCK_ADS = [
  "Martha's Provisions: Stock up on Rations today! (10% off for Earth-Kin)",
  "Vance's Forge: +1 Shields in stock. Ask for the Ashveil road discount!",
  "Aethelgard Elixirs: Restore your SP instantly. Pure ingredients, no filler.",
  "Need a healer? Visit Mirra at the prisoner barracks. Redvein ore extraction site.",
  "Wanted: Able-bodied fighters to clear the mines. High hazard pay. Inquire at Tavern.",
  "The Wandering Mage Shop: Spell scrolls of Fireball and Invisibility back in stock!",
  "Whispering Woods Inn: Warm hearth, cold ale, and double-locked doors for safety."
];

const DIFFICULTY_LABELS = {
  novice: 'Novice',
  professional: 'Professional',
  veteran: 'Veteran',
  legendary: 'Legendary'
};

function formatTime(day, hourFloat) {
  const totalMinutes = Math.round(hourFloat * 60);
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minStr = minutes < 10 ? `0${minutes}` : minutes;
  return `Day ${day}, ${hour12}:${minStr} ${ampm}`;
}

export default function PlayScreen({
  character,
  activeGm,
  userProfile,
  gmEnergies,
  history,
  journal,
  skillTally,
  isLoading,
  apiError,
  warningMessage,
  isUpgradeScreenVisible,
  onSendAction,
  onTriggerVisualize,
  onResetGame,
  onOpenSettings,
  executeMilestoneUpgrades,
  settings,
  onRetryLastAction,
  onQuitAdventure,
  onExitAdventure,
  activeAdventureId,
  onUpdatePortrait,
  gems,
  onEatRation,
  onRest,
  onConvertSP,
  onToggleEquip,
  onEquipItem,
  onUnequipItem,
  onDropItem,
  onPickUpItem,
  currentLocation,
  droppedItems,
  layoutMode = 'desktop',
  enemyAttacksQueue = [],
  onResolveEnemyAttack,
  onUseInventoryItem,
  audio
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (settings?.engineTier !== 'free') return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % MOCK_ADS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [settings?.engineTier]);

  const [inputText, setInputText] = useState('');
  const [skillFocus, setSkillFocus] = useState(''); // Empty string means no specific check
  const [difficulty, setDifficulty] = useState('professional');
  const [spSpend, setSpSpend] = useState(0);

  useEffect(() => {
    if (skillFocus === 'arcane_shaping' || skillFocus === 'divine_manifestation') {
      const rank = character.skills[skillFocus] || 0;
      setSpSpend(Math.min(1, rank));
    } else {
      setSpSpend(0);
    }
  }, [skillFocus, character.skills]);
  
  const [isJournalOpen, setIsJournalOpen] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [activeItemMenu, setActiveItemMenu] = useState(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isStrongholdsOpen, setIsStrongholdsOpen] = useState(false);
  const [isRelationshipsOpen, setIsRelationshipsOpen] = useState(false);
  const [isScarsOpen, setIsScarsOpen] = useState(false);
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // States for Level Up Portrait Refinement
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const levelUpFileRef = useRef(null);
  const [galleryGenderFilter, setGalleryGenderFilter] = useState('All');
  const [galleryAgeFilter, setGalleryAgeFilter] = useState('All');

  // Sync filters when opening gallery
  useEffect(() => {
    if (isGalleryOpen) {
      setGalleryGenderFilter(character.gender);
      setGalleryAgeFilter(character.age);
    }
  }, [isGalleryOpen, character.gender, character.age]);

  const handleSelectPreset = (index) => {
    const url = `/portraits/portrait_${index}.jpg`;
    onUpdatePortrait(url, index);
    setIsGalleryOpen(false);
  };

  const handleUploadLevelUpPortrait = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdatePortrait(event.target.result, 9999);
    };
    reader.readAsDataURL(file);
  };

  // States for the Level Up Upgrade Modal
  const [selectedUpgradeSkill, setSelectedUpgradeSkill] = useState('');

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    // Call state sender passing the text, key, sandbox, and the skill focus + difficulty
    onSendAction(
      inputText.trim(),
      skillFocus || null,
      difficulty,
      spSpend
    );
    
    setInputText('');
    setSkillFocus(''); // Reset focus
  };

  const handlePrintCharacter = () => {
    printCharacterSheet(character);
  };

  const handleDownloadBackup = () => {
    const signedChar = signCharacter(character);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(signedChar, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${character.name.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleVisualizeClick = () => {
    const lastNarrative = [...history]
      .reverse()
      .find((h) => h.role === 'model' && !h.isManualImage);

    if (!lastNarrative) return;
    
    const textSnippet = lastNarrative.content.substring(0, 120);
    const customPrompt = `${textSnippet}, high fantasy digital art, epic scales, highly detailed`;
    onTriggerVisualize(customPrompt);
  };

  const handleQuitAdventure = () => {
    const confirmQuit = window.confirm(
      "Are you sure you want to forfeit your active adventure?\n\nQuitting will wipe current campaign progress, forfeit one random inventory item, and lose half of your gold."
    );
    if (confirmQuit) {
      onQuitAdventure();
    }
  };

  const handleExitAdventure = () => {
    const confirmExit = window.confirm(
      "Are you sure you want to exit to the main menu?\n\nYour character's current items, gold, level, time, and active stats will be saved exactly as they are."
    );
    if (confirmExit) {
      onExitAdventure();
    }
  };

  // Determine most used skill from tally
  let mostUsedSkillId = null;
  let maxUses = 0;
  Object.keys(skillTally).forEach((skillId) => {
    if (skillTally[skillId] > maxUses) {
      maxUses = skillTally[skillId];
      mostUsedSkillId = skillId;
    }
  });
  const mostUsedSkillName = SKILLS_LIST.find((s) => s.id === mostUsedSkillId)?.name || 'None';

  // Find other skills used for upgrade select (cannot be the most used skill, must have > 0 uses)
  const otherUsedSkills = SKILLS_LIST.filter(
    (sk) => skillTally[sk.id] > 0 && sk.id !== mostUsedSkillId
  );

  const sessionToken = storage.get('supabase_session_token');
  const energyBalance = userProfile ? userProfile.energy_balance : null;
  const energyIsCritical = sessionToken ? (energyBalance !== null && energyBalance <= 10) : (gmEnergies[activeGm.id] <= 20);
  const activeAdventure = ADVENTURES_LIST.find((a) => a.id === activeAdventureId);
  const activeRoom = currentLocation || activeAdventure?.settings?.[0] || null;
  const activeRoomChoices = activeRoom ? (activeAdventure?.settingChoices?.[activeRoom] || []) : [];
  const activeRoomImage = activeRoom ? activeAdventure?.settingImages?.[activeRoom] : null;
  const getSkillLabel = (skillId) => (
    SKILLS_LIST.find((skill) => skill.id === skillId)?.name || skillId.replace(/_/g, ' ')
  );

  const handleSuggestedChoice = (choice) => {
    if (!choice || isLoading) return;

    const rank = character.skills?.[choice.skill] || 0;
    const suggestedSpSpend = ['arcane_shaping', 'divine_manifestation'].includes(choice.skill)
      ? Math.min(1, rank)
      : 0;

    onSendAction(choice.text, choice.skill || null, choice.difficulty || 'professional', suggestedSpSpend);
    setInputText('');
    setSkillFocus('');
    setDifficulty('professional');
    setSpSpend(0);
  };

  return (
    <div className={`flex-1 flex h-full overflow-hidden bg-slate-950 relative ${isDesktopLayout ? 'flex-row' : 'flex-col'}`}>
      
      {/* ----------------- LEFT SIDEBAR (GM & V4 Stats) ----------------- */}
      <div className={`
        inset-y-0 left-0 z-35 w-76 border-r border-slate-900 p-4 flex flex-col justify-between transition-transform duration-300
        ${isDesktopLayout 
          ? 'relative w-68 lg:w-76 bg-slate-900/40 translate-x-0' 
          : `absolute bg-slate-900/95 ${isStatsOpen ? 'translate-x-0' : '-translate-x-full'}`
        }
      `}>
        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
          
          {/* GM Status Card */}
          <div className="rounded border border-amber-500/20 bg-slate-950/60 p-4">
            <h3 className="text-2xs uppercase tracking-widest text-slate-500 font-bold mb-3">Active Game Master</h3>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full overflow-hidden border ${activeGm.theme.avatarBorder} bg-slate-900`}>
                <img
                  src={activeGm.avatar}
                  alt={activeGm.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className={`text-md font-bold ${activeGm.theme.accentText}`}>{activeGm.name}</h4>
                <p className="text-3xs text-slate-400 capitalize">{activeGm.provider} pipeline</p>
              </div>
            </div>

            {/* Energy bar */}
            <div className="mt-4 pt-3 border-t border-slate-900/60">
              <div className="flex justify-between items-center text-3xs font-semibold mb-1">
                <span className="text-slate-450">
                  {sessionToken ? 'Remaining Turns' : 'Magical Power'}
                </span>
                <span className={energyIsCritical ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-350'}>
                  {sessionToken 
                    ? (energyBalance !== null ? `${energyBalance} Turns` : 'Loading...')
                    : `${gmEnergies[activeGm.id]}%`
                  }
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                <div
                  className={`h-full transition-all duration-350 rounded-full ${activeGm.theme.barColor} ${
                    energyIsCritical ? 'energy-pulse-active' : ''
                  }`}
                  style={{ 
                    width: sessionToken 
                      ? (energyBalance !== null ? `${Math.min(100, (energyBalance / 100) * 100)}%` : '0%')
                      : `${gmEnergies[activeGm.id]}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Character Identity & Attributes */}
          <div className="rounded border border-slate-800 bg-slate-950/45 p-4 space-y-4">
            <div>
              {character.portraitUrl ? (
                <div className="w-full mb-3">
                  <div className="w-full aspect-square rounded border border-amber-500/20 overflow-hidden bg-slate-950">
                    <img
                      src={character.portraitUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square rounded border border-dashed border-slate-800 flex flex-col items-center justify-center mb-3 bg-slate-950/50 p-4">
                  <div className="w-8 h-8 rounded-full border border-dashed border-slate-800/40 flex items-center justify-center mb-1 text-slate-650 text-xs font-serif">
                    ?
                  </div>
                  <span className="text-5xs text-slate-550 uppercase tracking-wider font-semibold">No Portrait</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-1 gap-2">
                <h4 className="text-sm font-bold text-slate-200 truncate" title={character.name}>{character.name}</h4>
                <span className="px-2 py-0.5 text-3xs font-bold bg-slate-850 rounded border border-slate-700 text-slate-350 whitespace-nowrap">
                  Lvl {character.stats.level}
                </span>
              </div>
              <p className="text-3xs text-slate-450 uppercase font-semibold tracking-wider whitespace-nowrap truncate" title={`${character.gender} • ${character.age} • ${character.element.toUpperCase()}-KIN`}>
                {character.gender} • {character.age} • {character.element.toUpperCase()}-KIN
              </p>
              {character.stats.day !== undefined && character.stats.hour !== undefined && (
                <div className="mt-2 py-1 px-2 rounded bg-slate-900 border border-slate-800 text-3xs font-extrabold tracking-wide text-amber-400 flex items-center gap-1.5 justify-center shadow-sm">
                  <span>📅 {formatTime(character.stats.day, character.stats.hour)}</span>
                </div>
              )}
              {character.daysWithoutFood > 0 && (
                <div className="mt-2 p-1.5 rounded border border-rose-500/35 bg-rose-950/25 text-4xs text-rose-400 font-extrabold uppercase flex justify-between items-center animate-pulse shadow-sm shadow-rose-950/20">
                  <span>⚠️ Starving (Day {character.daysWithoutFood})</span>
                  <span>-{character.daysWithoutFood} to rolls</span>
                </div>
              )}
              {character.stats.fatigue !== undefined && character.stats.fatigue < 0 && (
                <div className="mt-2 p-1.5 rounded border border-yellow-500/35 bg-yellow-950/25 text-4xs text-yellow-400 font-extrabold uppercase flex flex-col gap-0.5 justify-between shadow-sm shadow-yellow-950/20">
                  <div className="flex justify-between items-center">
                    <span>⚠️ Exhausted (Fatigue: {character.stats.fatigue.toFixed(1)})</span>
                    <span>-{Math.floor(Math.abs(character.stats.fatigue) * 2)} to rolls</span>
                  </div>
                  <p className="text-[10px] text-yellow-550/90 font-normal lowercase normal-case italic mt-0.5 leading-none">
                    (Advise: setting up camp and resting for 8 hours is highly recommended)
                  </p>
                </div>
              )}
              <div className="text-4xs text-slate-500 mt-1 capitalize whitespace-nowrap truncate" title={`Virtue: ${character.virtue} | Vice: ${character.vice}`}>
                Virtue: <strong className="text-emerald-450">{character.virtue}</strong> | Vice: <strong className="text-rose-450">{character.vice}</strong>
              </div>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={onRest}
                  disabled={isLoading}
                  className="w-full py-1.5 px-3 rounded text-3xs uppercase tracking-wider font-bold border border-emerald-500/20 text-emerald-400 bg-emerald-950/15 hover:bg-emerald-950/30 hover:border-emerald-500/50 cursor-pointer text-center block transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Rest (8 Hours)
                </button>
                <button
                  type="button"
                  onClick={handlePrintCharacter}
                  className="w-full py-1.5 px-3 rounded text-3xs uppercase tracking-wider font-bold border border-amber-550/20 text-amber-400 bg-amber-950/15 hover:bg-amber-950/30 hover:border-amber-500/50 cursor-pointer text-center block transition-all"
                >
                  Print Signed Sheet
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-1.5 px-3 rounded text-3xs uppercase tracking-wider font-bold border border-amber-550/20 text-amber-400 bg-amber-950/15 hover:bg-amber-950/30 hover:border-amber-500/50 cursor-pointer text-center block transition-all"
                >
                  Download Backup File
                </button>
              </div>
            </div>

            {/* HP Bar */}
            <div>
              <div className="flex justify-between items-center text-3xs mb-1 font-semibold">
                <span className="text-slate-400">Health Points</span>
                <span className="text-rose-400">{character.stats.hp} / {character.stats.maxHp}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-900 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(character.stats.hp / character.stats.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {character.stats.bleedingTier > 0 && (
              <div className="mt-2 p-1.5 rounded border border-rose-500/40 bg-rose-950/20 text-4xs text-rose-450 font-extrabold uppercase flex justify-between items-center animate-pulse shadow-sm shadow-rose-950/30">
                <span>🩸 Bleeding (Tier {character.stats.bleedingTier})</span>
                <span>-{character.stats.bleedingTier} HP / action</span>
              </div>
            )}
            {character.stats.deathCountdown !== null && (
              <div className="mt-2 p-1.5 rounded border border-red-650 bg-red-950/30 text-4xs text-red-400 font-extrabold uppercase flex flex-col gap-0.5 justify-between animate-pulse shadow-sm shadow-red-950/40">
                <span className="text-center font-serif text-red-500">💀 DYING COUNTDOWN 💀</span>
                <div className="flex justify-between items-center text-red-405">
                  <span>Turns to Death:</span>
                  <span className="text-red-500 font-bold text-3xs">{character.stats.deathCountdown} / 5</span>
                </div>
              </div>
            )}

            {/* Fatigue Bar */}
            <div>
              <div className="flex justify-between items-center text-3xs mb-1 font-semibold">
                <span className="text-slate-400">Fatigue Points</span>
                <span className={character.stats.fatigue < 0 ? "text-rose-400" : "text-amber-400"}>
                  {character.stats.fatigue !== undefined ? character.stats.fatigue.toFixed(1) : 0} / {character.stats.maxFatigue || 15}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${character.stats.fatigue < 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, ((character.stats.fatigue || 0) / (character.stats.maxFatigue || 15)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Arcane SP Bar */}
            {character.stats.maxArcaneSP > 0 && (
              <div>
                <div className="flex justify-between items-center text-3xs mb-1 font-semibold">
                  <span className="text-slate-400">Arcane Spell Points</span>
                  <span className="text-purple-400">{character.stats.arcaneSP} / {character.stats.maxArcaneSP}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(character.stats.arcaneSP / character.stats.maxArcaneSP) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Divine SP Bar */}
            {character.stats.maxDivineSP > 0 && (
              <div>
                <div className="flex justify-between items-center text-3xs mb-1 font-semibold">
                  <span className="text-slate-400">Divine Spell Points</span>
                  <span className="text-cyan-400">{character.stats.divineSP} / {character.stats.maxDivineSP}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${(character.stats.divineSP / character.stats.maxDivineSP) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* SP Conversion UI */}
            {character.stats.maxArcaneSP > 0 && character.stats.maxDivineSP > 0 && (
              <div className="border-t border-slate-900/60 pt-2">
                <div className="flex gap-1.5 justify-between text-[10px]">
                  <button
                    type="button"
                    onClick={() => onConvertSP('arcane_to_divine')}
                    disabled={character.stats.arcaneSP < 3}
                    className="flex-1 py-1 px-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-center font-bold"
                  >
                    Arcane → Divine (3:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => onConvertSP('divine_to_arcane')}
                    disabled={character.stats.divineSP < 3}
                    className="flex-1 py-1 px-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-center font-bold"
                  >
                    Divine → Arcane (3:1)
                  </button>
                </div>
              </div>
            )}

            {/* Core Stats values */}
            <div className="border-t border-slate-900/60 pt-3">
              <h4 className="text-3xs uppercase tracking-widest text-slate-500 font-bold mb-2">Core Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-2xs">
                {ATTRIBUTE_LIST.map((attr) => (
                  <div key={attr.id} className="flex justify-between bg-slate-950/50 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-400 capitalize">{attr.id.substring(0, 4)}.</span>
                    <strong className="text-amber-450">{character.attributes[attr.id] || 1}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Skills Card */}
          <div className="rounded border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-2xs uppercase tracking-widest text-slate-500 font-bold mb-3">Trained Skills</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {SKILLS_LIST.map((sk) => {
                const rank = character.skills[sk.id] || 0;
                if (rank <= 0) return null; // Only show trained skills to save space
                return (
                  <div key={sk.id} className="flex justify-between items-center text-2xs border-b border-slate-900 pb-1">
                    <span className="text-slate-350 capitalize">{sk.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-450 font-extrabold text-3xs">
                      {rank} Ranks
                    </span>
                  </div>
                );
              })}
              {Object.values(character.skills).every(v => v === 0) && (
                <p className="text-3xs text-slate-550 italic">No trained skills.</p>
              )}
            </div>
          </div>

          {/* Equipped Items Card */}
          <div className="rounded border border-amber-500/20 bg-slate-950/45 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-2xs uppercase tracking-widest text-slate-500 font-bold">Equipped Gear</h3>
              <button
                type="button"
                onClick={() => setIsEquipmentOpen(true)}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850 hover:border-amber-500/40 text-amber-450 hover:text-amber-455 text-5xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                Manage
              </button>
            </div>
            <div className="space-y-2 text-2xs">
              <div className="flex justify-between items-center border-b border-slate-900/50 pb-1.5">
                <span className="text-slate-400 font-medium">Right Hand:</span>
                <strong className={character.equipment?.hand_right ? "text-amber-455 truncate max-w-[130px]" : "text-slate-650 italic"}>
                  {character.equipment?.hand_right || 'Empty'}
                </strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-900/50 pb-1.5">
                <span className="text-slate-400 font-medium">Left Hand:</span>
                <strong className={character.equipment?.hand_left ? "text-amber-455 truncate max-w-[130px]" : "text-slate-650 italic"}>
                  {character.equipment?.hand_left || 'Empty'}
                </strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-900/50 pb-1.5">
                <span className="text-slate-400 font-medium">Armor (Body):</span>
                <strong className={character.equipment?.body ? "text-amber-455 truncate max-w-[130px]" : "text-slate-650 italic"}>
                  {character.equipment?.body || 'Empty'}
                </strong>
              </div>
              <div className="flex justify-between items-center pb-0.5">
                <span className="text-slate-400 font-medium">Backpack:</span>
                <strong className={character.equipment?.backpack ? "text-amber-455 truncate max-w-[130px]" : "text-slate-650 italic"}>
                  {character.equipment?.backpack || 'None'}
                </strong>
              </div>
            </div>
          </div>

          {/* Backpack Inventory */}
          <div className="rounded border border-slate-800 bg-slate-950/45 p-4">
            <h3 className="text-2xs uppercase tracking-widest text-slate-500 font-bold mb-2">Inventory</h3>
            <ul className="space-y-1 text-2xs text-slate-355 font-medium">
              {character.inventory.map((item, idx) => {
                const isRations = item.toLowerCase().includes('rations');
                const nameLower = item.toLowerCase();
                const isBandage = nameLower.includes('bandage');
                const isHealerKit = nameLower.includes("healer's kit") || nameLower.includes("healer's satchel");
                const isHerb = nameLower.includes('herb') || nameLower.includes('poultice');
                const isUsable = isBandage || isHealerKit || isHerb;
                return (
                  <li key={idx} className="flex items-center justify-between gap-2 capitalize border-b border-slate-900/40 py-1">
                    <span className="flex items-center gap-2 truncate pr-2" title={item}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </span>
                    <div className="flex gap-1.5 items-center flex-shrink-0">
                      {isUsable && (
                        <button
                          type="button"
                          onClick={() => onUseInventoryItem(item, settings.sandboxMode ? '' : settings.keys[activeGm.id], settings.sandboxMode)}
                          disabled={isLoading || enemyAttacksQueue.length > 0}
                          className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-900 text-3xs font-extrabold uppercase transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Use
                        </button>
                      )}
                      {isRations && (character.daysWithoutFood > 0 || (character.stats.fatigue !== undefined && character.stats.fatigue < character.stats.maxFatigue)) && (
                        <button
                          type="button"
                          onClick={onEatRation}
                          disabled={isLoading || enemyAttacksQueue.length > 0}
                          className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900 text-3xs font-extrabold uppercase transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Eat
                        </button>
                      )}
                      {(() => {
                        const slot = getItemSlot(item);
                        if (!slot) return null;
                        const isEquipped = Object.values(character.equipment || {}).includes(item);
                        return (
                          <button
                            type="button"
                            onClick={() => onToggleEquip(item)}
                            className={`px-1.5 py-0.5 rounded text-3xs font-extrabold uppercase transition-all cursor-pointer border ${
                              isEquipped
                                ? 'bg-slate-900 text-amber-500 border-amber-500/35 hover:bg-slate-850'
                                : 'bg-amber-950 text-amber-400 border-amber-500/15 hover:bg-amber-900/40'
                            }`}
                          >
                            {isEquipped ? 'Unequip' : 'Equip'}
                          </button>
                        );
                      })()}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Collapsible Accordions for New Fields */}
          <div className="space-y-4">
            
            {/* Quest Log & Intel Accordion */}
            {activeAdventure && (
              <div className="rounded border border-amber-500/35 bg-slate-950/60 overflow-hidden shadow-sm shadow-amber-500/5">
                <button
                  type="button"
                  onClick={() => setIsQuestLogOpen(!isQuestLogOpen)}
                  className="w-full px-4 py-2.5 bg-amber-950/20 hover:bg-amber-950/30 text-left flex justify-between items-center text-2xs uppercase tracking-widest text-amber-400 font-bold transition-all border-b border-amber-500/10"
                >
                  <span className="flex items-center gap-1.5 font-serif">
                    📜 Quest Log & Intel
                  </span>
                  <span>{isQuestLogOpen ? '▼' : '▶'}</span>
                </button>
                {isQuestLogOpen && (
                  <div className="p-3 space-y-4 bg-slate-950/40 text-2xs leading-normal">
                    
                    {/* Objectives */}
                    <div className="space-y-1.5">
                      <h5 className="text-3xs uppercase tracking-wider text-amber-500/80 font-bold font-serif">Objectives</h5>
                      <ul className="space-y-1 text-slate-355 font-medium">
                        {activeAdventure.objectives.map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500/70 mt-0.5">✦</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* NPCs */}
                    {activeAdventure.npcs && activeAdventure.npcs.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-slate-900">
                        <h5 className="text-3xs uppercase tracking-wider text-amber-500/80 font-bold font-serif">Key NPCs</h5>
                        <div className="space-y-2">
                          {activeAdventure.npcs.map((npc, idx) => (
                            <div key={idx} className="bg-slate-900/40 p-1.5 rounded border border-slate-900/60">
                              <div className="flex justify-between items-center font-bold text-slate-200">
                                <span>{npc.name}</span>
                                <span className="text-4xs text-amber-555/85 uppercase font-semibold tracking-wider">{npc.role}</span>
                              </div>
                              <p className="text-3xs text-slate-400 mt-0.5 font-normal leading-relaxed">{npc.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Settings / Locations */}
                    {activeAdventure.settings && activeAdventure.settings.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-slate-900">
                        <h5 className="text-3xs uppercase tracking-wider text-amber-500/80 font-bold font-serif">Locations</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {activeAdventure.settings.map((loc, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-350 text-3xs font-semibold"
                            >
                              📍 {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Quests */}
                    {character.active_quests && character.active_quests.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-slate-900">
                        <h5 className="text-3xs uppercase tracking-wider text-amber-500/80 font-bold font-serif">Active Quests</h5>
                        <ul className="space-y-1 text-slate-355 font-medium">
                          {character.active_quests.map((quest, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-500/70 mt-0.5">⚔️</span>
                              <span>{quest}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Completed Quests */}
                    {character.completed_quests && character.completed_quests.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-slate-900">
                        <h5 className="text-3xs uppercase tracking-wider text-emerald-500/80 font-bold font-serif">Completed Quests</h5>
                        <ul className="space-y-1 text-slate-450 font-medium">
                          {character.completed_quests.map((quest, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 line-through">
                              <span className="text-emerald-500/70 mt-0.5">✓</span>
                              <span>{quest}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* Wealth & Currency Collapsible Accordion */}
            <div className="rounded border border-slate-800 bg-slate-950/45 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="w-full px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-left flex justify-between items-center text-2xs uppercase tracking-widest text-slate-350 font-bold transition-all"
              >
                <span>Wealth & Currency</span>
                <span>{isCurrencyOpen ? '▼' : '▶'}</span>
              </button>
              {isCurrencyOpen && (
                <div className="p-3 bg-slate-950/60 border-t border-slate-900 space-y-2 text-2xs font-semibold">
                  <div className="bg-slate-950/50 p-1.5 rounded border border-slate-900 space-y-1">
                    <span className="text-slate-400 block text-3xs uppercase tracking-wider mb-1">Purse & Wealth</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-1 rounded bg-slate-900 border border-slate-850">
                        <div className="text-[10px] text-amber-500 font-bold">{character.currency?.gp ?? character.currency?.gold ?? 0}</div>
                        <div className="text-[9px] text-slate-500">GP</div>
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-850">
                        <div className="text-[10px] text-slate-300 font-bold">{character.currency?.sp ?? 0}</div>
                        <div className="text-[9px] text-slate-500">SP</div>
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-850">
                        <div className="text-[10px] text-amber-700 font-bold">{character.currency?.cp ?? 0}</div>
                        <div className="text-[9px] text-slate-500">CP</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-400">Fate Coins</span>
                    <strong className="text-indigo-400">{character.currency?.fateCoins ?? 0}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded border border-slate-900">
                    <span className="text-slate-400">Morality Vector</span>
                    <strong className={character.morality > 0 ? "text-emerald-450" : character.morality < 0 ? "text-rose-455" : "text-slate-450"}>
                      {character.morality ?? 0} ({character.morality > 50 ? "Heroic" : character.morality > 10 ? "Idealist" : character.morality < -50 ? "Villainous" : character.morality < -10 ? "Pragmatist" : "Neutral"})
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Storage Vault Collapsible Accordion */}
            <div className="rounded border border-slate-800 bg-slate-950/45 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsStorageOpen(!isStorageOpen)}
                className="w-full px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-left flex justify-between items-center text-2xs uppercase tracking-widest text-slate-355 font-bold transition-all"
              >
                <span>Storage Vault</span>
                <span>{isStorageOpen ? '▼' : '▶'}</span>
              </button>
              {isStorageOpen && (
                <div className="p-3 bg-slate-950/60 border-t border-slate-900">
                  <ul className="space-y-1 text-2xs text-slate-350 font-medium">
                    {(character.storage || []).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 capitalize">
                        <span className="w-1 h-1 rounded-full bg-amber-500/65" />
                        {item}
                      </li>
                    ))}
                    {(character.storage || []).length === 0 && (
                      <li className="text-3xs text-slate-550 italic">Vault is empty.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Strongholds Collapsible Accordion */}
            <div className="rounded border border-slate-800 bg-slate-950/45 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsStrongholdsOpen(!isStrongholdsOpen)}
                className="w-full px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-left flex justify-between items-center text-2xs uppercase tracking-widest text-slate-350 font-bold transition-all"
              >
                <span>Strongholds</span>
                <span>{isStrongholdsOpen ? '▼' : '▶'}</span>
              </button>
              {isStrongholdsOpen && (
                <div className="p-3 bg-slate-950/60 border-t border-slate-900">
                  <ul className="space-y-1 text-2xs text-slate-350 font-medium">
                    {(character.strongholds || []).map((base, idx) => (
                      <li key={idx} className="flex items-center gap-2 capitalize">
                        <span className="w-1.5 h-1.5 border border-amber-500/40 rounded-sm" />
                        {base}
                      </li>
                    ))}
                    {(character.strongholds || []).length === 0 && (
                      <li className="text-3xs text-slate-550 italic">No strongholds.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Relationships Collapsible Accordion */}
            <div className="rounded border border-slate-800 bg-slate-950/45 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsRelationshipsOpen(!isRelationshipsOpen)}
                className="w-full px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-left flex justify-between items-center text-2xs uppercase tracking-widest text-slate-350 font-bold transition-all"
              >
                <span>Relationships</span>
                <span>{isRelationshipsOpen ? '▼' : '▶'}</span>
              </button>
              {isRelationshipsOpen && (
                <div className="p-3 bg-slate-950/60 border-t border-slate-900 space-y-1.5 text-2xs font-semibold">
                  {Object.keys(character.relationships || {}).map((npc) => (
                    <div key={npc} className="flex justify-between items-center border-b border-slate-900 pb-1">
                      <span className="text-slate-355">{npc}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-450 text-3xs font-extrabold uppercase">
                        {character.relationships[npc]}
                      </span>
                    </div>
                  ))}
                  {Object.keys(character.relationships || {}).length === 0 && (
                    <p className="text-3xs text-slate-550 italic">No notable relationships.</p>
                  )}
                </div>
              )}
            </div>

            {/* Narrative Scars Collapsible Accordion */}
            <div className="rounded border border-slate-800 bg-slate-950/45 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsScarsOpen(!isScarsOpen)}
                className="w-full px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-left flex justify-between items-center text-2xs uppercase tracking-widest text-slate-355 font-bold transition-all"
              >
                <span>Narrative Scars</span>
                <span>{isScarsOpen ? '▼' : '▶'}</span>
              </button>
              {isScarsOpen && (
                <div className="p-3 bg-slate-950/60 border-t border-slate-900">
                  <ul className="space-y-1.5 text-3xs text-rose-350 leading-relaxed font-semibold">
                    {(character.scars?.notes || []).map((scar, idx) => (
                      <li key={idx} className="border-b border-slate-900/50 pb-1 font-medium">
                        ⚠️ {scar}
                      </li>
                    ))}
                    {(character.scars?.notes || []).length === 0 && (
                      <li className="text-slate-550 italic">No scars. You are pristine.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-4 flex flex-col gap-2">
          <button
            onClick={handleExitAdventure}
            className="w-full py-1.5 px-3 rounded text-3xs uppercase tracking-wider font-bold border border-emerald-900/30 text-emerald-500 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-700 hover:text-emerald-450 cursor-pointer text-center transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/5"
          >
            Save & Exit to Main Menu
          </button>
          <button
            onClick={handleQuitAdventure}
            className="w-full py-1.5 px-3 rounded text-3xs uppercase tracking-wider font-bold border border-amber-900/30 text-amber-500 bg-amber-950/10 hover:bg-amber-950/30 hover:border-amber-700 hover:text-amber-450 cursor-pointer text-center"
          >
            Forfeit Adventure (Lose Gold & Random Item)
          </button>
          <button
            onClick={onResetGame}
            className="w-full py-1.5 px-3 rounded text-3xs uppercase tracking-wider font-bold border border-rose-900/30 text-rose-500 bg-rose-950/10 hover:bg-rose-950/30 hover:border-rose-700 hover:text-rose-450 cursor-pointer text-center"
          >
            End Saga (Delete Character)
          </button>
        </div>
      </div>

      {isStatsOpen && (
        <div
          onClick={() => setIsStatsOpen(false)}
          className={`absolute inset-0 z-20 bg-black/60 ${isDesktopLayout ? 'hidden' : ''}`}
        />
      )}

      {/* ----------------- CENTER PANEL (Narration & Checks Interface) ----------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 px-4 py-3 bg-slate-900/10 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className={`p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer mr-1 ${isDesktopLayout ? 'hidden' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="font-bold text-sm text-amber-400 tracking-wider flex items-center gap-2">
              <span>{character.setting.toUpperCase()} CHRONICLES</span>
              {settings.sandboxMode && (
                <span
                  onClick={onOpenSettings}
                  className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/35 text-amber-400 text-5xs font-bold uppercase tracking-wider animate-pulse cursor-pointer hover:bg-amber-500/20"
                  title="Running keyless mock mode. Click to configure API keys."
                >
                  ⚠️ Sandbox Mode
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-450 text-5xs font-extrabold uppercase tracking-wider flex items-center gap-1 select-none font-sans">
                💎 {gems} Gems
              </span>
            </h2>
          </div>
          
          {/* Audio Controls Widget */}
          {audio && (
            <div className="flex items-center gap-2 md:gap-3 bg-slate-950/80 border border-slate-850 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-3xs font-medium text-slate-300 max-w-[150px] md:max-w-xs xl:max-w-md overflow-hidden transition-all duration-300 select-none shadow-inner shadow-black/40">
              {/* Skip Back */}
              <button 
                onClick={audio.skipBackward}
                className="hidden sm:inline-block hover:text-amber-400 transition-colors cursor-pointer"
                title="Previous Track"
              >
                ⏮️
              </button>
              
              {/* Play / Pause */}
              <button 
                onClick={audio.togglePlay}
                className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center bg-slate-900 rounded-full hover:bg-slate-850 text-3xs md:text-2xs hover:text-amber-400 transition-all cursor-pointer border border-slate-800"
                title={audio.isPlaying ? "Pause Music" : "Play Music"}
              >
                {audio.isPlaying ? "⏸️" : "▶️"}
              </button>

              {/* Skip Forward */}
              <button 
                onClick={audio.skipForward}
                className="hidden sm:inline-block hover:text-amber-400 transition-colors cursor-pointer"
                title="Next Track"
              >
                ⏭️
              </button>

              {/* Now Playing text */}
              <div className="hidden xs:block w-16 sm:w-28 lg:w-40 overflow-hidden relative whitespace-nowrap text-slate-400 border-l border-slate-850 pl-2 text-[9px] md:text-3xs">
                <div className="inline-block animate-marquee select-none">
                  {audio.currentTrack ? audio.currentTrack.name : 'Silence'}
                </div>
              </div>

              {/* Volume Slider & Mute Button */}
              <div className="flex items-center gap-1 border-l border-slate-850 pl-1 md:pl-2">
                <button 
                  onClick={audio.toggleMute}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-4xs md:text-3xs"
                  title={audio.isMuted ? "Unmute" : "Mute"}
                >
                  {audio.isMuted ? "🔇" : "🔊"}
                </button>
                {!audio.isMuted && (
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={audio.volume} 
                    onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                    className="hidden lg:inline-block w-10 lg:w-14 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-450 transition-all"
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="View Game Rules & Tutorial"
            >
              <span>❔</span>
              <span>Rules</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <span>Keys</span>
            </button>
            
            <button
              onClick={() => setIsJournalOpen(!isJournalOpen)}
              className={`p-1.5 rounded border transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                isJournalOpen
                  ? 'bg-amber-500/10 border-amber-500/55 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Journal</span>
            </button>

            <button
              onClick={() => setIsEquipmentOpen(!isEquipmentOpen)}
              className={`p-1.5 rounded border transition-all text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                isEquipmentOpen
                  ? 'bg-amber-500/10 border-amber-500/55 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Gear & Pack</span>
            </button>
          </div>
        </div>

        {/* Narrative Output area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-slate-950/60">
          
          {history.length === 0 && (
            <div className="rounded border border-amber-500/10 bg-slate-900/30 p-5 text-center">
              <h3 className="text-lg font-bold text-amber-400 mb-2 font-serif">Welcome to your Saga</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto mb-4 leading-relaxed">
                State your character's action below. If you are doing something challenging, select a **Skill Focus** and **Difficulty** to throw the opposed dice!
              </p>
              <div className="flex flex-col gap-2 max-w-sm mx-auto">
                <button
                  onClick={() => setInputText("Wake up in a mossy stone ruin as a magical storm gathers overhead")}
                  className="py-1.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-2xs text-left rounded cursor-pointer font-medium hover:border-amber-500/30 text-amber-400"
                >
                  🔮 "Wake up in a mossy stone ruin as a magical storm gathers."
                </button>
              </div>
            </div>
          )}

          {history.map((turn, idx) => {
            const isUser = turn.role === 'user';
            
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div className={`
                  max-w-xl md:max-w-2xl px-4 py-3 rounded-lg text-sm leading-relaxed
                  ${isUser 
                    ? 'bg-amber-950/40 border border-amber-500/25 text-amber-200 font-medium rounded-br-none' 
                    : 'bg-slate-900/50 border border-slate-800 text-slate-200 rounded-bl-none'
                  }
                `}>
                  {isUser ? (
                    <div className="flex flex-col">
                      <span className="text-4xs uppercase tracking-widest text-amber-450 font-bold mb-1 select-none">
                        Action
                      </span>
                      <span>{turn.content}</span>
                    </div>
                  ) : (
                    <div className="narration-content">
                      <div className="text-4xs uppercase tracking-widest text-slate-500 font-bold mb-1 select-none flex justify-between">
                        <span>{activeGm.name}</span>
                        {turn.isManualImage && <span className="text-amber-550 lowercase italic">Materialization complete (-{activeGm.id === 'titan' ? '2K' : '10K'} power)</span>}
                      </div>
                      
                      <p className="whitespace-pre-wrap">{turn.content}</p>

                      {turn.imageUrl && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                          <img
                            src={turn.imageUrl}
                            alt={turn.imagePrompt}
                            className="w-full h-auto max-h-80 object-cover object-center"
                            loading="lazy"
                          />
                          <div className="bg-slate-900/60 p-2 text-4xs italic text-slate-400 text-center border-t border-slate-900">
                            "Visualized: {turn.imagePrompt}"
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (!history.length || history[history.length - 1].role !== 'model' || !history[history.length - 1].content) && (
            <div className="flex flex-col items-start animate-pulse">
              <div className="max-w-xl bg-slate-900/40 border border-slate-800 px-4 py-3 rounded-lg rounded-bl-none text-sm space-y-2">
                <span className="text-4xs uppercase tracking-widest text-slate-500 font-bold block">
                  {activeGm.name} is weaving the saga...
                </span>
                <div className="h-4 bg-slate-850 rounded w-64" />
                <div className="h-4 bg-slate-850 rounded w-80" />
              </div>
            </div>
          )}

          {apiError && (
            <div className="p-4 rounded border border-rose-500/30 bg-rose-950/20 text-rose-455 text-xs font-semibold leading-relaxed">
              <h4 className="font-bold mb-1 text-rose-400">An Error Obstructed the Saga:</h4>
              <p>{apiError}</p>
              <div className="flex flex-wrap gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={onRetryLastAction}
                  className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-3xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Retry Last Action
                </button>
                {!settings.sandboxMode && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 text-3xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Configure API keys ↗
                  </button>
                )}
              </div>
            </div>
          )}

          {warningMessage && (
            <div className="p-3 rounded border border-amber-500/20 bg-amber-950/15 text-amber-400 text-xs font-medium text-center animate-pulse">
              ⚠️ {warningMessage}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Narrative inputs or Defense Queue Panel */}
        {character.stats.hp <= -5 ? (
          <div className="border-t border-rose-950 p-6 bg-rose-950/10 flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-3xl">💀</span>
            <h3 className="text-sm font-extrabold uppercase font-serif text-red-500 tracking-wider">You Have Died</h3>
            <p className="text-2xs text-slate-400 max-w-xs leading-relaxed">
              Your Saga has ended. Your hit points fell to -5 or lower. You can no longer take actions.
            </p>
            <button
              type="button"
              onClick={onResetGame}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-950 border border-red-900/30 text-red-400 text-3xs font-extrabold uppercase tracking-wider rounded transition-all cursor-pointer shadow-md"
            >
              Reset Saga
            </button>
          </div>
        ) : enemyAttacksQueue && enemyAttacksQueue.length > 0 ? (
          <div className="border-t border-slate-900 p-4 bg-slate-950 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <h3 className="text-xs font-bold font-serif text-rose-455 uppercase tracking-widest flex items-center gap-1.5">
                <span>⚔️ Incoming Enemy Attacks ({enemyAttacksQueue.length})</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/30 text-rose-400 text-5xs font-extrabold uppercase tracking-wider animate-pulse">
                Defense Required
              </span>
            </div>

            {(() => {
              const attack = enemyAttacksQueue[0];
              const defenseCount = character.stats.defenseCount || 0;
              const activePenalty = defenseCount * -2;
              const shieldName = character.equipment?.shield;
              const weaponName = character.equipment?.weapon;
              
              return (
                <div className="space-y-3">
                  <p className="text-xs text-slate-350 leading-relaxed">
                    The <strong className="text-amber-400 font-serif">{attack.name}</strong> attacks you!
                    <span className="text-slate-450 text-2xs block mt-1 leading-normal font-semibold">
                      Attack check: {attack.diceExpr} | Damage: {attack.damageExpr} ({attack.damageType}) | Primary resistance: {attack.vsSkill || 'acrobatics/blocking'}
                    </span>
                  </p>
                  
                  {activePenalty !== 0 && (
                    <div className="text-[10px] text-amber-500 font-extrabold uppercase animate-pulse">
                      ⚠️ Cumulative Defense Penalty: {activePenalty} to your roll (defenses resolved this turn: {defenseCount})
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => onResolveEnemyAttack('acrobatics', 0)}
                      disabled={isLoading}
                      className="flex-1 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/35 text-slate-200 hover:text-amber-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Dodge (Acrobatics)</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => onResolveEnemyAttack('blocking', 0)}
                      disabled={isLoading || (!shieldName && !weaponName)}
                      className={`flex-1 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        (shieldName || weaponName)
                          ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/35 text-slate-200 hover:text-amber-400 cursor-pointer'
                          : 'bg-slate-950 text-slate-650 border border-slate-900 cursor-not-allowed'
                      }`}
                      title={(!shieldName && !weaponName) ? "Requires a weapon or shield equipped" : ""}
                    >
                      <span>Block (Blocking)</span>
                      {!shieldName && !weaponName && <span className="text-5xs font-sans italic text-slate-600">(No Weapon/Shield)</span>}
                      {!shieldName && weaponName && <span className="text-5xs font-sans italic text-amber-500/70">(Parry)</span>}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="border-t border-slate-900 p-4 bg-slate-950 flex flex-col gap-2">
            
            {/* Ground Items and Current Location Status Header */}
            {(() => {
              const displayRoom = activeRoom || 'Unknown Room';
              const groundItems = droppedItems[activeAdventureId]?.[displayRoom] || [];

              return (
                <div className="flex flex-wrap justify-between items-center bg-slate-900/60 border border-slate-850 px-3 py-1.5 rounded-lg text-2xs mb-1">
                  <div className="flex items-center gap-1.5 text-slate-350 font-bold">
                    <span className="text-amber-500 font-serif">📍 Location:</span>
                    <span className="text-slate-200 capitalize font-medium">{displayRoom}</span>
                  </div>
                  
                  {groundItems.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-400 mt-1 sm:mt-0 font-medium">
                      <span className="text-amber-500 font-serif">📦 Ground:</span>
                      {groundItems.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onPickUpItem(item)}
                          title="Click to pick up item"
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-600/25 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 font-bold text-3xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{item}</span>
                          <span className="text-4xs text-amber-500/70">➕</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {(activeRoomImage || activeRoomChoices.length > 0) && (
              <div className="rounded border border-slate-850 bg-slate-900/35 overflow-hidden mb-1">
                {activeRoomImage && (
                  <img
                    src={activeRoomImage}
                    alt={activeRoom || 'Current adventure location'}
                    className="w-full max-h-40 object-cover border-b border-slate-850"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                )}

                {activeRoomChoices.length > 0 && (
                  <div className="p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-3xs uppercase tracking-widest text-slate-500 font-bold">Suggested Actions</span>
                      <button
                        type="button"
                        onClick={() => {
                          setInputText('');
                          setSkillFocus('');
                          inputRef.current?.focus();
                        }}
                        disabled={isLoading}
                        className="text-[10px] text-slate-500 hover:text-amber-400 disabled:opacity-40 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                      >
                        Do something else...
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {activeRoomChoices.map((choice, idx) => {
                        const rank = character.skills?.[choice.skill] || 0;
                        const skillName = getSkillLabel(choice.skill);
                        const difficultyLabel = DIFFICULTY_LABELS[choice.difficulty] || choice.difficulty;

                        return (
                          <button
                            key={`${choice.text}-${idx}`}
                            type="button"
                            onClick={() => handleSuggestedChoice(choice)}
                            disabled={isLoading}
                            className="min-h-20 rounded border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-amber-500/35 disabled:opacity-45 disabled:hover:border-slate-800 disabled:hover:bg-slate-950/60 text-left p-3 transition-all cursor-pointer"
                          >
                            <span className="block text-xs font-bold text-slate-200 leading-snug">{choice.text}</span>
                            <span className="block mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              {skillName} | {difficultyLabel} | Rank {rank}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Check Configurations Bar */}
            <div className="flex gap-2 mb-1 text-2xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Skill Focus:</span>
              <select
                value={skillFocus}
                onChange={(e) => setSkillFocus(e.target.value)}
                disabled={isLoading}
                className="bg-slate-900 border border-slate-850 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-500 capitalize"
              >
                <option value="" className="bg-slate-900 text-slate-200">None (Generic Narrative)</option>
                {SKILLS_LIST.map((sk) => (
                  <option key={sk.id} value={sk.id} className="bg-slate-900 text-slate-200">{sk.name}</option>
                ))}
              </select>
            </div>

            {skillFocus && (
              <div className="flex gap-2 items-center animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <span>Vs. Difficulty:</span>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-900 border border-slate-850 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                  >
                    <option value="novice" className="bg-slate-900 text-slate-200">Novice (Easy)</option>
                    <option value="professional" className="bg-slate-900 text-slate-200">Professional (Moderate)</option>
                    <option value="veteran" className="bg-slate-900 text-slate-200">Veteran (Hard)</option>
                    <option value="legendary" className="bg-slate-900 text-slate-200">Legendary (Extreme)</option>
                  </select>
                </div>
                {['arcane_shaping', 'divine_manifestation'].includes(skillFocus) && (
                  <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
                    <span>Channel SP:</span>
                    <select
                      value={spSpend}
                      onChange={(e) => setSpSpend(parseInt(e.target.value, 10))}
                      disabled={isLoading}
                      className="bg-slate-900 border border-slate-850 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                    >
                      {Array.from({ length: (character.skills[skillFocus] || 0) + 1 }, (_, i) => (
                        <option key={i} value={i} className="bg-slate-900 text-slate-200">{i} SP</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={
                skillFocus
                  ? `State how you attempt your ${SKILLS_LIST.find(s=>s.id===skillFocus)?.name}...`
                  : `State your character's action, ${character.name}...`
              }
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800/80 rounded focus:outline-none focus:border-amber-500 text-sm font-medium text-slate-200 placeholder-slate-500 disabled:opacity-40 transition-opacity"
            />
            
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md shadow-amber-500/5 flex items-center gap-1.5"
            >
              <span>Commit</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <div className="flex justify-between items-center text-3xs text-slate-550 px-1 mt-1 font-medium">
            <button
              type="button"
              onClick={handleVisualizeClick}
              disabled={isLoading || history.length === 0}
              className="text-slate-450 hover:text-amber-400 hover:underline cursor-pointer disabled:opacity-40 disabled:hover:text-slate-450 disabled:no-underline flex items-center gap-1"
            >
              ✨ <span>Visualize Current Scene {settings.engineTier === 'premium' ? `(-${activeGm.id === 'titan' ? '2K' : '10K'} Power)` : ''}</span>
            </button>
            <span>*Opposed rolls are rolled client-side instantly and appended to inputs.</span>
          </div>

        </form>
        )}

        {/* Mock Fantasy Ad Banner */}
        {settings.engineTier === 'free' && (
          <div className="w-full bg-slate-950 border-t border-slate-900 px-4 py-2 flex items-center justify-center gap-3 animate-fadeIn select-none h-10 shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-slate-505 font-bold">Sponsored:</span>
            <div className="text-xs text-amber-400 font-medium transition-all duration-500 truncate max-w-full">
              📢 {MOCK_ADS[adIndex]}
            </div>
          </div>
        )}

      </div>

      {/* ----------------- RIGHT PANEL (Adventure Journal) ----------------- */}
      {isJournalOpen && (
        <div className={`border-slate-900 bg-slate-900/25 p-4 flex flex-col overflow-hidden ${isDesktopLayout ? 'w-64 lg:w-72 border-l h-full' : 'w-full border-t h-72'}`}>
          <h3 className="text-2xs uppercase tracking-widest text-slate-500 font-bold border-b border-slate-900 pb-2 mb-3 flex items-center justify-between">
            <span>Adventure Journal</span>
            <button
              type="button"
              onClick={() => printAdventureLog(character, history)}
              disabled={history.length === 0}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 hover:border-amber-500/40 text-amber-450 hover:text-amber-400 text-5xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
              title="Print full adventure story log to PDF"
            >
              <span>Print Log</span>
              <span>📄</span>
            </button>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-1 pb-4">
            
            <div className="space-y-1">
              <h4 className="text-3xs uppercase font-bold text-amber-505">The Story So Far</h4>
              {journal.storySoFar ? (
                <p className="text-xs text-slate-350 leading-relaxed italic">
                  "{journal.storySoFar}"
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  A new legend is waiting to be written. The chronicle is blank.
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-900/60">
              <h4 className="text-3xs uppercase font-bold text-amber-505">Recent Chronicles</h4>
              {journal.recentTurns.length === 0 ? (
                <p className="text-xs text-slate-550 italic">No turns completed yet.</p>
              ) : (
                <ul className="space-y-2">
                  {journal.recentTurns.map((turn, idx) => (
                    <li key={idx} className="text-xs p-2 rounded bg-slate-950/40 border border-slate-900/50 text-slate-400 font-medium">
                      ⚔️ "{turn}"
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          <div className="border-t border-slate-900 pt-3 text-3xs text-slate-550 text-center">
            Journal auto-summarises every 5 user actions.
          </div>
        </div>
      )}


      {/* ----------------- MILESTONE LEVEL UP SCREEN OVERLAY ----------------- */}
      {isUpgradeScreenVisible && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-lg border-2 border-emerald-500 bg-slate-900 p-6 shadow-2xl shadow-emerald-500/20 text-left relative animate-scaleUp">
            
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            <h2 className="text-2xl font-extrabold text-emerald-400 mb-1 font-serif tracking-wide text-center uppercase">
              Chronicle Milestone Achieved!
            </h2>
            <p className="text-slate-350 text-xs font-semibold text-center mb-6">
              You have completed a significant step in the adventure. Your skills strengthen.
            </p>

            <div className="space-y-4">
              {/* Most Used Skill (Auto-Upgraded) */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="text-3xs uppercase font-bold text-slate-500">Automatic Rank Up (Most Used)</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-bold text-emerald-400 capitalize">{mostUsedSkillName}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-3xs font-extrabold uppercase">
                    +1 Rank
                  </span>
                </div>
                <p className="text-3xs text-slate-500 mt-1">
                  This skill was tested the most during this adventure block.
                </p>
              </div>

              {/* Player choice of other used skills */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-3xs uppercase font-bold text-slate-500">Choice Rank Up (Hobby/Secondary)</h4>
                
                {otherUsedSkills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No other skills were used. You may select any other skill to upgrade.
                  </p>
                ) : (
                  <p className="text-3xs text-slate-450 leading-relaxed">
                    Select one other skill checked during this adventure step to receive `+1 Rank`.
                  </p>
                )}

                <select
                  value={selectedUpgradeSkill}
                  onChange={(e) => setSelectedUpgradeSkill(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded text-slate-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-slate-200">-- Choose Skill to Upgrade --</option>
                  {(otherUsedSkills.length === 0 ? SKILLS_LIST : otherUsedSkills).map((sk) => {
                    const currentRank = character.skills[sk.id] || 0;
                    return (
                      <option key={sk.id} value={sk.id} disabled={currentRank >= 5} className="bg-slate-900 text-slate-200">
                        {sk.name} (Current Ranks: {currentRank})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Optional Portrait Refinement */}
              <div className="p-4 rounded bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-3xs uppercase font-bold text-slate-505 font-serif tracking-wider">Update Portrait</h4>
                <div className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded border border-slate-800 bg-slate-900 overflow-hidden flex-shrink-0">
                    {character.portraitUrl ? (
                      <img
                        src={character.portraitUrl}
                        alt="Portrait Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-serif text-xs">?</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="file"
                      ref={levelUpFileRef}
                      onChange={handleUploadLevelUpPortrait}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => levelUpFileRef.current?.click()}
                      className="w-full py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-450 hover:text-amber-400 text-4xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                    >
                      Upload Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      className="w-full py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-450 hover:text-amber-400 text-4xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                    >
                      Preset Gallery
                    </button>
                  </div>
                </div>
                <p className="text-4xs text-slate-550 leading-normal">
                  You can upload a custom image or select a new pre-generated character portrait from our library.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center border-t border-slate-850 pt-4">
              <button
                type="button"
                onClick={() => {
                  executeMilestoneUpgrades(selectedUpgradeSkill || null);
                  setSelectedUpgradeSkill('');
                }}
                className="px-6 py-3 rounded text-xs font-bold bg-emerald-500 text-slate-950 uppercase tracking-widest hover:brightness-110 active:scale-95 cursor-pointer shadow-lg hover:shadow-emerald-500/10 transition-all"
              >
                Conclude Milestone
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Preset Portrait Gallery Modal */}
      {isGalleryOpen && (() => {
        const filteredPresets = PRESET_METADATA.filter(p => {
          const matchGender = galleryGenderFilter === 'All' || p.gender.toLowerCase() === galleryGenderFilter.toLowerCase();
          const matchAge = galleryAgeFilter === 'All' || p.age.toLowerCase() === galleryAgeFilter.toLowerCase();
          return matchGender && matchAge;
        });

        return (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="w-full max-w-4xl rounded-lg border-2 border-amber-500 bg-slate-900 p-6 shadow-2xl shadow-amber-500/20 text-left relative flex flex-col h-[85vh] max-h-[750px] animate-scaleUp">
              
              {/* Header border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-2">
                <h2 className="text-xl font-bold text-amber-400 font-serif tracking-wide">
                  PRESET PORTRAIT LIBRARY
                </h2>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="text-slate-450 hover:text-rose-450 text-sm font-bold uppercase cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-800/60 pb-3 mb-4 bg-slate-950/40 p-2.5 rounded">
                <div className="flex items-center gap-4">
                  {/* Gender Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Gender:</span>
                    <select
                      value={galleryGenderFilter}
                      onChange={(e) => {
                        setGalleryGenderFilter(e.target.value);
                      }}
                      className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="All" className="bg-slate-900 text-slate-200">All Genders</option>
                      <option value="Male" className="bg-slate-900 text-slate-200">Male</option>
                      <option value="Female" className="bg-slate-900 text-slate-200">Female</option>
                      <option value="Other" className="bg-slate-900 text-slate-200">Other / Non-binary</option>
                    </select>
                  </div>
                  {/* Age Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Age:</span>
                    <select
                      value={galleryAgeFilter}
                      onChange={(e) => {
                        setGalleryAgeFilter(e.target.value);
                      }}
                      className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="All" className="bg-slate-900 text-slate-200">All Ages</option>
                      <option value="youth" className="bg-slate-900 text-slate-200">Youthful</option>
                      <option value="middle" className="bg-slate-900 text-slate-200">Middle Age</option>
                      <option value="elder" className="bg-slate-900 text-slate-200">Elder</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {filteredPresets.length} Portraits Found
                </div>
              </div>

              {/* Grid display of portraits */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-3 pb-4">
                {filteredPresets.map((preset) => {
                  return (
                    <button
                      key={preset.index}
                      type="button"
                      onClick={() => handleSelectPreset(preset.index)}
                      className={`aspect-square relative rounded border border-slate-800 bg-slate-950 overflow-hidden hover:border-amber-500 group transition-all cursor-pointer block ${isDesktopLayout ? 'w-[calc((100%-8*12px)/9)]' : 'w-[calc((100%-3*12px)/4)]'}`}
                    >
                      <img
                        src={preset.path}
                        alt={`Preset ${preset.index}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-0.5 text-center text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Preset {preset.index}
                      </div>
                    </button>
                  );
                })}
                {filteredPresets.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-550 font-serif text-sm">
                    No presets match the selected filters.
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* ----------------- SLIDE-OUT EQUIPMENT DRAWER ----------------- */}
      {isEquipmentOpen && (
        <div
          onClick={() => setIsEquipmentOpen(false)}
          className="absolute inset-0 z-38 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      <div className={`absolute top-0 right-0 z-40 h-full w-80 sm:w-96 border-l border-slate-900 bg-slate-950/95 backdrop-blur-md shadow-2xl transition-transform duration-300 flex flex-col p-4 ${isEquipmentOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
          <h3 className="text-xs uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1.5 font-serif">
            <span>🎒 Character Gear & Pack</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsEquipmentOpen(false)}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section 1: Carrying Capacity Gauges */}
        {(() => {
          const enc = calculateWeightAndVolume(character);
          return (
            <div className="space-y-3 bg-slate-900/40 p-3 rounded border border-slate-900/80 mb-4 flex-shrink-0">
              {/* Weight Bar */}
              <div>
                <div className="flex justify-between items-center text-3xs font-bold uppercase text-slate-400 mb-1">
                  <span>Carried Weight</span>
                  <span className={enc.isOverloaded ? "text-rose-400 font-extrabold animate-pulse" : (enc.isSlowed ? "text-amber-500 font-bold" : "text-amber-400")}>
                    {enc.totalWeight} / {enc.maxWeight} lbs ({enc.weightRatio}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-slate-950 border border-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      enc.isOverloaded ? 'bg-rose-600' : (enc.isSlowed ? 'bg-amber-600' : 'bg-emerald-600')
                    }`}
                    style={{ width: `${Math.min(100, enc.weightRatio)}%` }}
                  />
                </div>
              </div>

              {/* Volume Bar */}
              <div>
                <div className="flex justify-between items-center text-3xs font-bold uppercase text-slate-400 mb-1">
                  <span>Backpack Volume</span>
                  <span className={enc.volumeRatio > 100 ? "text-rose-400 font-extrabold animate-pulse" : "text-amber-450"}>
                    {enc.totalVolume} / {enc.maxVolume} L ({enc.volumeRatio}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-slate-950 border border-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      enc.volumeRatio > 100 ? 'bg-rose-600' : (enc.volumeRatio > 75 ? 'bg-amber-600' : 'bg-indigo-600')
                    }`}
                    style={{ width: `${Math.min(100, enc.volumeRatio)}%` }}
                  />
                </div>
              </div>

              {/* Status Banner */}
              {enc.isEncumbered && (
                <div className={`p-2 rounded border text-3xs font-semibold ${
                  enc.isOverloaded 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-400' 
                    : (enc.isSlowed ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' : 'bg-yellow-950/15 border-yellow-500/20 text-yellow-450')
                }`}>
                  <div className="font-bold uppercase mb-0.5">
                    ⚠️ {enc.isOverloaded ? 'Overloaded' : (enc.isSlowed ? 'Slowed' : 'Encumbered')} Load
                  </div>
                  <p className="leading-relaxed text-slate-400">
                    {enc.isOverloaded 
                      ? 'Cannot move easily. Risks collapse. Physical actions require Vigor check and consume double fatigue.' 
                      : `Suffer a ${enc.penaltyPercentage}% speed penalty and -${Math.abs(enc.rollModifier)} to physical checks.`}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Section 2: Equipment Paper-Doll Slots */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar space-y-4 pr-1 pb-4">
          <div>
            <h4 className="text-3xs uppercase tracking-widest text-slate-500 font-bold mb-2">Equipped Slots</h4>
            
            <div className="grid grid-cols-2 gap-2 text-2xs">
              {/* Head / Neck */}
              {(() => {
                const renderSlot = (slotId, label, icon) => {
                  const itemName = character.equipment?.[slotId];
                  return (
                    <div 
                      key={slotId}
                      className={`p-2 rounded border bg-slate-950/60 flex flex-col justify-between transition-all group relative cursor-pointer ${
                        itemName 
                          ? 'border-amber-500/30 hover:border-amber-500/50 hover:bg-slate-900/40' 
                          : 'border-slate-900 hover:border-slate-800 hover:bg-slate-900/25'
                      }`}
                      onClick={() => {
                        if (itemName) onUnequipItem(slotId);
                      }}
                      title={itemName ? "Click to unequip" : "No item equipped. To equip, choose an item from Backpack Contents below."}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-bold select-none">
                        <span>{label}</span>
                        <span>{icon}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between min-h-[16px]">
                        <span className={`text-3xs font-bold truncate ${itemName ? 'text-amber-400' : 'text-slate-655 italic'}`}>
                          {itemName || 'Empty'}
                        </span>
                        {itemName && (
                          <span className="text-[9px] text-slate-550 group-hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity font-extrabold uppercase ml-1 flex-shrink-0">
                            ✖
                          </span>
                        )}
                      </div>
                    </div>
                  );
                };

                const leftHipHasSheath = character.equipment?.hip_left === 'Weapon Sheath';
                const rightHipHasSheath = character.equipment?.hip_right === 'Weapon Sheath';

                return (
                  <>
                    {renderSlot('head', 'Head / Helm', '🪖')}
                    {renderSlot('neck', 'Neck / Amulet', '📿')}
                    {renderSlot('body', 'Body / Armor', '🛡️')}
                    {renderSlot('legs', 'Legs / Pants', '👖')}
                    {renderSlot('feet', 'Feet / Boots', '🥾')}
                    {renderSlot('hands', 'Hands / Gloves', '🧤')}
                    {renderSlot('hand_right', 'Right Hand', '⚔️')}
                    {renderSlot('hand_left', 'Left Hand', '🛡️')}
                    {renderSlot('ring_left', 'Left Ring', '💍')}
                    {renderSlot('ring_right', 'Right Ring', '💍')}
                    {renderSlot('backpack', 'Backpack Slot', '🎒')}
                    {renderSlot('hip_left', 'Left Hip Gear', '🎒')}
                    {renderSlot('hip_right', 'Right Hip Gear', '🎒')}
                    
                    {leftHipHasSheath && renderSlot('hip_left_sheathed', 'Left Sheath Weapon', '🗡️')}
                    {rightHipHasSheath && renderSlot('hip_right_sheathed', 'Right Sheath Weapon', '🗡️')}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Section 3: Backpack Inventory */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-3xs uppercase tracking-widest text-slate-500 font-bold">Backpack Contents</h4>
              <span className="text-[10px] text-slate-500 font-bold">
                {character.inventory?.length || 0} Items
              </span>
            </div>

            {(!character.inventory || character.inventory.length === 0) ? (
              <div className="text-3xs text-slate-600 italic py-4 text-center border border-dashed border-slate-900 rounded bg-slate-950/20">
                Your pack is empty.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {character.inventory.map((item, idx) => {
                  const details = getItemDetails(item);
                  const isEquipped = Object.values(character.equipment || {}).includes(item);
                  
                  // Usable checks
                  const nameLower = item.toLowerCase();
                  const isRations = nameLower.includes('rations');
                  const isBandage = nameLower.includes('bandage');
                  const isHealerKit = nameLower.includes("healer's kit") || nameLower.includes("healer's satchel");
                  const isHerb = nameLower.includes('herb') || nameLower.includes('poultice');
                  const isUsable = isBandage || isHealerKit || isHerb;

                  const leftHipHasSheath = character.equipment?.hip_left === 'Weapon Sheath';
                  const rightHipHasSheath = character.equipment?.hip_right === 'Weapon Sheath';

                  return (
                    <li 
                      key={idx} 
                      className={`p-2 rounded border bg-slate-900/30 flex flex-col relative transition-all ${
                        isEquipped ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-2xs font-semibold text-slate-300 truncate" title={item}>
                          {item}
                        </span>
                        <span className="text-[10px] text-slate-555 flex-shrink-0 font-medium">
                          {details.weight} lbs / {details.volume} L
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1.5 border-t border-slate-950 pt-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold select-none">
                          {isEquipped ? 'Equipped' : (details.slot ? `Slot: ${details.slot.toUpperCase()}` : 'Storage')}
                        </span>
                        <div className="flex gap-1.5 items-center">
                          {/* Equip button with sub-dropdown options */}
                          {details.slot && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeItemMenu === idx) {
                                    setActiveItemMenu(null);
                                  } else {
                                    setActiveItemMenu(idx);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 text-3xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-0.5"
                              >
                                <span>Equip</span>
                                <span className="text-[8px]">▼</span>
                              </button>
                              
                              {activeItemMenu === idx && (
                                <div className="absolute right-0 bottom-6 z-50 min-w-[120px] rounded bg-slate-900 border border-slate-800 shadow-2xl p-1 flex flex-col gap-0.5 text-left select-none">
                                  {(() => {
                                    const slots = [];
                                    if (details.slot === 'hand') {
                                      slots.push({ id: 'hand_right', label: 'Right Hand ⚔️' });
                                      slots.push({ id: 'hand_left', label: 'Left Hand 🛡️' });
                                      if (leftHipHasSheath && (details.subslot === 'small' || details.subslot === 'medium')) {
                                        slots.push({ id: 'hip_left_sheathed', label: 'Sheath Left 🗡️' });
                                      }
                                      if (rightHipHasSheath && (details.subslot === 'small' || details.subslot === 'medium')) {
                                        slots.push({ id: 'hip_right_sheathed', label: 'Sheath Right 🗡️' });
                                      }
                                    } else if (details.slot === 'ring') {
                                      slots.push({ id: 'ring_left', label: 'Left Ring 💍' });
                                      slots.push({ id: 'ring_right', label: 'Right Ring 💍' });
                                    } else if (details.slot === 'hip') {
                                      slots.push({ id: 'hip_left', label: 'Left Hip 🎒' });
                                      slots.push({ id: 'hip_right', label: 'Right Hip 🎒' });
                                    } else {
                                      slots.push({ id: details.slot, label: `Equip ${details.slot.toUpperCase()}` });
                                    }

                                    return slots.map(sl => (
                                      <button
                                        key={sl.id}
                                        type="button"
                                        onClick={() => {
                                          onEquipItem(item, sl.id);
                                          setActiveItemMenu(null);
                                        }}
                                        className="px-2 py-1 text-left hover:bg-slate-850 hover:text-amber-400 rounded text-3xs font-semibold cursor-pointer"
                                      >
                                        {sl.label}
                                      </button>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
                          )}

                          {isUsable && (
                            <button
                              type="button"
                              onClick={() => {
                                onUseInventoryItem(item, settings.sandboxMode ? '' : settings.keys[activeGm.id], settings.sandboxMode);
                                setActiveItemMenu(null);
                              }}
                              disabled={isLoading || enemyAttacksQueue.length > 0}
                              className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-900 text-3xs font-extrabold uppercase transition-all cursor-pointer disabled:opacity-40"
                            >
                              Use
                            </button>
                          )}

                          {isRations && (character.daysWithoutFood > 0 || (character.stats.fatigue !== undefined && character.stats.fatigue < character.stats.maxFatigue)) && (
                            <button
                              type="button"
                              onClick={() => {
                                onEatRation();
                                setActiveItemMenu(null);
                              }}
                              disabled={isLoading || enemyAttacksQueue.length > 0}
                              className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900 text-3xs font-extrabold uppercase transition-all cursor-pointer disabled:opacity-40"
                            >
                              Eat
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              onDropItem(item);
                              setActiveItemMenu(null);
                            }}
                            disabled={isLoading}
                            className="px-1.5 py-0.5 rounded bg-rose-955/20 hover:bg-rose-900/30 text-rose-400 border border-rose-500/20 text-3xs font-extrabold uppercase transition-all cursor-pointer disabled:opacity-40"
                          >
                            Drop
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Help & Rules Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-3xl bg-slate-950 border border-amber-900/35 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-serif text-amber-400 tracking-wider flex items-center gap-2">
                  <span>📜 Chronicles of the Shattered Sage: Rulebook</span>
                </h3>
                <p className="text-3xs text-slate-400 uppercase tracking-widest mt-0.5">
                  Understand attributes, skill tests, combat maneuvers, and survival states.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 bg-slate-800 rounded cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-2xs leading-relaxed bg-slate-950/90 custom-scrollbar">
              
              {/* Section 1: The Rolling Mechanic */}
              <section className="space-y-2 border-b border-slate-900 pb-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">1. Opposed Skill & Attribute Checks</h4>
                <p>
                  Every challenge in Shattered Saga is resolved using a **Step-Die Dice Rolling Formula**:
                </p>
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-center font-mono text-3xs text-amber-400 select-all">
                  Check Roll = [Primary Attribute Die] + [Secondary Attribute Die] + [Skill Focus Ranks] + [Modifiers]
                </div>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-400">
                  <li><strong>Attributes</strong> dictate the die size (e.g. Score 1 = d4, Score 2 = d6, Score 3 = d8, Score 4 = d10, Score 5 = d12, Score 6+ = d20).</li>
                  <li><strong>Skill Focus</strong> adds flat bonuses (e.g. +1 for Novice rank, up to +5 for Legendary rank).</li>
                  <li>Your roll is compared directly to the challenge difficulty or opponent roll. A positive margin represents a **Success**, while a negative margin results in a **Failure** or **Complication**.</li>
                </ul>
              </section>

              {/* Section 2: Combat & Armor Soak */}
              <section className="space-y-2 border-b border-slate-900 pb-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">2. Combat Resolution & Defense</h4>
                <p>
                  When enemies attack, they place actions in the **🛡️ Defense Required** queue. You must react before you can perform another narrative turn:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Acrobatics (Dodge)</strong>: Uses Coordination + Vigor. Avoids all damage on success. Heavy armor applies penalties (Medium: -1, Heavy: -2).</li>
                  <li><strong>Blocking (Block)</strong>: Uses Power + Coordination. Requires a weapon or shield to be equipped.</li>
                  <li><strong>Damage Mitigation (Soak)</strong>: If an attack hits, your equipped armor rolls to absorb raw damage:
                    <ul className="list-circle pl-5 mt-1 space-y-0.5 text-slate-450">
                      <li>Light Armor: Soaks 1d3 damage.</li>
                      <li>Medium Armor: Soaks 1d4 damage.</li>
                      <li>Heavy Armor: Soaks 1d6 damage.</li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* Section 3: Fatigue, Food, & Survival */}
              <section className="space-y-2 border-b border-slate-900 pb-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-serif">3. Survival, Fatigue, & Starvation</h4>
                <p>
                  Time flows dynamically. Travel and stressful actions burn calories and drain your stamina:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                  <li><strong>Starvation</strong>: If you go past midnight without eating Rations, your hunger rises. Each starving day applies a cumulative <strong>-1 penalty</strong> to all check rolls. Eating a Ration cleanses hunger instantly.</li>
                  <li><strong>Exhaustion</strong>: Stamina points (SP) represent your energy. Letting your fatigue drop below 0 triggers Exhaustion, applying a severe penalty: <strong>-2 penalty per negative SP tier</strong>.</li>
                  <li><strong>Recovery</strong>: Eat rations to recover fatigue, or choose the "Rest" downtime option at taverns/campfires between adventures.</li>
                </ul>
              </section>

              {/* Section 4: Dynamic NPC Memory */}
              <section className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">4. The Living World & NPC Memory</h4>
                <p>
                  The AI Game Master acts as a storyteller and holds structural memories of your character:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>NPCs remember your honesty, threats, and deals. Their trust and fear parameters are injected into GMs prompts to alter dialog and quest outcomes.</li>
                  <li>Items dropped on the ground remain in that specific room. At the end of the adventure, the village guards salvage what was left behind and place it in your persistent <strong>Stronghold Chest</strong>.</li>
                </ul>
              </section>

            </div>
            
            {/* Modal Footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 border border-amber-550 text-slate-950 font-bold text-3xs font-extrabold uppercase tracking-wider rounded transition-colors cursor-pointer shadow-md"
              >
                Close Rulebook
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
