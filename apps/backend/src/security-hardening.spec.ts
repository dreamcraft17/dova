import { ServiceUnavailableException } from '@nestjs/common';
import { assertExternalImageUrl, isPrivateHost } from './file-validation';
import { assertMockPaymentsAllowed } from './mock-payments';
import { PaystackService } from './paystack.service';

describe('security hardening', () => {
  const originalEnv = { ...process.env };
  const setNodeEnv = (value: string) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = value;
  };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('isPrivateHost', () => {
    it.each([
      'localhost',
      'foo.localhost',
      'db.internal',
      '127.0.0.1',
      '10.0.0.5',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.10',
      '169.254.169.254',
      '100.64.0.1',
      '0.0.0.0',
      '[::1]',
      '::ffff:127.0.0.1',
      'fd00::1',
      'fe80::1',
    ])('blocks %s', (host) => {
      expect(isPrivateHost(host)).toBe(true);
    });

    it.each(['example.com', '8.8.8.8', '172.32.0.1', '172.15.0.1', '2606:4700:4700::1111'])('allows %s', (host) => {
      expect(isPrivateHost(host)).toBe(false);
    });
  });

  it('rejects image URLs that point at internal hosts', () => {
    expect(() => assertExternalImageUrl('http://169.254.169.254/latest/meta-data')).toThrow('public host');
    expect(() => assertExternalImageUrl('https://localhost:3000/a.png')).toThrow('public host');
    expect(() => assertExternalImageUrl('https://cdn.example.com/a.png')).not.toThrow();
  });

  describe('mock payments', () => {
    it('are refused in production', () => {
      setNodeEnv('production');
      expect(() => assertMockPaymentsAllowed()).toThrow(ServiceUnavailableException);
    });

    it('are allowed outside production', () => {
      setNodeEnv('test');
      expect(() => assertMockPaymentsAllowed()).not.toThrow();
    });
  });

  describe('paystack webhook without a secret', () => {
    const service = new PaystackService();

    it('rejects unsigned webhooks in production', () => {
      delete process.env.PAYSTACK_SECRET_KEY;
      setNodeEnv('production');
      expect(service.verifyWebhookSignature(undefined, '{}')).toBe(false);
    });

    it('still accepts them in local mock mode', () => {
      delete process.env.PAYSTACK_SECRET_KEY;
      setNodeEnv('test');
      expect(service.verifyWebhookSignature(undefined, '{}')).toBe(true);
    });
  });
});
