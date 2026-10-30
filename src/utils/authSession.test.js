import { afterEach, expect, it, vi } from 'vitest';
import storage from './storage';
import { fetchMe } from './authApi';
vi.mock('./storage', () => ({ default: { get: vi.fn(), remove: vi.fn() } }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
it('recovers a valid cookie session after a stale bearer token is rejected', async () => {
  storage.get.mockReturnValue('synthetic-expired-session');
  const fetch = vi.fn().mockResolvedValueOnce({ status: 401, ok: false })
    .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ id: 'fixture-user' }) });
  vi.stubGlobal('fetch', fetch);
  expect(await fetchMe()).toEqual({ id: 'fixture-user' });
  expect(fetch.mock.calls[1][1]).toEqual({ credentials: 'include', headers: {} });
  expect(storage.remove).toHaveBeenCalledWith('sa_session_token');
});
it('does not confuse server failure with a signed-out session', async () => {
  storage.get.mockReturnValue(null);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 503, ok: false }));
  await expect(fetchMe()).rejects.toThrow('Unable to verify');
});
it('reports an unauthenticated cookie-only request without clearing working tokens', async () => {
  storage.get.mockReturnValue(null);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }));
  expect(await fetchMe()).toBeNull();
  expect(storage.remove).not.toHaveBeenCalled();
});
