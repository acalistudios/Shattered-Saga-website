// Better Auth backend client (Cloudflare Worker). Uses direct fetch + a stored
// bearer session token — no cross-origin cookies needed.
//
// Gated by VITE_API_URL: when unset, `isBackendConfigured` is false and the app
// keeps its existing (simulation/mock) auth so the deployed site is unaffected
// until the worker is live.
import storage from './storage';

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const isBackendConfigured = !!API_URL;

const TOKEN_KEY = 'sa_session_token';

export const getToken = () => storage.get(TOKEN_KEY) || null;
export const setToken = (t) => (t ? storage.set(TOKEN_KEY, t) : storage.remove(TOKEN_KEY));
export const clearToken = () => storage.remove(TOKEN_KEY);

async function post(path, body, useAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (useAuth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function signUpEmail(email, password, name) {
  const data = await post('/api/auth/sign-up/email', {
    email,
    password,
    name: name || email.split('@')[0],
  });
  if (data.token) setToken(data.token);
  return data;
}

export async function signInEmail(email, password) {
  const data = await post('/api/auth/sign-in/email', { email, password });
  if (data.token) setToken(data.token);
  return data;
}

export async function signOut() {
  try {
    await post('/api/auth/sign-out', {}, true);
  } catch {
    /* ignore — clear the local token regardless */
  }
  clearToken();
}

// Social login. Better Auth's sign-in/social is a POST endpoint that RETURNS the
// provider authorization URL — navigating the browser straight at it produces a
// 404. So: POST first, then redirect to the url it hands back.
export async function socialLoginRedirect(provider) {
  const callbackURL = window.location.origin + window.location.pathname;
  const data = await post('/api/auth/sign-in/social', { provider, callbackURL });
  if (!data?.url) {
    throw new Error(`Could not start ${provider} sign-in. Please try again.`);
  }
  window.location.href = data.url;
}

// Metered completion via the Worker (Free/Premium tiers). BYOK does NOT use this.
// Returns the same shape as ai.js generateCompletion: { text, totalTokens, error }.
export async function generateViaBackend({ systemPrompt, history, premiumTurn = false, model, onChunk }) {
  try {
    const data = await post('/api/complete', { systemPrompt, history, premiumTurn, model }, true);
    if (onChunk && data.text) onChunk(data.text);
    return { text: data.text || '', totalTokens: data.totalTokens || 0, error: null, energy_remaining: data.energy_remaining };
  } catch (e) {
    return { text: '', totalTokens: 0, error: e.message || 'Backend completion failed.' };
  }
}

// Current user's tier + energy (replaces the Supabase profile fetch).
export async function fetchMe() {
  const t = getToken();
  const headers = {};
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${API_URL}/api/me`, {
    headers,
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}
