import { createHmac } from 'crypto';
import { PaystackService } from './paystack.service';

describe('PaystackService', () => {
  const service = new PaystackService();

  afterEach(() => {
    delete process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_CALLBACK_URL;
    delete process.env.PAYSTACK_CHANNELS;
    delete process.env.FRONTEND_URL;
    jest.restoreAllMocks();
  });

  it('detects Paystack test mode from sk_test secret key', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_abc';
    expect(service.isTestMode()).toBe(true);
    process.env.PAYSTACK_SECRET_KEY = 'sk_live_abc';
    expect(service.isTestMode()).toBe(false);
  });

  it('builds callback URL from FRONTEND_URL per Paystack initialize docs', () => {
    process.env.FRONTEND_URL = 'https://dova.dntech.id';
    expect(service.callbackUrl()).toBe('https://dova.dntech.id/checkout/verify');
  });

  it('prefers PAYSTACK_CALLBACK_URL override', () => {
    process.env.PAYSTACK_CALLBACK_URL = 'https://dova.dntech.id/checkout/verify';
    expect(service.callbackUrl()).toBe('https://dova.dntech.id/checkout/verify');
  });

  it('verifies webhook signatures with HMAC SHA512', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret';
    const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'DOVA-1' } });
    const signature = createHmac('sha512', 'sk_test_secret').update(payload).digest('hex');
    expect(service.verifyWebhookSignature(signature, payload)).toBe(true);
    expect(service.verifyWebhookSignature('bad', payload)).toBe(false);
  });

  it('validates successful charge amount, currency, and reference', () => {
    expect(
      service.isSuccessfulCharge(
        { status: 'success', reference: 'DOVA-1', amount: 2500000, currency: 'NGN' },
        { reference: 'DOVA-1', amountSubunit: 2500000, currency: 'NGN' },
      ),
    ).toBe(true);
    expect(
      service.isSuccessfulCharge(
        { status: 'success', reference: 'DOVA-1', amount: 100, currency: 'NGN' },
        { reference: 'DOVA-1', amountSubunit: 2500000, currency: 'NGN' },
      ),
    ).toBe(false);
  });

  it('posts initialize payload to Paystack transaction API', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret';
    process.env.FRONTEND_URL = 'https://dova.dntech.id';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          status: true,
          data: {
            authorization_url: 'https://checkout.paystack.com/abc',
            access_code: 'abc',
            reference: 'DOVA-ORDER-1',
          },
        }),
        { status: 200 },
      ),
    );

    const result = await service.initializeTransaction({
      email: 'buyer@example.com',
      amountMajor: 25000,
      reference: 'DOVA-ORDER-1',
      orderId: 'order-1',
      orderNumber: 'DOVA-ABC',
      customerName: 'Buyer',
    });

    expect(result.authorization_url).toContain('checkout.paystack.com');
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(body.amount).toBe('2500000');
    expect(body.callback_url).toBe('https://dova.dntech.id/checkout/verify');
    expect(body.channels).toEqual(['card', 'bank', 'ussd', 'bank_transfer']);
    expect(JSON.parse(body.metadata).orderId).toBe('order-1');
  });

  it('throws a friendly error when Paystack is unreachable during initialize', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret';
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));

    await expect(
      service.initializeTransaction({
        email: 'buyer@example.com',
        amountMajor: 25000,
        reference: 'DOVA-ORDER-2',
        orderId: 'order-2',
        orderNumber: 'DOVA-DEF',
      }),
    ).rejects.toThrow('Payment provider is unavailable right now. Please try again.');
  });

  it('returns not-ok instead of throwing when Paystack is unreachable during verify', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret';
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));

    const result = await service.verifyTransaction('DOVA-ORDER-2');
    expect(result.ok).toBe(false);
    expect(result.raw).toEqual({ error: 'network down' });
  });
});
