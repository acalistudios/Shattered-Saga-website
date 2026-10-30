// Recovery links route to actionable account sections, not the old settings dead end.
// Energy is checked first: the server's out-of-turns message also mentions "upgrade".
export function getPlayRecovery(error = '') {
  if (/insufficient.?(?:energy|turn)|(?:energy|turns?).*(?:exhausted|depleted)|out of.*turn/i.test(error)) return { section: 'store', label: 'Get More Turns' };
  if (/subscription|supporter|upgrade|premium.*required/i.test(error)) return { section: 'subscriptions', label: 'Choose / Renew Plan' };
  if (/api.?key|byok/i.test(error)) return { section: 'byok', label: 'Manage BYOK Keys' };
  if (/unauthori[sz]ed|sign.?in|session.*expired|auth.*required/i.test(error)) return { section: 'subscriptions', label: 'Sign In / Choose a Plan' };
  return null;
}
