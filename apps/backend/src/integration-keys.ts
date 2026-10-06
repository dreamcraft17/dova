import { createHash, timingSafeEqual } from 'crypto';

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

/** `clientId:secret,other:secret` or a single secret. */
export function parseIntegrationKeyHashes(raw: string | undefined): Buffer[] {
  if (!raw?.trim()) return [];
  const hashes: Buffer[] = [];
  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(':');
    const secret = colon === -1 ? trimmed : trimmed.slice(colon + 1);
    if (!secret) continue;
    hashes.push(sha256(secret));
  }
  return hashes;
}

export function integrationKeyMatches(presented: string | undefined, hashes: Buffer[]): boolean {
  if (!presented?.trim() || hashes.length === 0) return false;
  const incoming = sha256(presented.trim());
  return hashes.some((hash) => hash.length === incoming.length && timingSafeEqual(hash, incoming));
}

export function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function frontendOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = env.CORS_ORIGINS ?? env.FRONTEND_URL ?? '';
  return raw.split(',').map((value) => value.trim().replace(/\/$/, '')).filter(Boolean);
}

export function isInternalFrontendRequest(headers: { origin?: string | string[]; referer?: string | string[] }, env: NodeJS.ProcessEnv = process.env): boolean {
  const allowed = new Set(frontendOrigins(env));
  if (!allowed.size) return false;
  const origin = firstHeaderValue(headers.origin)?.replace(/\/$/, '');
  if (origin && allowed.has(origin)) return true;
  const referer = firstHeaderValue(headers.referer);
  if (!referer) return false;
  try {
    const url = new URL(referer);
    return allowed.has(`${url.protocol}//${url.host}`);
  } catch {
    return false;
  }
}
