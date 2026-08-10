import { useState, useEffect } from 'react';
import storage from '../utils/storage';
import { startCheckout, fetchBillingStatus } from '../utils/authApi';

export default function AccountScreen({
  onBack,
  settings,
  setByokProvider,
  setByokModel,
  setByokKey,
  setEngineTier,
  setSandboxMode,
  onLogout,
  isLoggedIn,
  userProfile,
  fetchUserProfile,
  gems,
}) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  // BYOK States
  const [selectedProvider, setSelectedProvider] = useState(settings.byokProvider || 'gemini');
  const [selectedModel, setSelectedModel] = useState(settings.byokModel || 'gemini-1.5-flash');
  const [localKeys, setLocalKeys] = useState({
    gemini: settings.byokKeys?.gemini || '',
    openai: settings.byokKeys?.openai || '',
    anthropic: settings.byokKeys?.anthropic || '',
  });

  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  // Whether Stripe is configured server-side. Purchase buttons stay visible but
  // explain themselves rather than silently doing nothing when it's off.
  const [billingEnabled, setBillingEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchBillingStatus().then((s) => {
      if (!cancelled) setBillingEnabled(!!s.enabled);
    });
    return () => { cancelled = true; };
  }, []);

  // Stripe redirects back with ?billing=success|cancelled. The entitlement is
  // granted by the webhook, not here — this only refreshes the displayed profile
  // (with a short retry, since the webhook may land a moment after the redirect).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get('billing');
    if (!outcome) return;
    window.history.replaceState(null, '', window.location.pathname);
    if (outcome === 'success') {
      setPurchaseSuccess('Payment received — applying it to your account…');
      let tries = 0;
      const poll = setInterval(() => {
        tries += 1;
        fetchUserProfile();
        if (tries >= 5) {
          clearInterval(poll);
          setPurchaseSuccess('Purchase complete. If your balance looks unchanged, refresh in a moment.');
          setTimeout(() => setPurchaseSuccess(null), 6000);
        }
      }, 2000);
      return () => clearInterval(poll);
    }
    if (outcome === 'cancelled') {
      setPurchaseSuccess(null);
    }
  }, []);
  
  // Sponsored Video Ad States
  const [videoAdOpen, setVideoAdOpen] = useState(false);
  const [videoAdSeconds, setVideoAdSeconds] = useState(15);
  const [videoAdMuted, setVideoAdMuted] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isSimulationMode = !supabaseUrl || !supabaseAnonKey;

  // Track key values in state when settings update
  useEffect(() => {
    if (settings.byokKeys) {
      setLocalKeys({
        gemini: settings.byokKeys.gemini || '',
        openai: settings.byokKeys.openai || '',
        anthropic: settings.byokKeys.anthropic || '',
      });
    }
    if (settings.byokProvider) setSelectedProvider(settings.byokProvider);
    if (settings.byokModel) setSelectedModel(settings.byokModel);
  }, [settings]);

  // Handle Provider-specific model defaults
  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    if (provider === 'gemini') setSelectedModel('gemini-1.5-flash');
    else if (provider === 'openai') setSelectedModel('gpt-4o-mini');
    else if (provider === 'anthropic') setSelectedModel('claude-3-5-sonnet-20240620');
  };

  const handleKeySave = () => {
    const keyVal = localKeys[selectedProvider]?.trim() || '';
    setByokProvider(selectedProvider);
    setByokModel(selectedModel);
    setByokKey(selectedProvider, keyVal);

    // Saving a key also ACTIVATES live BYOK play: switch the engine to BYOK and turn
    // off the offline Sandbox demo. Without this, the key is stored but never used.
    if (keyVal) {
      if (setEngineTier) setEngineTier('byok');
      if (setSandboxMode) setSandboxMode(false);
      setTestResult({ success: true, message: `${selectedProvider.toUpperCase()} key saved and activated. You are now playing LIVE with ${selectedModel} — Sandbox demo is off.` });
    } else {
      setTestResult({ success: false, message: `Enter an API key to play live. No key was saved for ${selectedProvider.toUpperCase()}.` });
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  // Enter offline Sandbox (demo) mode — no API calls, canned narration.
  const handleEnterSandbox = () => {
    if (setSandboxMode) setSandboxMode(true);
    setTestResult({ success: true, message: 'Sandbox (offline demo) mode is ON. Turn it off by saving a valid API key above.' });
    setTimeout(() => setTestResult(null), 5000);
  };

  // Resume live BYOK play using a previously-saved key (without re-entering it).
  const handleGoLive = () => {
    const activeProv = settings?.byokProvider || selectedProvider;
    const savedKey = (settings?.byokKeys?.[activeProv] || '').trim();
    if (!savedKey) {
      setTestResult({ success: false, message: 'No saved API key found. Enter a key above and press Save Settings to play live.' });
      setTimeout(() => setTestResult(null), 5000);
      return;
    }
    if (setEngineTier) setEngineTier('byok');
    if (setSandboxMode) setSandboxMode(false);
    setTestResult({ success: true, message: `Live play resumed with your saved ${activeProv.toUpperCase()} key. Sandbox demo is off.` });
    setTimeout(() => setTestResult(null), 5000);
  };

  // Current engine mode for display.
  const engineMode = settings?.sandboxMode
    ? 'sandbox'
    : (settings?.engineTier === 'byok' ? 'byok' : (settings?.engineTier || 'free'));

  const handleTestKey = async () => {
    const keyToTest = localKeys[selectedProvider]?.trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Please enter a key for the active provider first.' });
      return;
    }
    setTestingKey(true);
    setTestResult(null);
    try {
      let response;
      if (selectedProvider === 'gemini') {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToTest}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hello' }] }]
            })
          }
        );
      } else if (selectedProvider === 'openai') {
        response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${keyToTest}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: 'Hello' }],
              max_tokens: 5
            })
          }
        );
      } else if (selectedProvider === 'anthropic') {
        response = await fetch(
          'https://api.anthropic.com/v1/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': keyToTest,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              messages: [{ role: 'user', content: 'Hello' }],
              max_tokens: 5
            })
          }
        );
      }
      
      if (response && response.ok) {
        setTestResult({ success: true, message: `API Key is valid! Direct connection to ${selectedProvider.toUpperCase()} successful.` });
      } else {
        const err = await response.json().catch(() => ({}));
        setTestResult({
          success: false,
          message: err.error?.message || `Failed with status code ${response ? response.status : 'unknown'}`
        });
      }
    } catch {
      setTestResult({ success: false, message: `Network error connecting to ${selectedProvider.toUpperCase()} API.` });
    } finally {
      setTestingKey(false);
    }
  };

  // Real Stripe Checkout. This used to be a setTimeout writing a localStorage
  // mock profile — which since the Better Auth migration granted nothing at all,
  // because the tier is read from D1. Entitlements are now applied server-side
  // from Stripe's signed webhook after payment actually succeeds.
  const handleUpgradeSubscription = async (tier) => {
    if (!userProfile) {
      alert('Please register or sign in to upgrade your subscription.');
      return;
    }
    if (!billingEnabled) {
      alert('Payments are not available yet. Please check back soon.');
      return;
    }
    setPurchaseLoading(`sub_${tier}`);
    setPurchaseSuccess(null);
    try {
      // Redirects to Stripe; nothing after this runs on success.
      await startCheckout({ plan: tier, cycle: billingCycle });
    } catch (err) {
      setPurchaseLoading(null);
      alert(err.message || 'Could not start checkout. Please try again.');
    }
  };

  // One-off packs (turn refills, gem bundles).
  const handleBuyPack = async (pack) => {
    if (!userProfile) {
      alert('Please register or sign in to make a purchase.');
      return;
    }
    if (!billingEnabled) {
      alert('Payments are not available yet. Please check back soon.');
      return;
    }
    setPurchaseLoading(pack);
    setPurchaseSuccess(null);
    try {
      await startCheckout({ pack });
    } catch (err) {
      setPurchaseLoading(null);
      alert(err.message || 'Could not start checkout. Please try again.');
    }
  };

  // Video Ad Timer Effect
  useEffect(() => {
    let interval = null;
    if (videoAdOpen && videoAdSeconds > 0) {
      interval = setInterval(() => {
        setVideoAdSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoAdOpen, videoAdSeconds]);

  const handleStartVideoAd = () => {
    setVideoAdSeconds(15);
    setVideoAdOpen(true);
  };

  const handleClaimAdReward = () => {
    const email = storage.get('shattered_email') || 'adventurer@saga.com';
    if (isSimulationMode) {
      const profile = storage.get(`mock_supabase_profile_${email}`, null);
      if (profile) {
        profile.energy_balance = (profile.energy_balance || 0) + 10;
        storage.set(`mock_supabase_profile_${email}`, profile);
      }
    }
    setPurchaseSuccess("Sponsored ad viewed successfully! Added +10 priority Turns.");
    fetchUserProfile();
    setVideoAdOpen(false);
    setTimeout(() => setPurchaseSuccess(null), 4000);
  };

  const currentTier = userProfile?.subscription_tier || 'free';

  return (
    <div className="flex-1 flex flex-col justify-start p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-4xs font-bold text-slate-400 hover:text-amber-400 cursor-pointer transition-colors"
          >
            ← Return
          </button>
          <div>
            <h1 className="font-extrabold text-amber-400 text-3xl font-serif tracking-wide">CHRONICLE ACCOUNT</h1>
            <p className="text-slate-400 mt-0.5 uppercase tracking-widest font-semibold text-3xs">
              Manage Credits, Subscriptions, and API Connections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded bg-slate-950 border border-slate-850 flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-amber-450">💎 {gems}</span>
            <span className="text-slate-400 uppercase text-3xs font-bold">Gems</span>
          </div>
          {userProfile && (
            <div className="px-3 py-1.5 rounded bg-slate-950 border border-slate-850 flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-emerald-450">⚡ {userProfile.energy_balance || 0}</span>
              <span className="text-slate-400 uppercase text-3xs font-bold">Turns</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card & API Config */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Profile Overview Card */}
          <div className="rounded-lg bg-slate-900 border border-slate-800/80 p-5 relative shadow-xl shadow-black/20 text-left">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-violet-500 to-amber-500 rounded-t-lg" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Profile</h3>
            
            {userProfile ? (
              <div className="space-y-4">
                <div>
                  <span className="text-4xs text-slate-500 uppercase tracking-widest font-bold block">User Email</span>
                  <span className="text-sm font-semibold text-slate-200">{userProfile.email}</span>
                </div>
                <div>
                  <span className="text-4xs text-slate-500 uppercase tracking-widest font-bold block">Sync Status</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-4xs font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                    🟢 {isSimulationMode ? 'Local Simulation' : 'Supabase Sync'}
                  </span>
                </div>
                <div>
                  <span className="text-4xs text-slate-500 uppercase tracking-widest font-bold block">Account Status</span>
                  <span className="text-xs text-slate-350 capitalize font-medium">{currentTier} Tier</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-4">No account active. Playing under offline Sandbox profile.</p>
                <div className="text-xs text-amber-400 font-semibold p-2.5 rounded bg-amber-500/5 border border-amber-500/10">
                  Open Settings Gear in top right to Sign In/Register.
                </div>
              </div>
            )}

            {(isLoggedIn || userProfile) && onLogout && (
              <button
                onClick={() => {
                  if (window.confirm('Log out of this account? Your local character saves stay on this device.')) {
                    onLogout();
                    if (onBack) onBack();
                  }
                }}
                className="mt-4 w-full py-2 rounded bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-bold text-3xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                ⎋ Log Out
              </button>
            )}
          </div>

          {/* Multi-Provider BYOK Settings Card */}
          <div className="rounded-lg bg-slate-900 border border-slate-800/80 p-5 relative shadow-xl shadow-black/20 text-left">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-t-lg" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">BYOK Connection</h3>
            <p className="text-4xs text-slate-500 leading-relaxed mb-4">
              Bring your own API keys. Configure providers and models to direct narrative completion.
            </p>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-5xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Provider
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['gemini', 'openai', 'anthropic'].map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => handleProviderChange(prov)}
                      className={`py-1 rounded text-5xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                        selectedProvider === prov
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-5xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Active Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-850 text-slate-200 text-4xs font-bold focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  {selectedProvider === 'gemini' && (
                    <>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Economic)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Rich Narrative)</option>
                    </>
                  )}
                  {selectedProvider === 'openai' && (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (Speed & Performance)</option>
                      <option value="gpt-4o">gpt-4o (Premium IQ)</option>
                    </>
                  )}
                  {selectedProvider === 'anthropic' && (
                    <>
                      <option value="claude-3-5-sonnet-20240620">claude-3-5-sonnet (Superb Roleplay)</option>
                      <option value="claude-3-haiku-20240307">claude-3-haiku (Snappy Dialogues)</option>
                    </>
                  )}
                </select>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-5xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                  {selectedProvider.toUpperCase()} API Key
                </label>
                <input
                  type="password"
                  value={localKeys[selectedProvider] || ''}
                  onChange={(e) => setLocalKeys({ ...localKeys, [selectedProvider]: e.target.value })}
                  placeholder={
                    selectedProvider === 'gemini' ? 'AIzaSy...' :
                    selectedProvider === 'openai' ? 'sk-proj-...' : 'sk-ant-...'
                  }
                  className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-amber-500/60 text-xs font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleKeySave}
                  className="flex-1 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-3xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save settings
                </button>
                <button
                  onClick={handleTestKey}
                  disabled={testingKey}
                  className="flex-1 py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold text-3xs uppercase border border-slate-800 tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                >
                  {testingKey ? 'Testing...' : 'Test API'}
                </button>
              </div>

              {selectedProvider === 'gemini' && (
                <div className="pt-0.5">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-5xs text-slate-400 hover:text-amber-400 font-bold uppercase tracking-wider transition-colors"
                  >
                    Get free Gemini Key ↗
                  </a>
                </div>
              )}

              {testResult && (
                <div className={`p-2.5 rounded text-4xs font-medium border leading-relaxed ${
                  testResult.success
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/5 border-rose-500/20 text-rose-450'
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Engine Mode Card — shows/controls whether the game plays LIVE or in the offline Sandbox demo */}
          <div className="rounded-lg bg-slate-900 border border-slate-800/80 p-5 relative shadow-xl shadow-black/20 text-left">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-t-lg" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Engine Mode</h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-4xs text-slate-500 uppercase tracking-widest font-bold">Currently</span>
              {engineMode === 'sandbox' ? (
                <span className="px-2 py-0.5 rounded text-4xs font-extrabold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/25">
                  🟠 Sandbox · Offline Demo
                </span>
              ) : engineMode === 'byok' ? (
                <span className="px-2 py-0.5 rounded text-4xs font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  🟢 Live · BYOK
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-4xs font-extrabold uppercase bg-violet-500/10 text-violet-300 border border-violet-500/25">
                  🟣 {engineMode}
                </span>
              )}
            </div>

            <p className="text-4xs text-slate-500 leading-relaxed mb-4">
              {engineMode === 'sandbox'
                ? 'Sandbox uses canned offline narration and never calls an API. Save a valid API key above to play for real.'
                : 'Live play sends your turns to your configured provider. Switch to Sandbox any time to test offline.'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGoLive}
                disabled={engineMode === 'byok'}
                className="py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-3xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                ▶ Play Live
              </button>
              <button
                onClick={handleEnterSandbox}
                disabled={engineMode === 'sandbox'}
                className="py-1.5 rounded bg-slate-950 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-bold text-3xs uppercase border border-slate-800 tracking-wider transition-colors cursor-pointer"
              >
                ◼ Sandbox
              </button>
            </div>
          </div>

        </div>

        {/* Right Columns: Subscription Tiers & Store */}
        <div className="md:col-span-2 space-y-6 text-left">
          
          {purchaseSuccess && (
            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-pulse">
              🎉 {purchaseSuccess}
            </div>
          )}

          {/* Subscriptions section */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Subscription covenants</h2>
            
            {/* Billing cycle toggle */}
            <div className="flex items-center justify-between mb-4 bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
              <div>
                <span className="text-xs font-bold text-slate-200 block uppercase tracking-wide">Billing frequency</span>
                <span className="text-5xs text-slate-450 block uppercase mt-0.5">Commit yearly to save up to 33% on credits</span>
              </div>
              <div className="flex bg-slate-950 p-0.5 rounded border border-slate-850">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded text-5xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1 rounded text-5xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Yearly (Save)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tier 1: Free */}
              <div className={`rounded-lg p-4 border flex flex-col justify-between ${
                currentTier === 'free'
                  ? 'bg-slate-900 border-slate-700 shadow shadow-slate-900'
                  : 'bg-slate-905/30 border-slate-900/60 opacity-60 hover:opacity-100'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Free Tier</h4>
                    <span className="text-4xs font-extrabold uppercase bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      $0
                    </span>
                  </div>
                  <p className="text-4xs text-slate-450 leading-relaxed mb-3">
                    Play using the Free Connection engine (Flash). Supported by responsive banner ads on the side panels.
                  </p>
                  <ul className="text-5xs text-slate-400 space-y-1 mb-4">
                    <li>• Capped 8-turn conversation context history</li>
                    <li>• Dynamic Regional Memory filtering</li>
                    <li>• Sponsored video ad refills available (+10 turns)</li>
                  </ul>
                </div>
                {currentTier === 'free' ? (
                  <div className="w-full text-center py-1 bg-slate-950 rounded text-4xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Covenant
                  </div>
                ) : (
                  <button 
                    onClick={() => handleUpgradeSubscription('free', 0)}
                    disabled={purchaseLoading !== null}
                    className="w-full py-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 font-bold text-4xs uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Downgrade
                  </button>
                )}
              </div>

              {/* Tier 2: Supporter BYOK */}
              <div className={`rounded-lg p-4 border flex flex-col justify-between relative overflow-hidden ${
                currentTier === 'supporter'
                  ? 'bg-slate-900 border-amber-500/50 shadow shadow-amber-500/10'
                  : 'bg-slate-905/30 border-slate-900/60 opacity-85 hover:opacity-100 hover:border-slate-800/80'
              }`}>
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-5xs uppercase tracking-widest rounded-bl">
                  POPULAR
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-serif">BYOK Supporter</h4>
                    <span className="text-4xs font-extrabold uppercase bg-amber-950/40 border border-amber-500/25 text-amber-450 px-1.5 py-0.5 rounded animate-pulse">
                      {billingCycle === 'monthly' ? '$1.00/mo' : '$9.99/yr'}
                    </span>
                  </div>
                  <p className="text-4xs text-slate-450 leading-relaxed mb-3">
                    Unlock the **BYOK Sandbox Connection**. Bring your own API keys for unlimited plays with zero side-panel ads.
                  </p>
                  <ul className="text-5xs text-slate-400 space-y-1 mb-4">
                    <li>• Configure Gemini, OpenAI, or Anthropic custom models</li>
                    <li>• Expanded 25-turn narrative history buffer</li>
                    <li>• 100% ad-free exploration gameplay</li>
                  </ul>
                </div>
                {currentTier === 'supporter' ? (
                  <div className="w-full text-center py-1 bg-amber-500/10 rounded border border-amber-500/20 text-4xs font-bold text-amber-400 uppercase tracking-wider">
                    Active Covenant
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgradeSubscription('supporter', billingCycle === 'monthly' ? 1 : 9.99)}
                    disabled={purchaseLoading !== null}
                    className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-4xs uppercase tracking-wider cursor-pointer transition-all hover:scale-101"
                  >
                    {purchaseLoading === 'sub_supporter' ? 'Upgrading...' : `Subscribe (${billingCycle === 'monthly' ? '$1.00/mo' : '$9.99/yr'})`}
                  </button>
                )}
              </div>

              {/* Tier 3: Heroic Adventurer */}
              <div className={`rounded-lg p-4 border flex flex-col justify-between ${
                currentTier === 'adventurer'
                  ? 'bg-slate-900 border-violet-500/50 shadow shadow-violet-500/10'
                  : 'bg-slate-905/30 border-slate-900/60 opacity-60 hover:opacity-100 hover:border-slate-800/80'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 font-serif">Heroic Adventurer</h4>
                    <span className="text-4xs font-extrabold uppercase bg-violet-950/40 border border-violet-500/25 text-violet-450 px-1.5 py-0.5 rounded">
                      {billingCycle === 'monthly' ? '$4.99/mo' : '$39.99/yr'}
                    </span>
                  </div>
                  <p className="text-4xs text-slate-450 leading-relaxed mb-3">
                    Unlock Premium Engine (Pro model narrative quality) with monthly priority reserves and unlimited ad-free Flash play!
                  </p>
                  <ul className="text-5xs text-slate-400 space-y-1 mb-4">
                    <li>• **{billingCycle === 'monthly' ? '200' : '2,400'} priority Pro turns** immediately</li>
                    <li>• Unlimited ad-free Free Engine (Flash) play turns</li>
                    <li>• Expanded 25-turn history context buffer</li>
                  </ul>
                </div>
                {currentTier === 'adventurer' ? (
                  <div className="w-full text-center py-1 bg-violet-500/10 rounded border border-violet-500/20 text-4xs font-bold text-violet-400 uppercase tracking-wider">
                    Active Covenant
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgradeSubscription('adventurer', billingCycle === 'monthly' ? 4.99 : 39.99)}
                    disabled={purchaseLoading !== null}
                    className="w-full py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold text-4xs uppercase tracking-wider cursor-pointer transition-all hover:scale-101"
                  >
                    {purchaseLoading === 'sub_adventurer' ? 'Upgrading...' : `Subscribe (${billingCycle === 'monthly' ? '$4.99/mo' : '$39.99/yr'})`}
                  </button>
                )}
              </div>

              {/* Tier 4: Legendary Hero */}
              <div className={`rounded-lg p-4 border flex flex-col justify-between ${
                currentTier === 'legend'
                  ? 'bg-slate-900 border-emerald-500/50 shadow shadow-emerald-500/10'
                  : 'bg-slate-905/30 border-slate-900/60 opacity-60 hover:opacity-100 hover:border-slate-800/80'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-450 font-serif">Legendary Hero</h4>
                    <span className="text-4xs font-extrabold uppercase bg-emerald-950/40 border border-emerald-500/25 text-emerald-450 px-1.5 py-0.5 rounded">
                      {billingCycle === 'monthly' ? '$15.00/mo' : '$119.99/yr'}
                    </span>
                  </div>
                  <p className="text-4xs text-slate-450 leading-relaxed mb-3">
                    Maximum narrative priority. The ultimate subscription for heavy dungeon-crawlers and legendary storytellers.
                  </p>
                  <ul className="text-5xs text-slate-400 space-y-1 mb-4">
                    <li>• **{billingCycle === 'monthly' ? '650' : '7,800'} priority Pro turns** immediately</li>
                    <li>• Unlimited ad-free Free Engine (Flash) play turns</li>
                    <li>• Expanded 25-turn history context buffer</li>
                  </ul>
                </div>
                {currentTier === 'legend' ? (
                  <div className="w-full text-center py-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-4xs font-bold text-emerald-400 uppercase tracking-wider">
                    Active Covenant
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgradeSubscription('legend', billingCycle === 'monthly' ? 15.00 : 119.99)}
                    disabled={purchaseLoading !== null}
                    className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-4xs uppercase tracking-wider cursor-pointer transition-all hover:scale-101"
                  >
                    {purchaseLoading === 'sub_legend' ? 'Upgrading...' : `Subscribe (${billingCycle === 'monthly' ? '$15.00/mo' : '$119.99/yr'})`}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Credits Store */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Energy, Gems & Ad-Refills</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Sponsored Video Refill (FREE Energy) */}
              <div className="rounded-lg p-4 bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-5xs uppercase tracking-widest rounded-bl">
                  FREE ENERGY
                </div>
                <div>
                  <span className="text-xl">📺</span>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-2">Sponsored Video Refill</h4>
                  <p className="text-5xs text-slate-450 mt-1 mb-3">
                    Watch a short 15-second video ad to claim **+10 priority Turns** for free. Guaranteed profit for game servers.
                  </p>
                </div>
                <button
                  onClick={handleStartVideoAd}
                  disabled={purchaseLoading !== null}
                  className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-4xs uppercase tracking-wider cursor-pointer transition-all hover:scale-101"
                >
                  Watch Sponsored Ad
                </button>
              </div>

              {/* Turn Energy Package */}
              <div className="rounded-lg p-4 bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-xl">⚡</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">200 Priority Turns</h4>
                  <p className="text-5xs text-slate-500 mt-1 mb-3">Instantly inject 200 premium priority turns to play without any cooldowns.</p>
                </div>
                <button
                  onClick={() => handleBuyPack('turns_200')}
                  disabled={purchaseLoading !== null}
                  className="w-full py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-amber-450 border border-slate-800 font-bold text-4xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {purchaseLoading === 'turns_200' ? 'Refilling...' : 'Buy for $1.00'}
                </button>
              </div>

              {/* Large Turn Refill */}
              <div className="rounded-lg p-4 bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-xl">⚡⚡</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">1,500 Priority Turns</h4>
                  <p className="text-5xs text-slate-500 mt-1 mb-3">High capacity refill for long epic stories. Yields a 30% discount.</p>
                </div>
                <button
                  onClick={() => handleBuyPack('turns_1500')}
                  disabled={purchaseLoading !== null}
                  className="w-full py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-amber-450 border border-slate-800 font-bold text-4xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {purchaseLoading === 'turns_1500' ? 'Refilling...' : 'Buy for $5.00'}
                </button>
              </div>

              {/* Gems Package */}
              <div className="rounded-lg p-4 bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-xl">💎</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-2">15 Chronicle Gems</h4>
                  <p className="text-5xs text-slate-500 mt-1 mb-3">Add 15 gems to buy character customization slots or unlock special achievements.</p>
                </div>
                <button
                  onClick={() => handleBuyPack('gems_15')}
                  disabled={purchaseLoading !== null}
                  className="w-full py-1.5 rounded bg-slate-950 hover:bg-slate-850 text-amber-450 border border-slate-800 font-bold text-4xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {purchaseLoading === 'gems_15' ? 'Adding...' : 'Buy for $3.00'}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Simulated Sponsored Video Ad Overlay */}
      {videoAdOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Ad Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-850">
              <span className="text-5xs font-bold text-amber-400 tracking-wider uppercase">Sponsored Video Ad</span>
              <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-5xs font-bold text-slate-400 uppercase">
                {videoAdSeconds > 0 ? `Ad plays for: ${videoAdSeconds}s` : 'Reward Ready!'}
              </span>
            </div>

            {/* Video Player Display Container */}
            <div className="w-full aspect-video bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden group">
              
              {/* Simulated Gameplay Demo Video Loop in Background */}
              <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-indigo-950 via-slate-950 to-amber-950 flex flex-col justify-between p-4 text-left">
                <div className="space-y-1">
                  <h5 className="font-serif text-amber-400 text-xs font-bold tracking-wide">⚔️ SHATTERED SAGA: ONLINE ⚔️</h5>
                  <p className="text-5xs text-slate-400 uppercase tracking-widest">Pre-Register Now on App Store & Google Play</p>
                </div>
                <div className="h-0.5 bg-slate-800 w-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 absolute left-0 top-0 transition-all duration-1000 ease-linear"
                    style={{ width: `${((15 - videoAdSeconds) / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Large Central Pulsing Commercial Icon */}
              <div className="z-10 flex flex-col items-center gap-2">
                <span className="text-3xl animate-bounce">🎬</span>
                <span className="text-4xs text-amber-400 font-extrabold uppercase tracking-widest text-center max-w-xs leading-relaxed">
                  {videoAdSeconds > 0 
                    ? "Evaluating epic high-fantasy dungeon crawl trailer..." 
                    : "Transmission Complete! Claim your 10 energy turns below."}
                </span>
                {videoAdSeconds > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping animation-delay-300" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping animation-delay-600" />
                  </div>
                )}
              </div>

              {/* Volume / Mute Control bottom right */}
              <button
                onClick={() => setVideoAdMuted(!videoAdMuted)}
                className="absolute bottom-3 right-3 p-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-3xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                {videoAdMuted ? '🔇 Muted' : '🔊 Playing'}
              </button>
            </div>

            {/* Ad Footer Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex justify-between items-center gap-4">
              <span className="text-5xs text-slate-500 uppercase font-semibold leading-normal max-w-xs text-left">
                Revenue generated from this sponsor compensates AI server costs directly. Thank you for supporting Shattered Saga!
              </span>
              
              {videoAdSeconds > 0 ? (
                <button
                  disabled
                  className="px-4 py-2 bg-slate-850 border border-slate-800 rounded font-bold text-4xs uppercase tracking-wider text-slate-600 cursor-not-allowed"
                >
                  Locked ({videoAdSeconds}s)
                </button>
              ) : (
                <button
                  onClick={handleClaimAdReward}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-4xs uppercase tracking-widest rounded shadow-lg shadow-amber-500/20 transition-all hover:scale-103 cursor-pointer"
                >
                  Claim 10 Turns
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
