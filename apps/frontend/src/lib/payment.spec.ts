import { resolvePaymentRedirectUrl } from './payment';

describe('payment redirect helper', () => {
  it('returns absolute Paystack checkout URLs unchanged', () => {
    expect(resolvePaymentRedirectUrl('https://checkout.paystack.com/abc')).toBe('https://checkout.paystack.com/abc');
  });

  it('normalizes local mock verify paths', () => {
    expect(resolvePaymentRedirectUrl('/checkout/verify?reference=DOVA-1')).toBe('/checkout/verify?reference=DOVA-1');
  });
});
