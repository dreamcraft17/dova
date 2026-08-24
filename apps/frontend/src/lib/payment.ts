/** Resolve Paystack hosted URL or local mock verify path for checkout redirect. */
export function resolvePaymentRedirectUrl(authorizationUrl: string): string {
  if (/^https?:\/\//i.test(authorizationUrl)) return authorizationUrl;
  if (typeof window === 'undefined') return authorizationUrl;
  return authorizationUrl.startsWith('/') ? authorizationUrl : `/${authorizationUrl}`;
}

export type PaymentChannel = {
  id: string;
  label: string;
};

export type PaymentConfig = {
  provider: 'paystack' | 'mock';
  mode: 'mock' | 'paystack_test' | 'paystack';
  currency: string;
  channels: PaymentChannel[];
};

export function paymentProviderLabel(config: PaymentConfig): string {
  if (config.provider === 'mock') return 'Demo checkout (no real charge)';
  if (config.mode === 'paystack_test') return 'Paystack test checkout';
  return 'Paystack secure checkout';
}
