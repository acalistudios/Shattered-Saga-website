import { useState, useEffect, useRef } from 'react';
import { ADVENTURE_MUSIC } from '../data/adventureMusic';

export const GLOBAL_THEMES = [
  { id: 'main_menu', title: 'Shattered Saga Main Theme', file: '/audio/main_menu.mp3', durationSeconds: 60 },
  { id: 'map_theme', title: 'Continent Map Theme', file: '/audio/map_theme.mp3', durationSeconds: 60 },
  { id: 'loading_theme', title: 'Through the Veil (Loading)', file: '/audio/loading_theme.mp3', durationSeconds: 60 }
];

export default function useAudioPlayer(screen, activeAdventureId, isLoading, history = []) {
  // Load preferences from localStorage
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('shattered_saga_volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('shattered_saga_muted');
    return saved !== null ? saved === 'true' : false;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [musicMood, setMusicMoodState] = useState('exploration'); // 'exploration' | 'tension' | 'climax'
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [manualOverride, setManualOverride] = useState(false);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const userVolumeRef = useRef(volume);

  // Initialize Audio
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);

    return () => {
      audio.pause();
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  // Save volume preference changes
  const setVolume = (newVal) => {
    const parsed = Math.max(0, Math.min(1, newVal));
    setVolumeState(parsed);
    userVolumeRef.current = parsed;
    localStorage.setItem('shattered_saga_volume', parsed.toString());
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = parsed;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('shattered_saga_muted', nextMuted.toString());
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Audio play blocked or failed:', err);
      });
    }
  };

  // Skip to next track
  const skipForward = () => {
    setManualOverride(true);
    if (activeAdventureId && ADVENTURE_MUSIC[activeAdventureId]) {
      const moods = ['exploration', 'tension', 'climax'];
      const nextIdx = (moods.indexOf(musicMood) + 1) % moods.length;
      setMusicMood(moods[nextIdx]);
    } else {
      const nextIndex = (currentTrackIndex + 1) % GLOBAL_THEMES.length;
      changeTrack(nextIndex, GLOBAL_THEMES[nextIndex].file);
    }
  };

  // Skip to previous track
  const skipBackward = () => {
    setManualOverride(true);
    if (activeAdventureId && ADVENTURE_MUSIC[activeAdventureId]) {
      const moods = ['exploration', 'tension', 'climax'];
      const prevIdx = (moods.indexOf(musicMood) - 1 + moods.length) % moods.length;
      setMusicMood(moods[prevIdx]);
    } else {
      const prevIndex = (currentTrackIndex - 1 + GLOBAL_THEMES.length) % GLOBAL_THEMES.length;
      changeTrack(prevIndex, GLOBAL_THEMES[prevIndex].file);
    }
  };

  // Track changer with a smooth cross-fade
  const changeTrack = (index, fileSrc) => {
    if (!audioRef.current) return;

    setCurrentTrackIndex(index);

    const targetSrc = window.location.origin + fileSrc;
    if (audioRef.current.src === targetSrc) return;

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const isCurrentlyPlaying = !audioRef.current.paused;

    if (isCurrentlyPlaying) {
      // Fade out
      const startVolume = audioRef.current.volume;
      let steps = 10;
      const fadeStep = startVolume / steps;

      fadeIntervalRef.current = setInterval(() => {
        if (steps > 0 && audioRef.current) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - fadeStep);
          steps--;
        } else {
          clearInterval(fadeIntervalRef.current);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = fileSrc;
            audioRef.current.load();
            audioRef.current.volume = 0;
            audioRef.current.play()
              .then(() => {
                // Fade in
                let inSteps = 10;
                const targetVolume = isMuted ? 0 : userVolumeRef.current;
                const fadeInStep = targetVolume / inSteps;
                fadeIntervalRef.current = setInterval(() => {
                  if (inSteps > 0 && audioRef.current) {
                    audioRef.current.volume = Math.min(targetVolume, audioRef.current.volume + fadeInStep);
                    inSteps--;
                  } else {
                    clearInterval(fadeIntervalRef.current);
                    if (audioRef.current) audioRef.current.volume = targetVolume;
                  }
                }, 30);
              })
              .catch((err) => {
                console.warn('Transition play failed:', err);
              });
          }
        }
      }, 30);
    } else {
      audioRef.current.src = fileSrc;
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  };

  // Set music mood and transition tracks
  const setMusicMood = (mood) => {
    if (!activeAdventureId || !ADVENTURE_MUSIC[activeAdventureId]) return;
    setMusicMoodState(mood);

    const tracks = ADVENTURE_MUSIC[activeAdventureId].tracks;
    const trackIndex = tracks.findIndex(t => t.id === mood);
    if (trackIndex !== -1) {
      changeTrack(trackIndex, tracks[trackIndex].src);
    }
  };

  // Reactive mood selection from GM history tags
  useEffect(() => {
    if (!activeAdventureId || history.length === 0) return;

    // Find the last model message in history
    let lastModelMsg = '';
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'model') {
        lastModelMsg = history[i].content || '';
        break;
      }
    }

    if (!lastModelMsg) return;

    if (lastModelMsg.includes('[combat_start]') || lastModelMsg.includes('[combat]') || lastModelMsg.includes('[battle_start]')) {
      setMusicMood('climax');
    } else if (lastModelMsg.includes('[combat_end]') || lastModelMsg.includes('[victory]') || lastModelMsg.includes('[rest]')) {
      setMusicMood('exploration');
    } else if (lastModelMsg.includes('[tension]') || lastModelMsg.includes('[hazard]') || lastModelMsg.includes('[stealth_start]')) {
      setMusicMood('tension');
    }
  }, [history, activeAdventureId]);

  // Determine current active track based on screen & adventureId
  useEffect(() => {
    if (manualOverride) return;

    if (isLoading) {
      changeTrack(2, GLOBAL_THEMES[2].file); // loading theme
    } else if (screen === 'splash' || screen === 'gm_selection' || screen === 'character_creation') {
      changeTrack(0, GLOBAL_THEMES[0].file); // main menu theme
    } else if (screen === 'adventure_selection') {
      changeTrack(1, GLOBAL_THEMES[1].file); // map theme
    } else if (screen === 'play') {
      // If we entered play mode, default to exploration track of active adventure
      if (activeAdventureId && ADVENTURE_MUSIC[activeAdventureId]) {
        const tracks = ADVENTURE_MUSIC[activeAdventureId].tracks;
        const moodIdx = ['exploration', 'tension', 'climax'].indexOf(musicMood);
        const idx = moodIdx !== -1 ? moodIdx : 0;
        changeTrack(idx, tracks[idx].src);
      } else {
        changeTrack(0, GLOBAL_THEMES[0].file); // fallback free roam
      }
    }
  }, [screen, activeAdventureId, isLoading, musicMood, manualOverride]);

  // Reset override when transitioning screens
  useEffect(() => {
    setManualOverride(false);
  }, [screen, activeAdventureId]);

  // Document listener helper to bypass autoplay blocking
  const forceStart = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Autoplay play deferred:', err));
    }
  };

  // Compile current track details
  let currentTrack = null;
  if (activeAdventureId && ADVENTURE_MUSIC[activeAdventureId]) {
    const tracks = ADVENTURE_MUSIC[activeAdventureId].tracks;
    const moodIdx = ['exploration', 'tension', 'climax'].indexOf(musicMood);
    currentTrack = tracks[moodIdx !== -1 ? moodIdx : 0];
  } else {
    const idx = Math.min(GLOBAL_THEMES.length - 1, Math.max(0, currentTrackIndex));
    currentTrack = {
      id: GLOBAL_THEMES[idx].id,
      title: GLOBAL_THEMES[idx].title,
      src: GLOBAL_THEMES[idx].file,
      durationSeconds: GLOBAL_THEMES[idx].durationSeconds
    };
  }

  return {
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
    skipBackward,
    forceStart
  };
}
