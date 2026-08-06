import { useState, useEffect } from 'react';
import storage from '../utils/storage';

const DEFAULT_SETTINGS = {
  keys: {
    oracle: import.meta.env.VITE_GEMINI_API_KEY || '',
    titan: import.meta.env.VITE_GROQ_API_KEY || '',
    ancient: import.meta.env.VITE_CEREBRAS_API_KEY || '',
  },
  // Sandbox (offline mock) is only the default when there is NO real engine available:
  // no backend Worker (VITE_API_URL) and no local provider key. Note VITE_* values are
  // public in the built bundle, so the shared Gemini key lives on the Worker, not here.
  sandboxMode: !(
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GROQ_API_KEY ||
    import.meta.env.VITE_CEREBRAS_API_KEY
  ),
  engineTier: 'free',
  userApiKey: '',
  strongholdChest: [],
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
      : !(
          import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_GEMINI_API_KEY ||
          import.meta.env.VITE_GROQ_API_KEY ||
          import.meta.env.VITE_CEREBRAS_API_KEY
        );
    
    const engineTier = stored.engineTier || 'free';
    const userApiKey = stored.userApiKey || '';
    const strongholdChest = stored.strongholdChest || [];
    
    const byokProvider = stored.byokProvider || 'gemini';
    const byokModel = stored.byokModel || 'gemini-1.5-flash';
    const byokKeys = {
      gemini: stored.byokKeys?.gemini || stored.userApiKey || '',
      openai: stored.byokKeys?.openai || '',
      anthropic: stored.byokKeys?.anthropic || '',
      ...(stored.byokKeys || {})
    };
    
    return { keys, sandboxMode, engineTier, userApiKey, strongholdChest, byokProvider, byokModel, byokKeys };
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

  const setEngineTier = (tier) => {
    setSettings((prev) => {
      const updated = { ...prev, engineTier: tier };
      storage.set('settings', updated);
      return updated;
    });
  };

  const setUserApiKey = (key) => {
    setSettings((prev) => {
      const updated = { 
        ...prev, 
        userApiKey: key,
        byokKeys: {
          ...prev.byokKeys,
          [prev.byokProvider || 'gemini']: key
        }
      };
      storage.set('settings', updated);
      return updated;
    });
  };

  const setByokProvider = (provider) => {
    setSettings((prev) => {
      const updated = { ...prev, byokProvider: provider };
      storage.set('settings', updated);
      return updated;
    });
  };

  const setByokModel = (model) => {
    setSettings((prev) => {
      const updated = { ...prev, byokModel: model };
      storage.set('settings', updated);
      return updated;
    });
  };

  const setByokKey = (provider, key) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        byokKeys: {
          ...prev.byokKeys,
          [provider]: key
        },
        userApiKey: provider === prev.byokProvider ? key : prev.userApiKey
      };
      storage.set('settings', updated);
      return updated;
    });
  };

  const addToStrongholdChest = (items) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        strongholdChest: [...(prev.strongholdChest || []), ...items]
      };
      storage.set('settings', updated);
      return updated;
    });
  };

  const updateStrongholdChest = (newChest) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        strongholdChest: newChest
      };
      storage.set('settings', updated);
      return updated;
    });
  };

  return {
    settings,
    updateSettings,
    updateApiKey,
    setSandboxMode,
    setEngineTier,
    setUserApiKey,
    setByokProvider,
    setByokModel,
    setByokKey,
    addToStrongholdChest,
    updateStrongholdChest,
  };
}
