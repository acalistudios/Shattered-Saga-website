import { useState, useEffect, useRef } from 'react';
import useSettings from './hooks/useSettings';
import useGameState from './hooks/useGameState';
import useAudioPlayer from './hooks/useAudioPlayer';
import Splash from './screens/Splash';
import CharacterCreation from './screens/CharacterCreation';
import AdventureSelection from './screens/AdventureSelection';
import PlayScreen from './screens/PlayScreen';
// GMSelection screen removed: the game now uses a single neutral narrator.
import AccountScreen from './screens/AccountScreen';
import SettingsModal from './components/SettingsModal';
import DowntimeMarketModal from './components/DowntimeMarketModal';
import GlobalMusicPlayer from './components/GlobalMusicPlayer';
import { ADVENTURES_LIST } from './data/adventures';
import { isGloballyBanned } from './utils/safety';
import storage from './utils/storage';
import {
  isBackendConfigured,
  signUpEmail,
  signInEmail,
  signOut as apiSignOut,
  socialLoginRedirect,
  fetchMe,
  getToken,
} from './utils/authApi';
import {
  spendGems,
  unlockSlot,
  queueSync,
  flushSync,
  reconcileOnLogin,
} from './utils/cloudSaves';

function App() {
  const {
    settings,
    updateApiKey,
    setSandboxMode,
    setEngineTier,
    setUserApiKey,
    setByokProvider,
    setByokModel,
    setByokKey,
    clearByokKeys,
    updateStrongholdChest
  } = useSettings();

  const {
    updateCharacterStats,
    character,
    activeGm,
    gmEnergies,
    history,
    journal,
    skillTally,
    isLoading,
    apiError,
    warningMessage,
    isUpgradeScreenVisible,
    activeAdventureId,
    safetyState,
    createCharacter,
    sendPlayerAction,
    triggerManualVisualization,
    executeMilestoneUpgrades,
    closeUpgradeScreen,
    resetGame,
    updateCharacterPortrait,
    quitActiveAdventure,
    exitAdventureSavingProgress,
    retryLastAction,
    startAdventure,
    userProfile,
    fetchUserProfile,
    eatRation,
    restCharacter,
    convertSP,
    toggleEquip,
    equipItem,
    unequipItem,
    dropItem,
    pickUpItem,
    currentLocation,
    droppedItems,
    calculateWeightAndVolume,
    enemyAttacksQueue,
    resolveEnemyAttack,
    useInventoryItem,
    triggerPriceRecovery,
    buyItemFromMerchant,
    sellItemToMerchant,
    adjustMerchantRelationship,
    buyTavernService,
    initializeMerchantStock,
    trainSkillWithMerchant,
    activeEnemy,
    counterOpportunities,
    combatStance,
    executeCombatManeuver,
    executeCounterAttack,
    unlockRegion,
    consumeItem
  } = useGameState();

  const [screen, setScreen] = useState('splash');
  const [prevScreen, setPrevScreen] = useState('splash');
  const [accountInitialSection, setAccountInitialSection] = useState('overview');
  const [accountNotice, setAccountNotice] = useState(null);
  const [accountAuthError, setAccountAuthError] = useState('');

  const handleOpenAccount = (options = {}) => {
    const section = typeof options === 'string' ? options : options.section;
    setPrevScreen(screen);
    setAccountInitialSection(section || 'overview');
    if (options.reason === 'insufficient_gems') {
      setAccountNotice(options.message || 'You need more gems for that purchase. Buy a gem pack here, then return to continue.');
    }
    setScreen('account');
  };
  const audio = useAudioPlayer(screen, activeAdventureId, isLoading, history);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDowntimeMarketOpen, setIsDowntimeMarketOpen] = useState(false);
  const [username, setUsername] = useState(() => storage.get('shattered_username') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!storage.get('shattered_username'));
  const [gems, setGems] = useState(0);

  const setActiveSlotIndex = (slotIndex) => {
    storage.set('active_slot_index', slotIndex);
    storage.set('shatteredsaga_active_slot_index', slotIndex);
  };

  // Viewport simulation states
  const [viewportMode, setViewportMode] = useState('auto');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Unlock the audio engine on the FIRST user click/keypress (autoplay compliance).
  //
  // This must run exactly once for the lifetime of the app. `audio` is a fresh
  // object on every render, so depending on it re-ran this effect constantly and
  // re-attached the listener — which meant clicking Pause paused the track, the
  // click then bubbled to this listener, and forceStart() saw a paused element and
  // immediately resumed it. The pause never stuck. The ref guard makes the unlock
  // genuinely one-shot; audioRef keeps the callback pointed at the current player
  // without making the effect depend on it.
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const hasUnlockedAudioRef = useRef(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (hasUnlockedAudioRef.current) return;
      hasUnlockedAudioRef.current = true;
      audioRef.current?.forceStart();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const activeLayout = viewportMode === 'mobile'
    ? 'mobile'
    : (viewportMode === 'desktop' ? 'desktop' : (isDesktop ? 'desktop' : 'mobile'));

  const showMobileFrame = activeLayout === 'mobile' && isDesktop;

  // Gem balance.
  //
  // With the backend configured, gems are SERVER-AUTHORITATIVE: they arrive via
  // /api/me on the user profile and are only ever changed through the Worker.
  // They used to live in localStorage, which meant anyone could grant themselves
  // gems in devtools and a cache clear destroyed purchases.
  //
  // The localStorage path below is retained only for guests/sandbox players, who
  // have no account to attach a balance to.
  useEffect(() => {
    if (isBackendConfigured) {
      setGems(typeof userProfile?.gems === 'number' ? userProfile.gems : 0);
      return;
    }
    if (username) {
      const gemKey = `shattered_gems_${username}`;
      const savedGems = storage.get(gemKey);
      if (savedGems === null) {
        storage.set(gemKey, '10');
        setGems(10);
      } else {
        setGems(parseInt(savedGems, 10));
      }
    } else {
      setGems(0);
    }
  }, [username, userProfile?.gems]);

  // Stripe returns to the app root after Checkout. Handle that at the app level
  // so balances refresh even when the player lands on Splash instead of Account.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get('billing');
    if (!outcome) return;

    window.history.replaceState(null, '', window.location.pathname);
    setPrevScreen('splash');
    setAccountInitialSection('store');
    setScreen('account');

    if (outcome === 'success') {
      setAccountNotice('Payment received. Refreshing your account balance while Stripe delivers the webhook.');
      let tries = 0;
      const poll = setInterval(() => {
        tries += 1;
        fetchUserProfile();
        if (tries >= 6) {
          clearInterval(poll);
          setAccountNotice('Purchase complete. If the balance still looks unchanged, refresh again in a moment.');
        }
      }, 2000);
      return () => clearInterval(poll);
    }

    if (outcome === 'cancelled') {
      setAccountNotice('Checkout was cancelled. No payment was made.');
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('error') || params.get('auth_error');
    const authProvider = params.get('auth_provider');
    const authFlow = params.get('auth_flow');
    const authLinked = params.get('auth_linked');
    const authSuccess = params.get('auth_success');
    if (!authError && !authLinked && !authSuccess) return;

    window.history.replaceState(null, '', window.location.pathname);
    setPrevScreen('splash');
    setAccountInitialSection(authError ? 'support' : 'overview');
    setScreen('account');

    if (authError === 'account_not_linked') {
      setAccountAuthError(authError);
      setAccountNotice('That social login is not linked yet. If you are switching players on a shared computer, use Switch / Logout first and sign in again with the correct Google/Facebook account. If you are trying to attach this provider to your current account, sign in with your original method and use Login Help to link it.');
      return;
    }

    if (authError) {
      setAccountAuthError(authError);
      const source = authProvider ? `${authProvider} ${authFlow === 'link' ? 'linking' : 'sign-in'}` : 'Sign-in';
      setAccountNotice(`${source} failed. Use Login Help to report this if retrying does not work. Error: ${authError}.`);
      return;
    }

    setAccountAuthError('');
    if (authLinked) {
      setAccountNotice(`${authLinked} has been linked to this account.`);
      fetchUserProfile();
      return;
    }

    setAccountNotice(`${authSuccess} sign-in completed.`);
    fetchUserProfile();
  }, [fetchUserProfile]);

  // After a social sign-in the Worker redirects back here with a session cookie
  // scoped to .shatteredsaga.com — but nothing is in local storage yet, so the
  // app would still look logged out. Ask the backend who we are and adopt it.
  useEffect(() => {
    if (!isBackendConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (cancelled || !me?.email) return;
        const nextUsername = me.email.split('@')[0];
        storage.set('shattered_email', me.email);
        storage.set('shattered_username', nextUsername);
        setUsername(nextUsername);
        setIsLoggedIn(true);
        window.dispatchEvent(new Event('shattered_auth_update'));
      } catch {
        /* no active session — stay logged out */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Reconcile local saves with the cloud once the user is signed in.
  //
  // Runs once per login. Two directions:
  //  - Cloud newer (or this device has nothing): offer to restore, so a player
  //    who cleared their cache or switched device gets their character back.
  //  - Local character with no cloud copy: upload it, migrating pre-existing
  //    local-only saves without the player having to do anything.
  const cloudReconciledRef = useRef(false);
  useEffect(() => {
    // Wait for the profile: gem balance and unlocked slots decide whether a
    // displaced character can be given a slot or needs to be bought room.
    if (!isBackendConfigured || !isLoggedIn || !userProfile || cloudReconciledRef.current) return;
    cloudReconciledRef.current = true;

    (async () => {
      try {
        const res = await reconcileOnLogin({
          confirm: async (message) => window.confirm(message),
          unlockedSlots: userProfile?.unlocked_slots || [1, 2],
          gems: userProfile?.gems ?? 0,
          // Lets the player buy a slot mid-reconciliation rather than being told
          // a character can't be saved. Nothing is ever deleted for them.
          onBuySlot: (slotIndex) => unlockSlot(slotIndex),
        });
        if (res.unsaved.length) {
          console.warn('Characters left local-only (no free slot):', res.unsaved);
        }
        // If anything was restored or relocated, the in-memory game state is
        // stale relative to storage — reload so the slot list and active slot
        // reflect what was just written.
        if (res.restored.length || res.relocated.length) {
          window.location.reload();
        }
      } catch (err) {
        console.warn('Cloud save reconciliation failed:', err);
      }
    })();
  }, [isLoggedIn, userProfile]);

  // Mirror the active slot to the cloud as play progresses. Debounced inside
  // cloudSaves, so a burst of turns results in a single upload once play settles.
  useEffect(() => {
    if (!isBackendConfigured || !isLoggedIn || !character?.name) return;
    const slotIndex = parseInt(storage.get('active_slot_index') || storage.get('shatteredsaga_active_slot_index') || '1', 10);
    queueSync(slotIndex);
  }, [isLoggedIn, character, history, journal]);

  // Parse Supabase OAuth redirect URL hash on boot (legacy path only).
  useEffect(() => {
    if (isBackendConfigured) return; // Better Auth backend handles auth instead.
    const parseOAuthHash = async () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = params.get('access_token');
        const errorDescription = params.get('error_description');
        
        if (accessToken) {
          storage.set('supabase_session_token', accessToken);
          // Clear hash from address bar immediately
          window.history.replaceState(null, null, window.location.pathname + window.location.search);
          
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
          
          if (supabaseUrl && supabaseAnonKey) {
            try {
              const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
                headers: {
                  'apikey': supabaseAnonKey,
                  'Authorization': `Bearer ${accessToken}`
                }
              });
              if (res.ok) {
                const userData = await res.json();
                if (userData && userData.email) {
                  storage.set('shattered_email', userData.email);
                  const newUsername = userData.email.split('@')[0];
                  storage.set('shattered_username', newUsername);
                  
                  // Update local state
                  setUsername(newUsername);
                  setIsLoggedIn(true);
                  
                  // Notify useGameState to fetch user profile
                  window.dispatchEvent(new Event('shattered_auth_update'));
                }
              }
            } catch (err) {
              console.error("Error retrieving user details from Supabase OAuth:", err);
            }
          }
        } else if (errorDescription) {
          console.error("OAuth error:", errorDescription);
          alert(`Authentication failed: ${errorDescription}`);
        }
      }
    };
    
    parseOAuthHash();
  }, []);

  const handleSocialLogin = (provider) => {
    const isOAuthProvider = ['google', 'facebook'].includes(provider);

    // Better Auth backend: OAuth is a full-page redirect handled by the Worker.
    if (isBackendConfigured && isOAuthProvider) {
      socialLoginRedirect(provider).catch((err) => {
        console.error('Social sign-in failed:', err);
        alert(err.message || `Could not start ${provider} sign-in. Please try again.`);
      });
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!isOAuthProvider) {
      // Guest / Sandbox Login
      const email = 'guest-adventurer@shatteredsaga.com';
      const displayName = provider; // e.g., 'Guest_Adventurer'
      
      storage.set('shattered_email', email);
      storage.set('shattered_username', displayName);
      
      const mockProfile = storage.get(`mock_supabase_profile_${email}`, {
        email: email,
        energy_balance: 100,
        subscription_tier: 'free',
        subscription_status: 'none'
      });
      storage.set(`mock_supabase_profile_${email}`, mockProfile);
      storage.set('supabase_session_token', `mock-session-token-for-${email}`);
      
      setUsername(displayName);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('shattered_auth_update'));
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      // Simulation/Sandbox Mode: Mock login based on provider
      const email = `${provider}-hero@shatteredsaga.com`;
      const displayName = `${provider.charAt(0).toUpperCase() + provider.slice(1)}_Saga_Hero`;
      
      storage.set('shattered_email', email);
      storage.set('shattered_username', displayName);
      
      const mockProfile = storage.get(`mock_supabase_profile_${email}`, {
        email: email,
        energy_balance: 100,
        subscription_tier: 'free',
        subscription_status: 'none'
      });
      storage.set(`mock_supabase_profile_${email}`, mockProfile);
      storage.set('supabase_session_token', `mock-oauth-token-for-${email}`);
      
      setUsername(displayName);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('shattered_auth_update'));
    } else {
      // Real Supabase OAuth Redirect
      const redirectTo = window.location.origin + window.location.pathname;
      const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}&apikey=${supabaseAnonKey}`;
      window.location.href = authorizeUrl;
    }
  };

  const handleLogout = async () => {
    if (isBackendConfigured) {
      // Push any pending save BEFORE dropping the token, or the last stretch of
      // play would only exist on this device.
      const slotIndex = parseInt(storage.get('active_slot_index') || storage.get('shatteredsaga_active_slot_index') || '1', 10);
      try {
        await flushSync(slotIndex);
      } catch {
        /* offline or rejected — local copy is still intact */
      }
      await apiSignOut(); // clears the Better Auth bearer token
    }
    storage.remove('shattered_username');
    storage.remove('shattered_email');
    storage.remove('supabase_session_token');
    setIsLoggedIn(false);
    setUsername('');
    window.dispatchEvent(new Event('shattered_auth_update'));
  };

  // Spend a single gem. When the backend is configured the debit happens
  // server-side (atomic, cannot be forged); the local branch is guests only.
  const handleSpendGem = async (amount = 1, reason = 'in-game') => {
    if (isBackendConfigured && getToken()) {
      const remaining = await spendGems(amount, reason);
      if (remaining === null) {
        handleOpenAccount({ section: 'store', reason: 'insufficient_gems' });
        return false; // insufficient, offline, or rejected
      }
      setGems(remaining);
      return true;
    }
    if (gems >= amount) {
      const newGems = gems - amount;
      setGems(newGems);
      if (username) {
        storage.set(`shattered_gems_${username}`, newGems.toString());
      }
      return true;
    }
    handleOpenAccount({ section: 'store', reason: 'insufficient_gems' });
    return false;
  };

  const handleLoadSlot = (slotIndex) => {
    setActiveSlotIndex(slotIndex);
    storage.set('shatteredsaga_auto_load_game', 'true');
    window.location.reload();
  };

  const handleCreateInSlot = (slotIndex) => {
    const keysToWipe = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier'
    ];
    keysToWipe.forEach(k => {
      storage.remove(`slot_${slotIndex}_${k}`);
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });
    setActiveSlotIndex(slotIndex);
    storage.set('shatteredsaga_auto_start_creation', 'true');
    window.location.reload();
  };

  const handleWipeSlot = (slotIndex) => {
    const keysToWipe = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier'
    ];
    keysToWipe.forEach(k => {
      storage.remove(`slot_${slotIndex}_${k}`);
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });
    window.location.reload();
  };

  // Unlock a save slot. The server owns both the price and the balance check, so
  // the cost argument is only used for the guest/local fallback path.
  const handleUnlockSlot = async (slotIndex, cost) => {
    if (isBackendConfigured && getToken()) {
      const res = await unlockSlot(slotIndex);
      if (!res?.ok) {
        handleOpenAccount({ section: 'store', reason: 'insufficient_gems' });
        return false;
      }
      if (typeof res.gems === 'number') setGems(res.gems);
      if (Array.isArray(res.unlockedSlots)) {
        // Mirror locally so the slot list renders immediately; the server copy
        // remains the source of truth on next /api/me.
        storage.set(`shattered_unlocked_slots_${username}`, res.unlockedSlots);
      }
      window.dispatchEvent(new Event('shattered_slot_unlock'));
      fetchUserProfile();
      return true;
    }
    if (gems >= cost) {
      const newGems = gems - cost;
      setGems(newGems);
      if (username) {
        storage.set(`shattered_gems_${username}`, newGems.toString());
      }
      const gemKey = `shattered_unlocked_slots_${username}`;
      const unlocked = storage.get(gemKey) || [1, 2];
      if (!unlocked.includes(slotIndex)) {
        unlocked.push(slotIndex);
        storage.set(gemKey, unlocked);
      }
      window.dispatchEvent(new Event('shattered_slot_unlock'));
      return true;
    }
    return false;
  };

  // Sync route on boot if an active adventure is detected or auto start creation is queued
  useEffect(() => {
    // Check if the current slot is locked out
    const activeSlotIdx = storage.get('active_slot_index') || storage.get('shatteredsaga_active_slot_index') || '1';
    const safety = storage.get(`slot_${activeSlotIdx}_safety_state`) || storage.get(`shatteredsaga_slot_${activeSlotIdx}_safety_state`);
    let isSlotLocked = false;
    if (safety) {
      isSlotLocked = safety.lockoutExpiryTimestamp && 
                     new Date(safety.lockoutExpiryTimestamp).getTime() > Date.now();
    }

    if (isSlotLocked) {
      setScreen('splash');
      return;
    }

    if (storage.get('shatteredsaga_auto_start_creation') === 'true') {
      storage.remove('shatteredsaga_auto_start_creation');
      setScreen('character_creation');
    } else if (storage.get('shatteredsaga_auto_load_game') === 'true') {
      storage.remove('shatteredsaga_auto_load_game');
      if (character.name) {
        if (activeAdventureId) {
          setScreen('play');
        } else {
          setScreen('adventure_selection');
        }
      }
    } else if (character.name && activeAdventureId) {
      setScreen('play');
    }
  }, [character.name, activeAdventureId]);

  const handleCreateCharacter = (charDetails) => {
    createCharacter(charDetails);
    setScreen('adventure_selection');
  };

  const handleSelectAdventure = (adventureId, isFreeRoam = false) => {
    const adv = ADVENTURES_LIST.find(a => a.id === adventureId);
    if (!adv) return;
    let startingPrompt = adv.startingPrompt;
    if (isFreeRoam) {
      startingPrompt = `You travel back to the lands of ${adv.name}. The storm has passed and the direct threats are gone. Ethereal calm fills the air, and the locals welcome you back as their savior. You are here to rest, recover, converse with characters like ${adv.npcs.map(n => n.name).join(', ')}, or manage your resources. Tell the player what they see as they arrive back.`;
    }
    startAdventure(adventureId, 'narrator', startingPrompt, isFreeRoam);
    setScreen('play');
  };

  const downloadSaveFile = (slotIndex) => {
    const keys = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier', 'current_location',
      'dropped_items', 'npc_memory', 'active_enemy',
      'counter_opportunities', 'combat_stance'
    ];
    
    const saveData = {};
    keys.forEach(k => {
      saveData[k] = storage.get(`slot_${slotIndex}_${k}`);
    });

    const characterName = saveData.character?.name || `Slot_${slotIndex}`;
    const payload = {
      shatteredsaga_save_file: true,
      saveVersion: "2.0",
      slotIndex,
      characterName,
      data: saveData,
      timestamp: new Date().toISOString()
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shattered_saga_save_slot_${slotIndex}_${characterName.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportActiveSaveFile = () => {
    const activeSlotIdx = storage.get('active_slot_index') || storage.get('shatteredsaga_active_slot_index') || '1';
    downloadSaveFile(parseInt(activeSlotIdx, 10));
  };

  const handleImportSaveFile = (saveData, slotIndex) => {
    const keysToWipe = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier', 'current_location',
      'dropped_items', 'npc_memory', 'active_enemy',
      'counter_opportunities', 'combat_stance'
    ];
    keysToWipe.forEach(k => {
      storage.remove(`slot_${slotIndex}_${k}`);
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });

    for (const key in saveData) {
      if (saveData[key] !== null && saveData[key] !== undefined) {
        storage.set(`slot_${slotIndex}_${key}`, saveData[key]);
        storage.set(`shatteredsaga_slot_${slotIndex}_${key}`, saveData[key]);
      }
    }

    setActiveSlotIndex(slotIndex);
    storage.set('shatteredsaga_auto_load_game', 'true');
    window.location.reload();
  };

  const handleEmailPasswordAuth = async (email, password, isSignUp) => {
    // Better Auth backend (Cloudflare Worker) — primary path when configured.
    if (isBackendConfigured) {
      const data = isSignUp
        ? await signUpEmail(email, password)
        : await signInEmail(email, password);
      const userEmail = data?.user?.email || email;
      const usernameVal = userEmail.split('@')[0];
      storage.set('shattered_email', userEmail);
      storage.set('shattered_username', usernameVal);
      setUsername(usernameVal);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('shattered_auth_update'));
      return { success: true };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      // Sandbox Mode
      const usernamePrefix = email.split('@')[0];
      const displayName = usernamePrefix.charAt(0).toUpperCase() + usernamePrefix.slice(1) + '_Adventurer';
      
      storage.set('shattered_email', email);
      storage.set('shattered_username', displayName);
      
      const mockProfile = storage.get(`mock_supabase_profile_${email}`, {
        email: email,
        energy_balance: 100,
        subscription_tier: 'free',
        subscription_status: 'none'
      });
      storage.set(`mock_supabase_profile_${email}`, mockProfile);
      storage.set('supabase_session_token', `mock-password-token-for-${email}`);
      
      setUsername(displayName);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('shattered_auth_update'));
      return { success: true, mode: 'sandbox' };
    }
    
    // Real Supabase Email/Password Call
    try {
      const endpoint = isSignUp ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
      const res = await fetch(`${supabaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error_description || errJson.msg || errJson.message || 'Authentication failed');
      }
      
      const data = await res.json();
      
      if (isSignUp && !data.access_token) {
        return { 
          success: true, 
          message: '✨ Account registered! Please check your email to confirm your account before logging in.' 
        };
      }
      
      const token = data.access_token;
      const userEmail = data.user?.email || email;
      const usernameVal = userEmail.split('@')[0];
      
      storage.set('supabase_session_token', token);
      storage.set('shattered_email', userEmail);
      storage.set('shattered_username', usernameVal);
      
      setUsername(usernameVal);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('shattered_auth_update'));
      
      return { success: true };
    } catch (err) {
      console.error('Email/Password Auth Error:', err);
      throw err;
    }
  };

  const handleImportCharacter = (importedChar, slotIndex) => {
    const keysToWipe = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier'
    ];
    keysToWipe.forEach(k => {
      storage.remove(`slot_${slotIndex}_${k}`);
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });

    storage.set(`slot_${slotIndex}_character`, importedChar);
    storage.set(`slot_${slotIndex}_journal`, {
      storySoFar: 'A new adventure awaits this imported champion.',
      recentTurns: []
    });
    storage.set(`shatteredsaga_slot_${slotIndex}_character`, importedChar);
    storage.set(`shatteredsaga_slot_${slotIndex}_journal`, { 
      storySoFar: 'A new adventure awaits this imported champion.', 
      recentTurns: [] 
    });
    setActiveSlotIndex(slotIndex);
    storage.set('shatteredsaga_auto_load_game', 'true');
    window.location.reload();
  };

  const handleQuitAdventure = () => {
    quitActiveAdventure();
    setScreen('adventure_selection');
  };

  const handleExitAdventure = () => {
    // Suspends the adventure (state is preserved) and returns to the menu.
    // Loading this slot again drops the player straight back into `play`.
    exitAdventureSavingProgress();
    setScreen('splash');
    // Exiting is a natural checkpoint — push immediately rather than waiting
    // out the debounce, so the suspended adventure is safe in the cloud.
    if (isBackendConfigured && isLoggedIn) {
      const slotIndex = parseInt(storage.get('active_slot_index') || storage.get('shatteredsaga_active_slot_index') || '1', 10);
      flushSync(slotIndex);
    }
  };

  const handleSendAction = (actionText, skillFocusId, difficulty, spSpend, inventoryItemUsed) => {
    const apiKey = settings.engineTier === 'byok'
      ? settings.userApiKey
      : (settings.keys.oracle || '');

    sendPlayerAction(
      actionText,
      apiKey,
      settings.sandboxMode,
      skillFocusId,
      difficulty,
      spSpend,
      inventoryItemUsed,
      settings.engineTier
    );
  };

  const handleTriggerVisualize = (customPrompt) => {
    triggerManualVisualization(customPrompt, settings.engineTier);
  };

  const handleResetGame = () => {
    if (window.confirm("Are you sure you want to end your current Saga? This will wipe your character and adventure log.")) {
      resetGame();
      setScreen('splash');
    }
  };


  // Render permanent safety ban overlay if triggered
  if (safetyState.isPermanentlyBanned || isGloballyBanned(username)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none">
        <div className="max-w-md p-8 rounded-xl border border-red-500/35 bg-red-950/10 shadow-2xl relative">
          <div className="text-red-500 text-5xl mb-4 font-serif">⚠️</div>
          <h1 className="text-2xl font-bold font-serif text-red-400 mb-4">SAGA ACCESS TERMINATED</h1>
          <p className="text-sm text-slate-350 leading-relaxed mb-6">
            "Your desired action is at odds with the needs of the realm."
          </p>
          <p className="text-xs text-slate-450 leading-relaxed mb-8">
            You have repeatedly violated core safety regulations of Shattered Saga. All available Game Masters have dissolved their covenants. This terminal is permanently locked.
          </p>
          <button
            onClick={() => {
              if (window.confirm("To lift a permanent ban, all local storage data must be completely wiped. Are you prepared to lose all character data?")) {
                resetGame();
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-slate-900 border border-red-900/30 text-red-400 text-2xs uppercase tracking-wider font-extrabold rounded hover:bg-slate-950 transition-all cursor-pointer"
          >
            Clear Local Data & Re-verify
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <>
        {/* Global Sound Toggle Button */}
        {screen !== 'play' && (
          <button
            onClick={audio.toggleMute}
            className="absolute top-3.5 right-3.5 z-40 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 text-slate-450 hover:text-amber-400 cursor-pointer shadow-md transition-all flex items-center justify-center text-xs animate-fadeIn"
            title={audio.isMuted ? "Unmute Music" : "Mute Music"}
          >
            {audio.isMuted ? "🔇" : audio.isPlaying ? "🔊" : "🎵"}
          </button>
        )}

        {screen === 'splash' && (
          <Splash
            onImportCharacter={handleImportCharacter}
            onImportSaveFile={handleImportSaveFile}
            onExportSaveFile={downloadSaveFile}
            onEmailPasswordAuth={handleEmailPasswordAuth}
            username={username}
            isLoggedIn={isLoggedIn}
            gems={gems}
            userProfile={userProfile}
            onSocialLogin={handleSocialLogin}
            onLogout={handleLogout}
            onLoadSlot={handleLoadSlot}
            onCreateInSlot={handleCreateInSlot}
            onWipeSlot={handleWipeSlot}
            onUnlockSlot={handleUnlockSlot}
            layoutMode={activeLayout}
            onOpenAccount={handleOpenAccount}
          />
        )}

        {screen === 'character_creation' && (
          <CharacterCreation
            onCreateCharacter={handleCreateCharacter}
            onBack={() => setScreen('splash')}
            gems={gems}
            userProfile={userProfile}
            onOpenAccount={handleOpenAccount}
            layoutMode={activeLayout}
          />
        )}

        {screen === 'adventure_selection' && (
          <AdventureSelection
            character={character}
            userProfile={userProfile}
            onSelectAdventure={handleSelectAdventure}
            onBack={() => setScreen('splash')}
            gems={gems}
            onSpendGem={handleSpendGem}
            layoutMode={activeLayout}
            strongholdChest={settings.strongholdChest || []}
            onUpdateStrongholdChest={updateStrongholdChest}
            onUpdateCharacterStats={updateCharacterStats}
            sandboxMode={settings.sandboxMode || false}
            onOpenDowntimeMarket={() => setIsDowntimeMarketOpen(true)}
            unlockRegion={unlockRegion}
            consumeItem={consumeItem}
            onExportSaveFile={handleExportActiveSaveFile}
            onOpenAccount={handleOpenAccount}
          />
        )}

        {screen === 'account' && (
          <AccountScreen
            onBack={() => setScreen(prevScreen)}
            initialSection={accountInitialSection}
            notice={accountNotice}
            onClearNotice={() => setAccountNotice(null)}
            settings={settings}
            setUserApiKey={setUserApiKey}
            setByokProvider={setByokProvider}
            setByokModel={setByokModel}
            setByokKey={setByokKey}
            clearByokKeys={clearByokKeys}
            setEngineTier={setEngineTier}
            setSandboxMode={setSandboxMode}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            userProfile={userProfile}
            fetchUserProfile={fetchUserProfile}
            gems={gems}
            setGems={setGems}
            initialAuthError={accountAuthError}
          />
        )}

         {screen === 'play' && activeGm && (
          <PlayScreen
            character={character}
            activeGm={activeGm}
            userProfile={userProfile}
            gmEnergies={gmEnergies}
            history={history}
            journal={journal}
            skillTally={skillTally}
            onExportSaveFile={handleExportActiveSaveFile}
            isLoading={isLoading}
            apiError={apiError}
            warningMessage={warningMessage}
            isUpgradeScreenVisible={isUpgradeScreenVisible}
            onSendAction={handleSendAction}
            onTriggerVisualize={handleTriggerVisualize}
            onResetGame={handleResetGame}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAccount={handleOpenAccount}
            closeUpgradeScreen={closeUpgradeScreen}
            executeMilestoneUpgrades={executeMilestoneUpgrades}
            settings={settings}
            onRetryLastAction={retryLastAction}
            onQuitAdventure={handleQuitAdventure}
            onExitAdventure={handleExitAdventure}
            activeAdventureId={activeAdventureId}
            onUpdatePortrait={updateCharacterPortrait}
            onEatRation={eatRation}
            onRest={restCharacter}
            onConvertSP={convertSP}
            onToggleEquip={toggleEquip}
            onEquipItem={equipItem}
            onUnequipItem={unequipItem}
            onDropItem={dropItem}
            onPickUpItem={pickUpItem}
            currentLocation={currentLocation}
            droppedItems={droppedItems}
            calculateWeightAndVolume={calculateWeightAndVolume}
            gems={gems}
            onSpendGem={handleSpendGem}
            layoutMode={activeLayout}
            enemyAttacksQueue={enemyAttacksQueue}
            onResolveEnemyAttack={resolveEnemyAttack}
            onUseInventoryItem={useInventoryItem}
            activeEnemy={activeEnemy}
            counterOpportunities={counterOpportunities}
            combatStance={combatStance}
            onExecuteCombatManeuver={executeCombatManeuver}
            onExecuteCounterAttack={executeCounterAttack}
            audio={audio}
          />
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          updateApiKey={updateApiKey}
          setSandboxMode={setSandboxMode}
          userProfile={userProfile}
          fetchUserProfile={fetchUserProfile}
        />

        <DowntimeMarketModal
          character={character}
          isOpen={isDowntimeMarketOpen}
          onClose={() => setIsDowntimeMarketOpen(false)}
          buyItemFromMerchant={buyItemFromMerchant}
          sellItemToMerchant={sellItemToMerchant}
          adjustMerchantRelationship={adjustMerchantRelationship}
          buyTavernService={buyTavernService}
          triggerPriceRecovery={triggerPriceRecovery}
          initializeMerchantStock={initializeMerchantStock}
          trainSkillWithMerchant={trainSkillWithMerchant}
          strongholdChest={settings.strongholdChest || []}
          onUpdateStrongholdChest={updateStrongholdChest}
          onUpdateCharacterStats={updateCharacterStats}
        />
      </>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Dev Viewport Toggle Bar */}
      <div className="w-full bg-slate-900 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between z-50 text-2xs select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-500/70 font-serif uppercase tracking-wider">Dev Toolbar:</span>
          <span className="text-slate-400">Current Layout: <strong className="text-amber-400 uppercase">{activeLayout}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 mr-1">Simulate Viewport:</span>
          {['auto', 'desktop', 'mobile'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewportMode(mode)}
              className={`px-2.5 py-1 rounded text-5xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors ${
                viewportMode === mode
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-405 hover:border-amber-500/35'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
        {showMobileFrame ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-[375px] h-[780px] rounded-[36px] border-[8px] border-slate-800 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-800 rounded-b-xl z-50"></div>
              <div className="flex-1 flex flex-col overflow-hidden w-full h-full relative">
                {renderContent()}
              </div>
            </div>
          </div>
        ) : (
          renderContent()
        )}
        <GlobalMusicPlayer audio={audio} activeAdventureId={activeAdventureId} />
      </div>
    </div>
  );
}

export default App;
