import React, { useState, useEffect } from 'react';
import useSettings from './hooks/useSettings';
import useGameState from './hooks/useGameState';
import Splash from './screens/Splash';
import GMSelection from './screens/GMSelection';
import CharacterCreation from './screens/CharacterCreation';
import AdventureSelection from './screens/AdventureSelection';
import PlayScreen from './screens/PlayScreen';
import SettingsModal from './components/SettingsModal';
import { ADVENTURES_LIST } from './data/adventures';
import { isGloballyBanned } from './utils/safety';
import storage from './utils/storage';

function App() {
  const {
    settings,
    updateApiKey,
    setSandboxMode
  } = useSettings();

  const {
    character,
    activeGmId,
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
    nextRollModifier,
    createCharacter,
    sendPlayerAction,
    swapGmVoluntarily,
    triggerManualVisualization,
    executeMilestoneUpgrades,
    isGmDepleted,
    isGmLocked,
    getResetCountdown,
    closeUpgradeScreen,
    resetGame,
    importCharacter,
    updateCharacterPortrait,
    quitActiveAdventure,
    exitAdventureSavingProgress,
    retryLastAction,
    setActiveAdventureId,
    startAdventure,
    userProfile,
    fetchUserProfile,
    eatRation,
    restCharacter,
    convertSP,
    toggleEquip,
    enemyAttacksQueue,
    resolveEnemyAttack,
    useInventoryItem
  } = useGameState();

  const [screen, setScreen] = useState('splash');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [username, setUsername] = useState(() => storage.get('shattered_username') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!storage.get('shattered_username'));
  const [gems, setGems] = useState(0);

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

  const activeLayout = viewportMode === 'mobile'
    ? 'mobile'
    : (viewportMode === 'desktop' ? 'desktop' : (isDesktop ? 'desktop' : 'mobile'));

  const showMobileFrame = activeLayout === 'mobile' && isDesktop;

  // Sync gems state when username changes
  useEffect(() => {
    if (username) {
      const gemKey = `shattered_gems_${username}`;
      const savedGems = storage.get(gemKey);
      if (savedGems === null) {
        // Grant 10 starting gems with new logins
        storage.set(gemKey, '10');
        setGems(10);
      } else {
        setGems(parseInt(savedGems, 10));
      }
    } else {
      setGems(0);
    }
  }, [username]);

  // Parse Supabase OAuth redirect URL hash on boot
  useEffect(() => {
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
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    const isOAuthProvider = ['google', 'facebook', 'apple'].includes(provider);
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
      const redirectTo = window.location.origin;
      const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
      window.location.href = authorizeUrl;
    }
  };

  const handleLogout = () => {
    storage.remove('shattered_username');
    storage.remove('shattered_email');
    storage.remove('supabase_session_token');
    setIsLoggedIn(false);
    setUsername('');
    window.dispatchEvent(new Event('shattered_auth_update'));
  };

  const handleSpendGem = () => {
    if (gems > 0) {
      const newGems = gems - 1;
      setGems(newGems);
      if (username) {
        storage.set(`shattered_gems_${username}`, newGems.toString());
      }
      return true;
    }
    return false;
  };

  const handleLoadSlot = (slotIndex) => {
    storage.set('shatteredsaga_active_slot_index', slotIndex);
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
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });
    storage.set('shatteredsaga_active_slot_index', slotIndex);
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
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });
    window.location.reload();
  };

  const handleUnlockSlot = (slotIndex, cost) => {
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
      return true;
    }
    return false;
  };

  // Sync route on boot if an active adventure is detected or auto start creation is queued
  useEffect(() => {
    // Check if the current slot is locked out
    const activeSlotIdx = storage.get('shatteredsaga_active_slot_index') || '1';
    const safety = storage.get(`shatteredsaga_slot_${activeSlotIdx}_safety_state`);
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

  const handleSelectGm = (gmId) => {
    if (character.name) {
      swapGmVoluntarily(gmId, settings.sandboxMode ? '' : settings.keys[gmId], settings.sandboxMode);
      setScreen('play');
    } else {
      swapGmVoluntarily(gmId, settings.sandboxMode ? '' : settings.keys[gmId], settings.sandboxMode);
      setScreen('character_creation');
    }
  };

  const handleCreateCharacter = (charDetails) => {
    createCharacter(charDetails);
    setScreen('adventure_selection');
  };

  const handleSelectAdventure = (adventureId) => {
    const adv = ADVENTURES_LIST.find(a => a.id === adventureId);
    if (!adv) return;
    startAdventure(adventureId, adv.suggestedGm, adv.startingPrompt);
    setScreen('play');
  };

  const handleImportCharacter = (importedChar, slotIndex) => {
    const keysToWipe = [
      'character', 'active_gm_id', 'gm_energies', 'history',
      'journal', 'handoff_state', 'skill_tally', 'active_adventure_id',
      'safety_state', 'next_roll_modifier'
    ];
    keysToWipe.forEach(k => {
      storage.remove(`shatteredsaga_slot_${slotIndex}_${k}`);
    });

    storage.set(`shatteredsaga_slot_${slotIndex}_character`, importedChar);
    storage.set(`shatteredsaga_slot_${slotIndex}_journal`, { 
      storySoFar: 'A new adventure awaits this imported champion.', 
      recentTurns: [] 
    });
    storage.set('shatteredsaga_active_slot_index', slotIndex);
    storage.set('shatteredsaga_auto_load_game', 'true');
    window.location.reload();
  };

  const handleQuitAdventure = () => {
    quitActiveAdventure();
    setScreen('adventure_selection');
  };

  const handleExitAdventure = () => {
    exitAdventureSavingProgress();
    setScreen('splash');
  };

  const handleSendAction = (actionText, apiKey, sandbox, skillFocusId, difficulty, spSpend) => {
    sendPlayerAction(actionText, apiKey, sandbox, skillFocusId, difficulty, spSpend);
  };

  const handleTriggerVisualize = (customPrompt) => {
    triggerManualVisualization(customPrompt);
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
        {screen === 'splash' && (
          <Splash
            onImportCharacter={handleImportCharacter}
            username={username}
            isLoggedIn={isLoggedIn}
            gems={gems}
            onSocialLogin={handleSocialLogin}
            onLogout={handleLogout}
            onLoadSlot={handleLoadSlot}
            onCreateInSlot={handleCreateInSlot}
            onWipeSlot={handleWipeSlot}
            onUnlockSlot={handleUnlockSlot}
            layoutMode={activeLayout}
          />
        )}

        {screen === 'gm_selection' && (
          <GMSelection
            gmEnergies={gmEnergies}
            onSelectGm={handleSelectGm}
            getResetCountdown={getResetCountdown}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isGmDepleted={(gmId) => isGmDepleted(gmId) || isGmLocked(gmId)}
            isGmLocked={isGmLocked}
            characterCreated={!!character.name}
            onBack={() => setScreen('splash')}
            layoutMode={activeLayout}
          />
        )}

        {screen === 'character_creation' && (
          <CharacterCreation
            onCreateCharacter={handleCreateCharacter}
            onBack={() => setScreen('splash')}
            layoutMode={activeLayout}
          />
        )}

        {screen === 'adventure_selection' && (
          <AdventureSelection
            character={character}
            onSelectAdventure={handleSelectAdventure}
            onBack={() => setScreen('splash')}
            gems={gems}
            onSpendGem={handleSpendGem}
            layoutMode={activeLayout}
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
            isLoading={isLoading}
            apiError={apiError}
            warningMessage={warningMessage}
            isUpgradeScreenVisible={isUpgradeScreenVisible}
            onSendAction={handleSendAction}
            onSwapGm={() => setScreen('gm_selection')}
            onTriggerVisualize={handleTriggerVisualize}
            onResetGame={handleResetGame}
            onOpenSettings={() => setIsSettingsOpen(true)}
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
            gems={gems}
            onSpendGem={handleSpendGem}
            layoutMode={activeLayout}
            enemyAttacksQueue={enemyAttacksQueue}
            onResolveEnemyAttack={resolveEnemyAttack}
            onUseInventoryItem={useInventoryItem}
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
      </div>
    </div>
  );
}

export default App;
