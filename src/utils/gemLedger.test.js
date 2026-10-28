import { afterEach, describe, expect, it, vi } from 'vitest';
import { spendGemBalance, usesServerGems } from './gemLedger';

vi.mock('./storage', () => ({ default: { get: vi.fn(() => null), set: vi.fn(), remove: vi.fn() } }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

const cookieUser = { id: 'fixture-user', email: 'fixture@example.test', gems: 20 };

describe('gem ledger', () => {
  it('routes a cookie-session user without a bearer token to the server', async () => {
    const spendRemote = vi.fn().mockResolvedValue(7);
    const result = await spendGemBalance({
      backendConfigured: true, token: null, profile: cookieUser, amount: 1, gems: 20, spendRemote,
    });
    expect(spendRemote).toHaveBeenCalledWith(1);
    // The server balance wins over local arithmetic (20 - 1).
    expect(result).toEqual({ ok: true, gems: 7, server: true });
  });

  it('does not decrement locally when the server refuses a cookie-session spend', async () => {
    const spendRemote = vi.fn().mockResolvedValue(null);
    const result = await spendGemBalance({
      backendConfigured: true, token: null, profile: cookieUser, amount: 3, gems: 20, spendRemote,
    });
    expect(spendRemote).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, server: true });
    expect(result.gems).toBeUndefined();
  });

  it('keeps bearer-token users on the server path and guests on the local path', async () => {
    expect(usesServerGems({ backendConfigured: true, token: 'synthetic-token', profile: null })).toBe(true);
    expect(usesServerGems({ backendConfigured: true, token: null, profile: cookieUser })).toBe(true);
    expect(usesServerGems({ backendConfigured: true, token: null, profile: null })).toBe(false);
    expect(usesServerGems({ backendConfigured: false, token: null, profile: cookieUser })).toBe(false);
    const spendRemote = vi.fn();
    expect(await spendGemBalance({ backendConfigured: false, token: null, profile: null, amount: 2, gems: 5, spendRemote }))
      .toEqual({ ok: true, gems: 3, server: false });
    expect(spendRemote).not.toHaveBeenCalled();
  });

  it('sends a cookie-only spend to the gem endpoint with credentials and no bearer header', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ gems: 9 }) });
    vi.stubGlobal('fetch', fetch);
    const { spendGems } = await import('./cloudSaves');
    const result = await spendGemBalance({
      backendConfigured: true, token: null, profile: cookieUser, amount: 1, gems: 20,
      spendRemote: (n) => spendGems(n, 'test'),
    });
    expect(result).toEqual({ ok: true, gems: 9, server: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.example.test/api/gems/spend');
    expect(init.credentials).toBe('include');
    expect(init.headers.Authorization).toBeUndefined();
  });
});
