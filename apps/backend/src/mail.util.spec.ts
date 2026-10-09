/**
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import * as mailUtil from './mail.util';

const sendMail = jest.fn();
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({ sendMail })),
  },
}));

describe('mail.util', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...envBackup };
    sendMail.mockReset();
    sendMail.mockResolvedValue({});
  });

  afterAll(() => {
    process.env = envBackup;
  });

  describe('isEmailProviderConfigured', () => {
    it('returns true when Gmail SMTP env is set', () => {
      process.env.EMAIL_FROM = 'DOVA <officialdovachain@gmail.com>';
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'officialdovachain@gmail.com';
      process.env.SMTP_PASS = 'app-password';
      expect(mailUtil.isEmailProviderConfigured()).toBe(true);
      expect(mailUtil.usesSmtp()).toBe(true);
    });

    it('returns true when Resend env is set', () => {
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      process.env.RESEND_API_KEY = 're_test';
      delete process.env.SMTP_HOST;
      expect(mailUtil.isEmailProviderConfigured()).toBe(true);
      expect(mailUtil.usesSmtp()).toBe(false);
    });

    it('returns false when EMAIL_FROM is missing', () => {
      delete process.env.EMAIL_FROM;
      process.env.RESEND_API_KEY = 're_test';
      expect(mailUtil.isEmailProviderConfigured()).toBe(false);
    });
  });

  describe('sendEmail', () => {
    it('sends via SMTP when configured', async () => {
      process.env.EMAIL_FROM = 'DOVA <officialdovachain@gmail.com>';
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'officialdovachain@gmail.com';
      process.env.SMTP_PASS = 'app-password';
      const result = await mailUtil.sendEmail({ to: 'jane@example.com', subject: 'Hi', text: 'OTP 123456' });
      expect(result).toEqual({ sent: true });
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'DOVA <officialdovachain@gmail.com>',
          to: 'jane@example.com',
          subject: 'Hi',
          text: 'OTP 123456',
        }),
      );
    });

    it('prefers Resend over legacy SMTP when both are set', async () => {
      process.env.EMAIL_FROM = 'DOVA <officialdovachain@gmail.com>';
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'officialdovachain@gmail.com';
      process.env.SMTP_PASS = 'app-password';
      process.env.RESEND_API_KEY = 're_test';
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy.mockResolvedValue(new Response('{}', { status: 200 }));
      await mailUtil.sendEmail({ to: 'jane@example.com', subject: 'Hi', text: 'Body' });
      expect(sendMail).not.toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('allows explicit SMTP fallback when EMAIL_PROVIDER=smtp', async () => {
      process.env.EMAIL_PROVIDER = 'smtp';
      process.env.EMAIL_FROM = 'DOVA <officialdovachain@gmail.com>';
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'officialdovachain@gmail.com';
      process.env.SMTP_PASS = 'app-password';
      process.env.RESEND_API_KEY = 're_test';
      await mailUtil.sendEmail({ to: 'jane@example.com', subject: 'Hi', text: 'Body' });
      expect(sendMail).toHaveBeenCalled();
    });

    it('sends via Resend when SMTP is not configured', async () => {
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      process.env.RESEND_API_KEY = 're_test_key';
      delete process.env.SMTP_HOST;
      jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const result = await mailUtil.sendEmail({ to: 'jane@example.com', subject: 'Verify', text: '123456' });
      expect(result).toEqual({ sent: true });
      expect(fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('returns provider-error when SMTP send fails', async () => {
      process.env.EMAIL_FROM = 'DOVA <officialdovachain@gmail.com>';
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'officialdovachain@gmail.com';
      process.env.SMTP_PASS = 'bad';
      sendMail.mockRejectedValue(new Error('auth failed'));
      const result = await mailUtil.sendEmail({ to: 'jane@example.com', subject: 'Hi', text: 'Body' });
      expect(result).toEqual({ sent: false, reason: 'provider-error' });
    });

    it('returns provider-error when Resend request fails', async () => {
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      process.env.RESEND_API_KEY = 're_test_key';
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const result = await mailUtil.sendEmail({ to: 'jane@example.com', subject: 'Verify', text: '123456' });
      expect(result).toEqual({ sent: false, reason: 'provider-error' });
      expect(warn).toHaveBeenCalledWith('[Mail] Resend API request failed:', 'network down');
    });
  });
});
