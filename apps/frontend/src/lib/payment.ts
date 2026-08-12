/** Resolve Paystack hosted URL or local mock verify path for checkout redirect. */
export function resolvePaymentRedirectUrl(authorizationUrl: string): string {
  if (/^https?:\/\//i.test(authorizationUrl)) return authorizationUrl;
  if (typeof window === 'undefined') return authorizationUrl;
  return authorizationUrl.startsWith('/') ? authorizationUrl : `/${authorizationUrl}`;
}
