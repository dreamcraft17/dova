/**
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import { buildOtpEmail } from './email-templates';

describe('email-templates', () => {
  beforeEach(() => {
    process.env.FRONTEND_URL = 'https://dova.dntech.id';
  });

  it('builds verification email with logo and profile link', () => {
    const message = buildOtpEmail('verification', 'Ada Okonkwo', '482913');
    expect(message.subject).toBe('Verify your DOVA email');
    expect(message.text).toContain('482913');
    expect(message.text).toContain('/customer/profile?verify=1');
    expect(message.html).toContain('https://dova.dntech.id/images/logo.jpg');
    expect(message.html).toContain('482913');
    expect(message.html).toContain('Email verification code');
  });

  it('builds password reset email with reset link', () => {
    const message = buildOtpEmail('password-reset', 'Ada', '109384');
    expect(message.subject).toBe('Reset your DOVA password');
    expect(message.html).toContain('/auth/reset-password');
    expect(message.html).toContain('Password reset code');
  });

  it('escapes html in recipient name', () => {
    const message = buildOtpEmail('verification', '<script>alert(1)</script>', '123456');
    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;');
  });
});
