import { createHash, randomInt } from 'crypto';
import {
  OTP_LOCK_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESEND,
  OTP_RESEND_COOLDOWN_MS,
  OTP_RESEND_WINDOW_MS,
  OTP_TTL_MS,
} from 'dova-shared';

export {
  OTP_LOCK_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESEND,
  OTP_RESEND_COOLDOWN_MS,
  OTP_RESEND_WINDOW_MS,
  OTP_TTL_MS,
};

export function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

export function hashOtp(code: string) {
  return createHash('sha256').update(code.trim()).digest('hex');
}

export function verifyOtpHash(code: string, storedHash?: string | null) {
  if (!storedHash) return false;
  return hashOtp(code) === storedHash;
}
