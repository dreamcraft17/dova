export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LOCK_MS = 15 * 60 * 1000;
export const OTP_MAX_RESEND = 3;
export const OTP_RESEND_WINDOW_MS = 60 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export function isValidOtpFormat(code: string): boolean {
  return /^\d{6}$/.test(String(code).trim());
}
