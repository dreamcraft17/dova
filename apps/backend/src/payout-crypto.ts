import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function key() {
  const configured = process.env.PAYOUT_ENCRYPTION_KEY;
  if (process.env.NODE_ENV === 'production' && !configured) throw new Error('PAYOUT_ENCRYPTION_KEY is required in production');
  return createHash('sha256').update(configured || process.env.JWT_SECRET || 'dova-development-key').digest();
}

export function encryptPayoutValue(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptPayoutValue(value: string) {
  const [ivEncoded, tagEncoded, dataEncoded] = value.split('.');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivEncoded, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataEncoded, 'base64url')), decipher.final()]).toString('utf8');
}
