import { useState, useEffect, useRef } from 'react';

export const TRACKS_PLAYLIST = [
  { id: 'main_menu', name: 'Shattered Saga Theme (Main Menu)', file: '/audio/main_menu.mp3' },
  { id: 'map_theme', name: '"Shattered Saga" Region 1 Map', file: '/audio/map_theme.mp3' },
  { id: 'loading_theme', name: 'Through the Veil (Loading Theme)', file: '/audio/loading_theme.mp3' },
  { id: 'free_roam', name: 'Eldoria Wilds (Free Roam)', file: '/audio/free_roam.mp3' },
  { id: 'ashveil_keep', name: 'Ashveil Keep (Gothic Ambient)', file: '/audio/ashveil_keep.mp3' },
  { id: 'saltblood_mines', name: 'Saltblood Mines (Tense Industrial)', file: '/audio/saltblood_mines.mp3' },
  { id: 'obsidian_vault', name: 'Obsidian Vault (Volcanic Theme)', file: '/audio/obsidian_vault.mp3' },
  { id: 'sunken_spire', name: 'Sunken Spire (Aquatic Ethereal)', file: '/audio/sunken_spire.mp3' }
];

export default function useAudioPlayer(screen, activeAdventureId, isLoading) {
  // Load preferences from localStorage
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('shattered_saga_audio_volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('shattered_saga_audio_muted');
    return saved !== null ? saved === 'true' : false;
  });

  const [isPlaying, setIsPlaying] = useState(false);
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

    // Synchronize play state
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
    localStorage.setItem('shattered_saga_audio_volume', parsed.toString());
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = parsed;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('shattered_saga_audio_muted', nextMuted.toString());
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

  // Skip to next track in playlist
  const skipForward = () => {
    setManualOverride(true);
    const nextIndex = (currentTrackIndex + 1) % TRACKS_PLAYLIST.length;
    changeTrack(nextIndex);
  };

  // Skip to previous track in playlist
  const skipBackward = () => {
    setManualOverride(true);
    const prevIndex = (currentTrackIndex - 1 + TRACKS_PLAYLIST.length) % TRACKS_PLAYLIST.length;
    changeTrack(prevIndex);
  };

  // Track changer with a smooth cross-fade
  const changeTrack = (index) => {
    if (!audioRef.current) return;
    const track = TRACKS_PLAYLIST[index];
    if (!track) return;

    setCurrentTrackIndex(index);

    const targetSrc = window.location.origin + track.file;
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
            audioRef.current.src = track.file;
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
      // Just swap the source if not playing
      audioRef.current.src = track.file;
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  };

  // Automatically determine track index based on game state if manualOverride is false
  useEffect(() => {
    if (manualOverride) return;

    let targetTrackId = 'free_roam';

    if (isLoading) {
      targetTrackId = 'loading_theme';
    } else if (screen === 'splash' || screen === 'gm_selection' || screen === 'character_creation') {
      targetTrackId = 'main_menu';
    } else if (screen === 'adventure_selection') {
      targetTrackId = 'map_theme';
    } else if (screen === 'play') {
      if (activeAdventureId === 'ashveil_keep') {
        targetTrackId = 'ashveil_keep';
      } else if (activeAdventureId === 'saltblood_mines') {
        targetTrackId = 'saltblood_mines';
      } else if (activeAdventureId === 'obsidian_vault') {
        targetTrackId = 'obsidian_vault';
      } else if (activeAdventureId === 'sunken_spire') {
        targetTrackId = 'sunken_spire';
      } else {
        targetTrackId = 'free_roam';
      }
    }

    const index = TRACKS_PLAYLIST.findIndex((t) => t.id === targetTrackId);
    if (index !== -1 && index !== currentTrackIndex) {
      changeTrack(index);
    }
  }, [screen, activeAdventureId, isLoading, manualOverride]);

  // Reset manual override when screen transition occurs
  useEffect(() => {
    setManualOverride(false);
  }, [screen, activeAdventureId]);

  // Document listener to start playing after first user click
  const forceStart = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Autoplay play deferred:', err));
    }
  };

  const currentTrack = TRACKS_PLAYLIST[currentTrackIndex];

  return {
    isPlaying,
    volume,
    isMuted,
    currentTrack,
    setVolume,
    toggleMute,
    togglePlay,
    skipForward,
    skipBackward,
    forceStart
  };
}
