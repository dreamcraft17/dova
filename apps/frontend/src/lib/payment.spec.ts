import { paymentProviderLabel, resolvePaymentRedirectUrl } from './payment';

describe('payment redirect helper', () => {
  it('returns absolute Paystack checkout URLs unchanged', () => {
    expect(resolvePaymentRedirectUrl('https://checkout.paystack.com/abc')).toBe('https://checkout.paystack.com/abc');
  });

  it('normalizes local mock verify paths', () => {
    expect(resolvePaymentRedirectUrl('/checkout/verify?reference=DOVA-1')).toBe('/checkout/verify?reference=DOVA-1');
  });
});

describe('paymentProviderLabel', () => {
  it('labels mock, test, and live checkout modes', () => {
    expect(paymentProviderLabel({ provider: 'mock', mode: 'mock', currency: 'NGN', channels: [] })).toMatch(/demo/i);
    expect(paymentProviderLabel({ provider: 'paystack', mode: 'paystack_test', currency: 'NGN', channels: [] })).toMatch(/test/i);
    expect(paymentProviderLabel({ provider: 'paystack', mode: 'paystack', currency: 'NGN', channels: [] })).toMatch(/secure/i);
  });
});
