import { useState, useEffect } from 'react';
import storage from '../utils/storage';

const DEFAULT_SETTINGS = {
  keys: {
    oracle: import.meta.env.VITE_GEMINI_API_KEY || '',
    titan: import.meta.env.VITE_GROQ_API_KEY || '',
    ancient: import.meta.env.VITE_CEREBRAS_API_KEY || '',
  },
  sandboxMode: !(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_CEREBRAS_API_KEY),
};

export default function useSettings() {
  const [settings, setSettings] = useState(() => {
    const stored = storage.get('settings', {});
    const keys = {
      oracle: stored.keys?.oracle || import.meta.env.VITE_GEMINI_API_KEY || '',
      titan: stored.keys?.titan || import.meta.env.VITE_GROQ_API_KEY || '',
      ancient: stored.keys?.ancient || import.meta.env.VITE_CEREBRAS_API_KEY || '',
    };
    const sandboxMode = stored.sandboxMode !== undefined
      ? stored.sandboxMode
      : !(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_CEREBRAS_API_KEY);
    
    return { keys, sandboxMode };
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.set('settings', updated);
      return updated;
    });
  };

  const updateApiKey = (gmId, key) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        keys: {
          ...prev.keys,
          [gmId]: key,
        },
      };
      storage.set('settings', updated);
      return updated;
    });
  };

  const setSandboxMode = (enabled) => {
    setSettings((prev) => {
      const updated = { ...prev, sandboxMode: enabled };
      storage.set('settings', updated);
      return updated;
    });
  };

  return {
    settings,
    updateSettings,
    updateApiKey,
    setSandboxMode,
  };
}
