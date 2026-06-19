import React, { useState } from 'react';
import storage from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  updateApiKey,
  setSandboxMode,
  userProfile,
  fetchUserProfile
}) {
  const [localKeys, setLocalKeys] = useState({ ...settings.keys });
  const [localSandbox, setLocalSandbox] = useState(settings.sandboxMode);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Auth States
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  if (!isOpen) return null;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isSimulationMode = !supabaseUrl || !supabaseAnonKey;

  const handleKeyChange = (provider, value) => {
    setLocalKeys(prev => ({ ...prev, [provider]: value }));
  };

  const handleSaveKeys = () => {
    updateApiKey('oracle', localKeys.oracle);
    updateApiKey('titan', localKeys.titan);
    updateApiKey('ancient', localKeys.ancient);
    setSandboxMode(localSandbox);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 1200);
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Please fill out all fields.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (isSimulationMode) {
      // Simulation Mode Auth
      setTimeout(() => {
        const mockToken = `mock-jwt-token-for-${email}`;
        storage.set('supabase_session_token', mockToken);
        storage.set('shattered_email', email);
        
        const username = email.split('@')[0];
        storage.set('shattered_username', username);

        // Fetch or create profile locally
        const mockProfile = storage.get(`mock_supabase_profile_${email}`, {
          id: 'mock-uuid-' + Math.random().toString(36).substring(2, 9),
          email: email,
          energy_balance: 100,
          subscription_tier: 'free',
          subscription_status: 'none'
        });
        storage.set(`mock_supabase_profile_${email}`, mockProfile);

        setAuthLoading(false);
        setAuthSuccess(authTab === 'login' ? "Logged in successfully (Simulated)!" : "Account created and logged in (Simulated)!");
        
        // Dispatch custom update event
        window.dispatchEvent(new Event('shattered_auth_update'));
        
        setTimeout(() => {
          setAuthSuccess(null);
          setEmail('');
          setPassword('');
        }, 1500);
      }, 800);
    } else {
      // Real Supabase Auth via REST
      try {
        let authEndpoint = '';
        let body = {};
        if (authTab === 'login') {
          authEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=password`;
          body = { email, password };
        } else {
          authEndpoint = `${supabaseUrl}/auth/v1/signup`;
          body = { email, password };
        }

        const res = await fetch(authEndpoint, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error_description || errData.message || `Auth failed with status ${res.status}`);
        }

        const data = await res.json();
        const token = data.access_token;
        if (!token) {
          throw new Error("Unable to obtain access token from response.");
        }

        storage.set('supabase_session_token', token);
        storage.set('shattered_email', email);
        const username = email.split('@')[0];
        storage.set('shattered_username', username);

        setAuthLoading(false);
        setAuthSuccess(authTab === 'login' ? "Logged in successfully!" : "Account created successfully! Please verify your email if required.");
        
        // Dispatch custom update event
        window.dispatchEvent(new Event('shattered_auth_update'));

        setTimeout(() => {
          setAuthSuccess(null);
          setEmail('');
          setPassword('');
        }, 1500);
      } catch (err) {
        setAuthLoading(false);
        setAuthError(err.message);
      }
    }
  };

  const handleSignOut = () => {
    storage.remove('supabase_session_token');
    storage.remove('shattered_email');
    storage.remove('shattered_username');
    window.dispatchEvent(new Event('shattered_auth_update'));
    onClose();
  };

  // Turn Recharge & Tier Upgrade Simulation
  const handleSimulatePurchase = (turns) => {
    if (!userProfile) return;
    const email = storage.get('shattered_email') || 'adventurer@saga.com';
    const profile = storage.get(`mock_supabase_profile_${email}`, null);
    if (profile) {
      profile.energy_balance += turns;
      storage.set(`mock_supabase_profile_${email}`, profile);
      // Notify update
      window.dispatchEvent(new Event('shattered_auth_update'));
    }
  };

  const handleSimulateUpgrade = (tier) => {
    if (!userProfile) return;
    const email = storage.get('shattered_email') || 'adventurer@saga.com';
    const profile = storage.get(`mock_supabase_profile_${email}`, null);
    if (profile) {
      profile.subscription_tier = tier;
      profile.subscription_status = 'active';
      if (tier === 'adventurer') profile.energy_balance += 1500;
      if (tier === 'legend') profile.energy_balance += 5000;
      storage.set(`mock_supabase_profile_${email}`, profile);
      // Notify update
      window.dispatchEvent(new Event('shattered_auth_update'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-lg border border-amber-500/30 bg-slate-900 p-6 shadow-2xl shadow-amber-500/10 relative text-left">
        
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-amber-500 to-emerald-500 rounded-t-lg" />
        
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
          <h2 className="text-2xl font-bold text-amber-400 font-serif tracking-wide">
            Settings & Account
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* --- SECTION 1: SECURE ACCOUNT / DATABASE MODE --- */}
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
            Secure Serverless Account
          </h3>

          {userProfile ? (
            /* Logged In Info */
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-4xs text-slate-500 uppercase tracking-widest block font-bold">Email Address</span>
                  <span className="text-sm font-semibold text-slate-200">{userProfile.email}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-4xs font-extrabold uppercase bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                  Secure Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
                <div>
                  <span className="text-4xs text-slate-500 uppercase tracking-widest block font-bold">Turn Balance</span>
                  <span className="text-lg font-extrabold text-amber-450">{userProfile.energy_balance} Turns</span>
                </div>
                <div>
                  <span className="text-4xs text-slate-500 uppercase tracking-widest block font-bold">Subscription Tier</span>
                  <span className="text-sm font-bold text-slate-350 capitalize">
                    {userProfile.subscription_tier} 
                    {userProfile.subscription_status === 'active' && ' (Active)'}
                  </span>
                </div>
              </div>

              {isSimulationMode && (
                <div className="border-t border-dashed border-slate-900 pt-3 space-y-2">
                  <p className="text-4xs text-slate-500 uppercase tracking-widest font-bold">Simulation Controls</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSimulatePurchase(200)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-3xs font-semibold cursor-pointer border border-slate-800"
                    >
                      Buy 200 Turns ($1)
                    </button>
                    <button
                      onClick={() => handleSimulatePurchase(1500)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-3xs font-semibold cursor-pointer border border-slate-800"
                    >
                      Buy 1500 Turns ($5)
                    </button>
                    <button
                      onClick={() => handleSimulateUpgrade('adventurer')}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-3xs font-semibold cursor-pointer border border-amber-500/20"
                    >
                      Subscribe Adventurer ($9.99/mo)
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded bg-rose-950/20 border border-rose-500/20 hover:bg-rose-950/50 hover:border-rose-500 text-rose-400 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                >
                  Sign Out Account
                </button>
              </div>
            </div>
          ) : (
            /* Auth Forms */
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-850/80 space-y-4">
              <div className="flex border-b border-slate-900">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 pb-2 text-center text-xs uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    authTab === 'login' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 pb-2 text-center text-xs uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    authTab === 'register' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3 pt-1">
                {authError && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    {authSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-4xs uppercase tracking-widest text-slate-500 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-amber-500 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-4xs uppercase tracking-widest text-slate-500 font-bold mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-amber-500 text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-99 transition-all cursor-pointer disabled:opacity-40"
                >
                  {authLoading ? 'Authorizing...' : authTab === 'login' ? 'Sign In to Account' : 'Create Chronicle Account'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* --- SECTION 2: SANDBOX PLAYGROUND TOGGLE --- */}
        <div className="mb-6 p-4 rounded-lg bg-slate-950 border border-slate-850/80 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-amber-300 text-xs">Sandbox Playground Mode</h3>
            <p className="text-3xs text-slate-500 mt-1">Play instantly with keyless local mock narratives, bypassing the proxy and balance checks.</p>
          </div>
          <button
            onClick={() => {
              const val = !localSandbox;
              setLocalSandbox(val);
              setSandboxMode(val);
            }}
            className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
              localSandbox ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-200 ${
              localSandbox ? 'translate-x-7' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* --- SECTION 3: ADVANCED BYOK CONFIGS (ACCORDION) --- */}
        <div className="border-t border-slate-850 pt-4 mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex justify-between items-center text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest cursor-pointer"
          >
            <span>Advanced: Custom API Keys (BYOK)</span>
            <span className="text-sm font-bold transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none' }}>
              ▶
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 rounded-lg bg-slate-950 border border-slate-850/60 animate-fadeIn">
              <p className="text-3xs text-slate-400 leading-normal">
                If Sandbox mode is disabled and you do not wish to authenticate using a Supabase account, you can supply your own API keys. Call direct AI Game Master endpoints securely from your browser.
              </p>

              {/* Gemini key */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-3xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Google Gemini Key (The Oracle)
                  </label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-4xs text-amber-500/70 hover:text-amber-400 hover:underline"
                  >
                    Get Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="Paste Gemini API Key..."
                  value={localKeys.oracle}
                  onChange={(e) => handleKeyChange('oracle', e.target.value)}
                  disabled={localSandbox}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-emerald-500 text-slate-200 disabled:opacity-40"
                />
              </div>

              {/* Groq key */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-3xs font-semibold text-amber-400 uppercase tracking-wider">
                    Groq Key (The Titan)
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-4xs text-amber-500/70 hover:text-amber-400 hover:underline"
                  >
                    Get Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="Paste Groq API Key..."
                  value={localKeys.titan}
                  onChange={(e) => handleKeyChange('titan', e.target.value)}
                  disabled={localSandbox}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-amber-500 text-slate-200 disabled:opacity-40"
                />
              </div>

              {/* Cerebras key */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-3xs font-semibold text-purple-400 uppercase tracking-wider">
                    Cerebras Key (The Ancient)
                  </label>
                  <a
                    href="https://cloud.cerebras.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-4xs text-amber-500/70 hover:text-amber-400 hover:underline"
                  >
                    Get Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="Paste Cerebras API Key..."
                  value={localKeys.ancient}
                  onChange={(e) => handleKeyChange('ancient', e.target.value)}
                  disabled={localSandbox}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-purple-500 text-slate-200 disabled:opacity-40"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveKeys}
                className={`w-full py-2 rounded text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  isSaved ? 'bg-emerald-500 font-extrabold' : 'bg-slate-300 hover:bg-white active:scale-99'
                }`}
              >
                {isSaved ? 'API Keys Saved!' : 'Save Direct API Keys'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded text-slate-300 hover:text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
