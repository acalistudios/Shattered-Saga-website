import { expect, it } from 'vitest';
import { getPlayRecovery } from './playRecovery';
it('routes subscription lapses to plans instead of key configuration', () => {
  expect(getPlayRecovery('The BYOK Engine requires a Supporter Subscription ($1/mo) or higher. Please visit the Account page to upgrade your account.').section).toBe('subscriptions');
});
it('routes the server out-of-turns response to the turn store, not plans', () => {
  // Exact /api/complete 402 message (error code insufficient_energy).
  expect(getPlayRecovery('Out of turns. Watch an ad or upgrade to refill.')).toEqual({ section: 'store', label: 'Get More Turns' });
  expect(getPlayRecovery('insufficient_energy').section).toBe('store');
});
it('routes missing keys, energy and expired sessions to the appropriate sections', () => {
  expect(getPlayRecovery('Missing API key').section).toBe('byok');
  expect(getPlayRecovery('Insufficient energy').section).toBe('store');
  expect(getPlayRecovery('Session expired').section).toBe('subscriptions');
  expect(getPlayRecovery('unauthorized').section).toBe('subscriptions');
  expect(getPlayRecovery('Network failed')).toBeNull();
});
