import React, { useState, useEffect } from 'react';
import { GMS } from '../data/gms';

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
  layoutMode = 'desktop'
}) {
  const isDesktopLayout = layoutMode === 'desktop';
  const [countdowns, setCountdowns] = useState({});

  // Trigger ticking clock for countdowns
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

  // Check if a GM has its key configured (or if sandbox is active)
  const isKeyConfigured = (gmId) => {
    if (settings.sandboxMode) return true;
    if (gmId === 'oracle') return !!settings.keys.oracle;
    if (gmId === 'titan') return !!settings.keys.titan;
    if (gmId === 'ancient') return !!settings.keys.ancient;
    return false;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Top Navigation / Info Bar */}
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
        <div className="flex items-center gap-3">
          {settings.sandboxMode ? (
            <span className="px-3 py-1 text-xs rounded border border-amber-500/30 bg-amber-950/40 text-amber-400 font-semibold animate-pulse">
              Sandbox Play Active
            </span>
          ) : (
            <span className="px-3 py-1 text-xs rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 font-semibold">
              Live APIs Active
            </span>
          )}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors"
            title="Configure API Keys"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0x" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Selection Body */}
      <div className="flex-1 flex flex-col justify-start items-center py-4 my-auto">
        <h2 className="text-2xl font-bold text-center text-amber-100 mb-2">
          Choose Your Game Master
        </h2>
        <p className="text-sm text-slate-400 text-center max-w-md mb-8">
          Each GM weaves a distinct narrating personality and runs on a separate AI pipeline. Their magical power depletes as they speak.
        </p>

        {/* GM Cards Grid */}
        <div className={`grid gap-6 w-full ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {GMS.map((gm) => {
            const energy = gmEnergies[gm.id];
            const locked = isGmLocked ? isGmLocked(gm.id) : false;
            const depleted = isGmDepleted(gm.id) || locked;
            const keyConfigured = isKeyConfigured(gm.id);
            const canSelect = !depleted && keyConfigured;
            
            return (
              <div
                key={gm.id}
                className={`relative flex flex-col justify-between rounded-lg p-5 border text-left transition-all duration-300 ${
                  depleted
                    ? 'opacity-40 bg-slate-950/40 border-slate-900 shadow-none'
                    : !keyConfigured
                    ? 'bg-slate-900/60 border-slate-800'
                    : `bg-slate-900/40 ${gm.theme.glowClass} cursor-pointer scale-100 hover:scale-103 shadow-lg shadow-black/40`
                }`}
                onClick={() => canSelect && onSelectGm(gm.id)}
              >
                <div>
                  {/* GM Header Info */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 text-2xs uppercase tracking-wider rounded font-bold ${gm.theme.badgeClass}`}>
                      {gm.provider}
                    </span>
                    
                    {locked ? (
                      <span className="px-2 py-0.5 text-2xs uppercase rounded bg-rose-950 text-rose-400 border border-rose-500/30 font-bold animate-pulse">
                        Locked Out
                      </span>
                    ) : depleted ? (
                      <span className="px-2 py-0.5 text-2xs uppercase rounded bg-rose-950 text-rose-400 border border-rose-500/30 font-bold">
                        Depleted
                      </span>
                    ) : !keyConfigured ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSettings();
                        }}
                        className="px-2 py-0.5 text-2xs uppercase rounded bg-amber-950/50 text-amber-500 border border-amber-500/20 font-bold hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                      >
                        Setup Key Required
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">
                        Ready
                      </span>
                    )}
                  </div>

                  {/* GM Portrait / Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-2 shadow-inner bg-slate-950 flex items-center justify-center ${gm.theme.avatarBorder} ${depleted ? 'grayscale' : ''}`}>
                      <img
                        src={gm.avatar}
                        /* We dynamically import via imported variables in data/gms.js so it reads files correctly */
                        srcSet=""
                        alt={gm.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to text initials if image fails
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<span class="text-3xl font-extrabold ${gm.theme.accentText}">${gm.name.split(' ').map(n => n[0]).join('')}</span>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* GM Name & Description */}
                  <h3 className={`text-xl font-bold text-center mb-2 ${gm.theme.accentText}`}>
                    {gm.name}
                  </h3>
                  
                  <p className="text-xs text-slate-350 leading-relaxed text-center mb-4 min-h-12">
                    {gm.description}
                  </p>
                </div>

                {/* GM Stats / Energy Bar */}
                <div className="mt-4 border-t border-slate-800/80 pt-4">
                  {/* Energy Meter Label */}
                  <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                    <span className="text-slate-400">Magical Power</span>
                    <span className={energy <= 20 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
                      {energy}%
                    </span>
                  </div>
                  
                  {/* Outer Energy bar */}
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${gm.theme.barColor} ${
                        energy <= 20 ? 'energy-pulse-active text-rose-500' : ''
                      }`}
                      style={{ width: `${energy}%` }}
                    />
                  </div>

                  {/* Limits and reset details */}
                  <div className="flex justify-between items-center mt-3 text-3xs text-slate-500 font-medium">
                    <span>Quota: {gm.dailyLimit.toLocaleString()} tokens</span>
                    {depleted && countdowns[gm.id] && (
                      <span className="text-amber-500 font-bold">
                        Recharges in {countdowns[gm.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="mt-8 flex justify-center text-xs text-slate-550 border-t border-slate-900 pt-4 text-center">
        <p>
          Shattered Saga is crafted by <strong className="text-slate-400">ACALI Studios</strong>. All game state resides locally.
        </p>
      </div>

    </div>
  );
}
