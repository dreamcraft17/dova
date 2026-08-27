/**
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const service = new NotificationService();
  const envBackup = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  };

  afterEach(() => {
    jest.restoreAllMocks();
    for (const [key, value] of Object.entries(envBackup)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  describe('supplierStatus', () => {
    it('skips sending when email is missing', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      const result = await service.supplierStatus(undefined, 'Farm Co', 'approved');
      expect(result).toEqual({ sent: false, reason: 'missing-email' });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns not-configured when Resend env is missing', async () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
      const result = await service.supplierStatus('supplier@dova.local', 'Farm Co', 'approved');
      expect(result).toEqual({ sent: false, reason: 'email-provider-not-configured' });
    });

    it('sends approval email when provider is configured', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const result = await service.supplierStatus('supplier@dova.local', 'Farm Co', 'approved');
      expect(result).toEqual({ sent: true });
      expect(fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer re_test_key' }),
        }),
      );
    });

    it('includes rejection reason in supplier rejection email', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      await service.supplierStatus('supplier@dova.local', 'Farm Co', 'rejected', 'Missing license');
      const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
      expect(body.text).toContain('Missing license');
    });

    it('returns provider-error when Resend responds with failure', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      jest.spyOn(global, 'fetch').mockResolvedValue(new Response('error', { status: 500 }));
      const result = await service.supplierStatus('supplier@dova.local', 'Farm Co', 'approved');
      expect(result).toEqual({ sent: false, reason: 'provider-error' });
    });
  });

  describe('verificationOtp', () => {
    it('returns not-configured when Resend env is missing', async () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
      const result = await service.verificationOtp('jane@example.com', '123456', 'Jane');
      expect(result).toEqual({ sent: false, reason: 'email-provider-not-configured' });
    });

    it('sends verification email when provider is configured', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const result = await service.verificationOtp('jane@example.com', '123456', 'Jane Doe');
      expect(result).toEqual({ sent: true });
      const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
      expect(body.subject).toBe('Verify your DOVA account');
      expect(body.text).toContain('123456');
      expect(body.text).toContain('Jane Doe');
    });

    it('returns provider-error when Resend responds with failure', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      jest.spyOn(global, 'fetch').mockResolvedValue(new Response('error', { status: 500 }));
      const result = await service.verificationOtp('jane@example.com', '123456', 'Jane');
      expect(result).toEqual({ sent: false, reason: 'provider-error' });
    });
  });

  describe('contactMessage', () => {
    it('returns not-configured when email env is incomplete', async () => {
      delete process.env.RESEND_API_KEY;
      const result = await service.contactMessage({ name: 'Ada', email: 'ada@example.com', message: 'Hello' });
      expect(result).toEqual({ sent: false, reason: 'email-provider-not-configured' });
    });

    it('forwards contact form to support inbox', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      process.env.EMAIL_FROM = 'DOVA <noreply@dova.local>';
      process.env.SUPPORT_EMAIL = 'support@dova.local';
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const result = await service.contactMessage({ name: 'Ada', email: 'ada@example.com', message: 'Need help' });
      expect(result).toEqual({ sent: true });
      const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
      expect(body.to).toEqual(['support@dova.local']);
      expect(body.reply_to).toBe('ada@example.com');
      expect(body.text).toContain('Need help');
    });
  });
});
