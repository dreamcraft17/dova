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
