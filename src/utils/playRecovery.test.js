import { expect, it } from 'vitest';
import { getPlayRecovery } from './playRecovery';
it('routes subscription lapses to plans instead of key configuration', () => {
  expect(getPlayRecovery('The BYOK Engine requires a Supporter Subscription ($1/mo) or higher.').section).toBe('subscriptions');
});
it('routes missing keys, energy and expired sessions to the appropriate sections', () => {
  expect(getPlayRecovery('Missing API key').section).toBe('byok');
  expect(getPlayRecovery('Insufficient energy').section).toBe('store');
  expect(getPlayRecovery('Session expired').section).toBe('subscriptions');
  expect(getPlayRecovery('Network failed')).toBeNull();
});
