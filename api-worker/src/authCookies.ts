/** Keep shared production cookies off local and preview API hosts. */
export function getAuthCookieScope(baseURL?: string) {
  const hostname = baseURL ? new URL(baseURL).hostname : '';
  if (hostname === 'api.shatteredsaga.com' || hostname === 'shatteredsaga.com'
    || hostname === 'www.shatteredsaga.com') {
    return { enabled: true, domain: '.shatteredsaga.com' };
  }
  return { enabled: false };
}
