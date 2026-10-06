/**
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import { NotificationService } from './notification.service';
import * as mailUtil from './mail.util';

jest.mock('./mail.util', () => ({
  ...jest.requireActual('./mail.util'),
  sendEmail: jest.fn(),
}));

describe('NotificationService', () => {
  const service = new NotificationService();
  const sendEmail = mailUtil.sendEmail as jest.MockedFunction<typeof mailUtil.sendEmail>;

  beforeEach(() => {
    sendEmail.mockReset();
    sendEmail.mockResolvedValue({ sent: true });
  });

  describe('supplierStatus', () => {
    it('skips sending when email is missing', async () => {
      const result = await service.supplierStatus(undefined, 'Farm Co', 'approved');
      expect(result).toEqual({ sent: false, reason: 'missing-email' });
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('sends approval email', async () => {
      await service.supplierStatus('supplier@dova.local', 'Farm Co', 'approved');
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'supplier@dova.local',
          subject: 'Your DOVA supplier application was approved',
        }),
      );
    });

    it('includes rejection reason', async () => {
      await service.supplierStatus('supplier@dova.local', 'Farm Co', 'rejected', 'Missing license');
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ text: expect.stringContaining('Missing license') }),
      );
    });
  });

  describe('verificationOtp', () => {
    it('sends OTP email with html template', async () => {
      await service.verificationOtp('jane@example.com', '123456', 'Jane Doe');
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jane@example.com',
          subject: 'Verify your DOVA email',
          text: expect.stringContaining('123456'),
          html: expect.stringContaining('https://dova.dntech.id/images/logo.jpg'),
        }),
      );
    });

    it('sends password reset email with html template', async () => {
      process.env.FRONTEND_URL = 'https://dova.dntech.id';
      await service.passwordResetOtp('jane@example.com', '654321', 'Jane Doe');
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jane@example.com',
          subject: 'Reset your DOVA password',
          text: expect.stringContaining('654321'),
          html: expect.stringContaining('Password reset code'),
        }),
      );
    });
  });

  describe('contactMessage', () => {
    it('forwards to support inbox with reply-to', async () => {
      process.env.SUPPORT_EMAIL = 'support@dova.local';
      await service.contactMessage({ name: 'Ada', email: 'ada@example.com', message: 'Need help' });
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'support@dova.local',
          replyTo: 'ada@example.com',
          text: expect.stringContaining('Need help'),
        }),
      );
    });
  });
});
