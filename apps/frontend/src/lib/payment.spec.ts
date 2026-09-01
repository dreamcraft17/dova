import { paymentProviderLabel, resolvePaymentRedirectUrl, startOrderPayment } from './payment';

function stubWindowLocation() {
  const hrefSetter = jest.fn();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: {
        set href(value: string) {
          hrefSetter(value);
        },
      },
    },
  });
  return hrefSetter;
}

function clearWindow() {
  delete (globalThis as { window?: unknown }).window;
}

describe('payment redirect helper', () => {
  it('returns absolute Paystack checkout URLs unchanged', () => {
    expect(resolvePaymentRedirectUrl('https://checkout.paystack.com/abc')).toBe('https://checkout.paystack.com/abc');
  });

  it('normalizes local mock verify paths', () => {
    expect(resolvePaymentRedirectUrl('/checkout/verify?reference=DOVA-1')).toBe('/checkout/verify?reference=DOVA-1');
  });
});

describe('startOrderPayment', () => {
  afterEach(() => {
    clearWindow();
  });

  it('initializes payment and redirects when running in the browser', async () => {
    const hrefSetter = stubWindowLocation();
    const request = jest.fn().mockResolvedValue({
      authorization_url: 'https://checkout.paystack.com/abc',
    });

    await startOrderPayment('order-1', 25000, request);

    expect(request).toHaveBeenCalledWith('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'order-1', amount: 25000 }),
    });
    expect(hrefSetter).toHaveBeenCalledWith('https://checkout.paystack.com/abc');
  });

  it('throws when initialize omits authorization_url', async () => {
    stubWindowLocation();
    const request = jest.fn().mockResolvedValue({});
    await expect(startOrderPayment('order-1', 25000, request)).rejects.toThrow('authorization_url');
  });
});

describe('paymentProviderLabel', () => {
  it('labels mock, test, and live checkout modes', () => {
    expect(paymentProviderLabel({ provider: 'mock', mode: 'mock', currency: 'NGN', channels: [] })).toMatch(/demo/i);
    expect(paymentProviderLabel({ provider: 'paystack', mode: 'paystack_test', currency: 'NGN', channels: [] })).toMatch(/test/i);
    expect(paymentProviderLabel({ provider: 'paystack', mode: 'paystack', currency: 'NGN', channels: [] })).toMatch(/secure/i);
  });
});
