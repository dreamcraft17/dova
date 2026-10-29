import { ServiceUnavailableException } from '@nestjs/common';

/** Mock payment mode (no Paystack key) marks orders paid without a charge, so it must never run in production. */
export function assertMockPaymentsAllowed() {
  if (process.env.NODE_ENV === 'production') {
    throw new ServiceUnavailableException('Payments are not configured.');
  }
}
