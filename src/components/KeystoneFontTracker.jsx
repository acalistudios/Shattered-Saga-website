import React, { useState } from 'react';
import { getKeystoneStatus, getKeystoneCount, isTier4Unlocked } from '../data/keystoneShards';

export default function KeystoneFontTracker({ character, sandboxMode = false, onSelectAdventure }) {
  const shards = getKeystoneStatus(character);
  const count = getKeystoneCount(character);
  const tier4Unlocked = isTier4Unlocked(character, sandboxMode);
  const [selectedShard, setSelectedShard] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 shadow-xl backdrop-blur-md transition-all">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600/30 to-purple-700/30 border border-amber-500/40 flex items-center justify-center text-lg shadow-inner">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-amber-200 text-sm tracking-wide">
                The Fivefold Font
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                count >= 3 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                  : 'bg-slate-900 border-amber-500/30 text-amber-400'
              }`}>
                {count} / 5 Shards Restored
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Restore the fractured elemental keystones to heal the planar convergence.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="text-xs px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 cursor-pointer transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Inspect Font'}
        </button>
      </div>

      {/* Sockets Row / Altar Display */}
      <div className="mt-4 flex flex-wrap items-center justify-around gap-2 sm:gap-4">
        {shards.map((shard) => {
          const isSelected = selectedShard?.id === shard.id;
          return (
            <button
              key={shard.id}
              type="button"
              onClick={() => setSelectedShard(isSelected ? null : shard)}
              className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all cursor-pointer ${
                shard.isAwakened
                  ? `${shard.bgClass} ${shard.glowClass} scale-100 hover:scale-105`
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
              } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
            >
              {/* Elemental Icon & Pulsing Halo */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  shard.isAwakened 
                    ? 'bg-slate-950/70 border border-current shadow-lg animate-pulse' 
                    : 'bg-slate-950/40 opacity-40 grayscale'
                }`}>
                  {shard.icon}
                </div>
                {shard.isAwakened && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-slate-950 shadow-sm" />
                )}
              </div>

              {/* Shard Label */}
              <span className={`text-[10px] font-serif font-bold uppercase tracking-wider mt-1.5 ${
                shard.isAwakened ? 'text-amber-200' : 'text-slate-500'
              }`}>
                {shard.element}
              </span>

              <span className="text-[9px] text-slate-400 font-mono">
                {shard.isAwakened ? 'Awakened' : 'Dormant'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Shard Details Card */}
      {selectedShard && (
        <div className="mt-4 p-3 bg-slate-900/90 rounded-lg border border-amber-500/30 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedShard.icon}</span>
              <strong className="text-amber-300 font-serif text-sm">
                {selectedShard.name}
              </strong>
              <span className="text-[10px] text-slate-400 italic">
                ({selectedShard.fontTitle})
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
              selectedShard.isAwakened
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-700 text-slate-400'
            }`}>
              {selectedShard.isAwakened ? '✓ Awakened' : 'Fractured / Missing'}
            </span>
          </div>

          <p className="text-slate-300 mt-2 leading-relaxed text-[11px]">
            {selectedShard.lore}
          </p>

          {/* Resonance Perk details */}
          {selectedShard.resonance && (
            <div className={`mt-2.5 p-2 rounded border text-[11px] ${
              selectedShard.isAwakened
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{selectedShard.resonance.perkName}</span>
                </span>
                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                  selectedShard.isAwakened ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {selectedShard.isAwakened ? 'Active Resonance' : 'Dormant Potential'}
                </span>
              </div>
              <p className="leading-relaxed opacity-90">{selectedShard.resonance.perkDesc}</p>
            </div>
          )}

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div>
              <span className="text-slate-500">Restoration Source: </span>
              <span className="text-amber-400 font-medium">{selectedShard.sourceAdventuresText}</span>
              <span className="text-slate-500"> ({selectedShard.region})</span>
            </div>

            {selectedShard.isAwakened ? (
              <span className="text-emerald-400 font-mono text-[10px]">
                Restored to the Fivefold Font
              </span>
            ) : (
              <span className="text-rose-400 font-mono text-[10px]">
                Embark on source quest to recover
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Resonances Summary */}
      {count > 0 && (
        <div className="mt-3 pt-2.5 border-t border-amber-500/20">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
            <span>✨</span>
            <span>Active Keystone Resonances ({count}/5)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shards.filter(s => s.isAwakened).map(s => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-950/40 border border-amber-500/30 text-amber-200 shadow-sm"
                title={s.resonance?.perkDesc}
              >
                <span>{s.icon}</span>
                <span className="font-semibold">{s.resonance?.perkName}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Font Altar Lore & Tier 4 Gating Status */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 animate-fadeIn">
          <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
            <h4 className="font-serif font-bold text-amber-300 mb-1">Planar Convergence Seal</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When all five elemental shards are placed into the Fivefold Font, the primeval rift at the center of the continent will seal, ending the planar static threatening Aethelgard.
            </p>
          </div>

          <div className={`p-2.5 rounded border flex items-center justify-between text-xs ${
            tier4Unlocked
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-base">{tier4Unlocked ? '🔓' : '🔒'}</span>
              <div>
                <span className="font-bold">Tier 4 Mythic Cataclysms: </span>
                <span>{tier4Unlocked ? 'Available to embark' : 'Sealed by Planar Static'}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
              {count} / 3 Shards Required
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
