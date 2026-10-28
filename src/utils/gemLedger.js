// Gem balances are server-authoritative for any signed-in account. A session
// may be a bearer token (email/password) or a cookie with a verified profile
// (Google/Facebook), so neither alone decides the path. Only guests without a
// backend account use the local balance.
export function usesServerGems({ backendConfigured, token, profile }) {
  return Boolean(backendConfigured && (token || profile));
}

/**
 * Spend gems. On the server path the returned balance is the server's, never
 * local arithmetic, and a refusal leaves the local balance untouched.
 */
export async function spendGemBalance({ backendConfigured, token, profile, amount, gems, spendRemote }) {
  if (usesServerGems({ backendConfigured, token, profile })) {
    const remaining = await spendRemote(amount);
    return typeof remaining === 'number'
      ? { ok: true, gems: remaining, server: true }
      : { ok: false, server: true };
  }
  if (gems >= amount) return { ok: true, gems: gems - amount, server: false };
  return { ok: false, server: false };
}
