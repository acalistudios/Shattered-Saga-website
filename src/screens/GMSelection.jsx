import React, { useState, useEffect } from 'react';
import { GMS, SAGA_ENGINES } from '../data/gms';

export default function GMSelection({
  gmEnergies,
  onSelectGm,
  getResetCountdown,
  settings,
  onOpenSettings,
  isGmDepleted,
  isGmLocked,
  characterCreated,
  onBack,
  layoutMode = 'desktop',
  setEngineTier,
  setUserApiKey
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const [countdowns, setCountdowns] = useState({});
  const [localKey, setLocalKey] = useState(settings.userApiKey || '');

  // Ticking clock for countdowns (used if Premium engine has daily limits or GMs deplete)
  useEffect(() => {
    const updateAllCountdowns = () => {
      const updated = {};
      GMS.forEach(gm => {
        if (isGmDepleted(gm.id)) {
          updated[gm.id] = getResetCountdown(gm.id);
        }
      });
      setCountdowns(updated);
    };

    updateAllCountdowns();
    const interval = setInterval(updateAllCountdowns, 1000);
    return () => clearInterval(interval);
  }, [isGmDepleted, getResetCountdown]);

  const handleKeyChange = (val) => {
    setLocalKey(val);
    setUserApiKey(val);
  };

  const handleSelectNarrator = (gmId) => {
    if (settings.engineTier === 'byok' && !settings.userApiKey.trim()) {
      alert("Please enter a valid Gemini API Key to use the Sandbox Engine.");
      return;
    }
    onSelectGm(gmId);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-4xs font-bold text-slate-400 hover:text-amber-400 cursor-pointer transition-colors"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className={`font-extrabold text-amber-400 ${isDesktopLayout ? 'text-3xl' : 'text-2xl'}`}>SHATTERED SAGA</h1>
            <p className={`text-slate-400 mt-0.5 uppercase tracking-widest font-semibold ${isDesktopLayout ? 'text-xs' : 'text-3xs'}`}>
              An AI-Powered High Fantasy RPG
            </p>
          </div>
        </div>
      </div>

      {/* Setup Step Container */}
      <div className="flex-1 flex flex-col justify-start items-center py-2">
        
        {/* STEP 1: ENGINE COVENANT */}
        <div className="w-full mb-8 text-center">
          <h2 className="text-xl font-bold text-amber-100 mb-2 uppercase tracking-wide flex items-center justify-center gap-2">
            <span>Step 1: Select Saga Engine</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
            Choose your connection tier. Decouple connection quality from your narrator's personality.
          </p>

          <div className={`grid gap-4 w-full ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {SAGA_ENGINES.map((engine) => {
              const isActive = settings.engineTier === engine.id;
              return (
                <div
                  key={engine.id}
                  onClick={() => setEngineTier(engine.id)}
                  className={`flex flex-col justify-between rounded-lg p-5 border text-left cursor-pointer transition-all duration-300 transform ${
                    isActive
                      ? `bg-slate-900/80 border-amber-500/70 scale-103 shadow-lg shadow-black/60`
                      : `bg-slate-905/30 border-slate-900/60 opacity-60 hover:opacity-100 hover:scale-101 hover:bg-slate-900/30`
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl">{engine.icon}</span>
                      <span className={`px-2 py-0.5 text-3xs uppercase tracking-wider rounded font-bold border ${
                        isActive
                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800'
                      }`}>
                        {engine.badgeText}
                      </span>
                    </div>

                    <h3 className={`text-md font-bold mb-1.5 ${isActive ? 'text-amber-300' : 'text-slate-350'}`}>
                      {engine.name}
                    </h3>
                    <p className="text-3xs text-slate-400 leading-relaxed min-h-12">
                      {engine.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-slate-800/80 pt-3 flex justify-between items-center text-3xs font-semibold">
                    <span className="text-slate-500">Model Engine:</span>
                    <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>{engine.model}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BYOK Input Block */}
          {settings.engineTier === 'byok' && (
            <div className="w-full max-w-lg mx-auto mt-5 p-4 rounded bg-slate-950/60 border border-slate-900 text-left animate-fadeIn">
              <label className="block text-3xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Your Google AI Studio Gemini API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={localKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-amber-500/60 text-xs font-mono"
                />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 font-bold rounded text-3xs transition-colors flex items-center justify-center uppercase tracking-wider"
                >
                  Get Key ↗
                </a>
              </div>
              <p className="text-4xs text-slate-500 mt-1.5 leading-relaxed">
                Your key remains local in your browser storage and directly connects to Google's endpoints.
              </p>
            </div>
          )}
        </div>

        {/* STEP 2: NARRATOR STYLE */}
        <div className="w-full text-center border-t border-slate-900 pt-6">
          <h2 className="text-xl font-bold text-amber-100 mb-2 uppercase tracking-wide">
            Step 2: Choose Narrator Voice
          </h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
            Choose the storytelling tone and visual aura for your campaign.
          </p>

          <div className={`grid gap-5 w-full ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {GMS.map((gm) => {
              const energy = gmEnergies[gm.id];
              const locked = isGmLocked ? isGmLocked(gm.id) : false;
              const depleted = isGmDepleted(gm.id, settings.engineTier) || locked;
              
              return (
                <div
                  key={gm.id}
                  onClick={() => !depleted && handleSelectNarrator(gm.id)}
                  className={`flex flex-col justify-between rounded-lg p-5 border text-left cursor-pointer transition-all duration-300 scale-100 hover:scale-103 shadow-lg shadow-black/40 bg-slate-900/40 ${
                    depleted
                      ? 'opacity-30 pointer-events-none'
                      : gm.theme.glowClass
                  }`}
                >
                  <div>
                    {/* Narrator status badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2 py-0.5 text-3xs uppercase tracking-wider rounded font-bold ${gm.theme.badgeClass}`}>
                        {gm.name}
                      </span>
                      {locked ? (
                        <span className="px-2 py-0.5 text-3xs uppercase rounded bg-rose-950 text-rose-400 border border-rose-500/30 font-bold animate-pulse">
                          Locked Out
                        </span>
                      ) : depleted ? (
                        <span className="px-2 py-0.5 text-3xs uppercase rounded bg-rose-950 text-rose-400 border border-rose-500/30 font-bold">
                          Depleted
                        </span>
                      ) : (
                        <span className="text-3xs text-slate-500 font-semibold uppercase">
                          Select & Begin
                        </span>
                      )}
                    </div>

                    {/* Narrator Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className={`w-28 h-28 rounded-full overflow-hidden border-2 shadow-inner bg-slate-950 flex items-center justify-center ${gm.theme.avatarBorder} ${depleted ? 'grayscale' : ''}`}>
                        <img
                          src={gm.avatar}
                          alt={gm.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = `<span class="text-2xl font-extrabold ${gm.theme.accentText}">${gm.name.split(' ').map(n => n[0]).join('')}</span>`;
                          }}
                        />
                      </div>
                    </div>

                    <h3 className={`text-md font-bold text-center mb-1.5 ${gm.theme.accentText}`}>
                      {gm.name}
                    </h3>
                    <p className="text-3xs text-slate-400 leading-relaxed text-center min-h-12">
                      {gm.description}
                    </p>
                  </div>

                  {/* Energy Meter - Only visible/depleting for Premium tier */}
                  {settings.engineTier === 'premium' && (
                    <div className="mt-4 border-t border-slate-800/80 pt-3">
                      <div className="flex justify-between items-center text-3xs mb-1 font-semibold">
                        <span className="text-slate-500">Magical Power</span>
                        <span className={energy <= 20 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-350'}>
                          {energy}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-850">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${gm.theme.barColor}`}
                          style={{ width: `${energy}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer navigation */}
      <div className="mt-8 flex justify-center text-4xs text-slate-550 border-t border-slate-900 pt-4 text-center">
        <p>
          Shattered Saga is crafted by <strong className="text-slate-400">ACALI Studios</strong>. All game state resides locally.
        </p>
      </div>

    </div>
  );
}
