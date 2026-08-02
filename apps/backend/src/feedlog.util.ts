import { createHmac } from 'crypto';

export type FeedlogSsoClaims = {
  email: string;
  name: string;
  exp: number;
  picture?: string;
};

function base64Url(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

/** HS256 JWT compatible with FeedLog `/api/sso/jwt` verifier. */
export function signFeedlogSsoJwt(claims: FeedlogSsoClaims, secret: string): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(claims));
  const data = `${header}.${body}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function normalizeFeedlogBaseUrl(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

/** Only same-app relative paths — FeedLog applies its own host guard on absolute URLs. */
export function sanitizeFeedlogReturnTo(returnTo?: string | null): string {
  if (!returnTo) return '/';
  if (!returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) return '/';
  return returnTo;
}

export function buildFeedlogSsoRedirectUrl(
  user: { email: string; fullName: string },
  options: {
    baseUrl: string;
    secret?: string | null;
    returnTo?: string | null;
    ttlSeconds?: number;
    now?: number;
  },
): string {
  const base = normalizeFeedlogBaseUrl(options.baseUrl);
  if (!base) throw new Error('FeedLog base URL is required');

  const safeReturn = sanitizeFeedlogReturnTo(options.returnTo);
  const secret = options.secret?.trim();
  if (!secret) return base;

  const now = options.now ?? Math.floor(Date.now() / 1000);
  const ttl = options.ttlSeconds ?? 300;
  const jwt = signFeedlogSsoJwt(
    { email: user.email.toLowerCase(), name: user.fullName, exp: now + ttl },
    secret,
  );

  const params = new URLSearchParams({
    jwt,
    return_to: safeReturn,
  });
  return `${base}/api/sso/jwt?${params.toString()}`;
}
