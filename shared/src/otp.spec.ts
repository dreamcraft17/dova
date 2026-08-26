import { isValidOtpFormat } from './otp';

describe('isValidOtpFormat', () => {
  it('accepts 6-digit codes', () => {
    expect(isValidOtpFormat('123456')).toBe(true);
    expect(isValidOtpFormat(' 654321 ')).toBe(true);
  });

  it('rejects invalid codes', () => {
    expect(isValidOtpFormat('12345')).toBe(false);
    expect(isValidOtpFormat('1234567')).toBe(false);
    expect(isValidOtpFormat('12ab56')).toBe(false);
    expect(isValidOtpFormat('')).toBe(false);
  });
});
