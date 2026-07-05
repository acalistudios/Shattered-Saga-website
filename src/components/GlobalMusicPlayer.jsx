import React, { useState } from 'react';

export default function GlobalMusicPlayer({ audio, activeAdventureId }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!audio || !audio.currentTrack) return null;

  const {
    isPlaying,
    volume,
    isMuted,
    currentTrack,
    musicMood,
    setVolume,
    toggleMute,
    togglePlay,
    setMusicMood,
    skipForward,
    skipBackward
  } = audio;

  const moods = [
    { id: 'exploration', label: 'Exploration', icon: '🗺️', color: 'text-emerald-400 hover:text-emerald-300 border-emerald-800/40 bg-emerald-950/20 active:bg-emerald-900/40' },
    { id: 'tension', label: 'Tension', icon: '⚠️', color: 'text-amber-400 hover:text-amber-300 border-amber-800/40 bg-amber-950/20 active:bg-amber-900/40' },
    { id: 'climax', label: 'Battle / Climax', icon: '⚔️', color: 'text-red-400 hover:text-red-300 border-red-800/40 bg-red-950/20 active:bg-red-900/40' }
  ];

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-slate-950/90 border border-amber-500/30 shadow-lg hover:shadow-amber-500/20 hover:border-amber-400 flex items-center justify-center transition-all group cursor-pointer select-none"
        title="Open Music Player"
      >
        <span className={`text-base ${isPlaying ? 'animate-spin' : 'group-hover:scale-110'} transition-transform duration-1000`}>
          🎵
        </span>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-amber-400' : 'bg-slate-500'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-amber-500' : 'bg-slate-600'}`}></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs md:max-w-md bg-slate-955/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl transition-all duration-300 select-none hover:border-amber-500/25">
      {/* Top row: Track Title & Minimize */}
      <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-900">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[10px] ${isPlaying ? 'animate-pulse text-amber-400' : 'text-slate-500'}`}>
            {isPlaying ? '🔊' : '🔇'}
          </span>
          <div className="min-w-0">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block">NOW PLAYING</span>
            <span className="text-[10px] font-bold text-slate-200 truncate block font-serif" title={currentTrack.title}>
              {currentTrack.title || 'Shattered Saga Theme'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="text-slate-500 hover:text-slate-350 hover:bg-slate-900 rounded p-1 text-3xs transition-colors cursor-pointer"
          title="Minimize Player"
        >
          ▼
        </button>
      </div>

      {/* Center Controls Panel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={skipBackward}
              className="text-xs text-slate-450 hover:text-amber-400 transition-colors p-1 cursor-pointer"
              title="Previous Track"
            >
              ⏮️
            </button>
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-550/40 text-xs flex items-center justify-center text-slate-200 hover:text-amber-305 transition-all shadow-inner shadow-black/60 cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button
              onClick={skipForward}
              className="text-xs text-slate-455 hover:text-amber-400 transition-colors p-1 cursor-pointer"
              title="Next Track"
            >
              ⏭️
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
            <button
              onClick={toggleMute}
              className="text-2xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔈" : "🔊"}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              title="Volume"
            />
          </div>
        </div>

        {/* Adventure Specific Mood Controls */}
        {activeAdventureId && (
          <div className="mt-1 pt-1.5 border-t border-slate-900/60">
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black block mb-1">SOUNDTRACK MOOD</span>
            <div className="grid grid-cols-3 gap-1">
              {moods.map((mood) => {
                const isActive = musicMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setMusicMood(mood.id)}
                    className={`px-1.5 py-1 rounded-md border text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isActive
                        ? mood.id === 'climax'
                          ? 'bg-red-950/40 border-red-500/50 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                          : mood.id === 'tension'
                          ? 'bg-amber-955/40 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                          : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                        : 'border-transparent text-slate-450 hover:bg-slate-900 hover:text-slate-300'
                    }`}
                  >
                    <span>{mood.icon}</span>
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
