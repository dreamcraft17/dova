import { BadRequestException, Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

/** https://paystack.com/docs/api/transaction/ */
export const PAYSTACK_API_BASE = 'https://api.paystack.co';

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  gateway_response?: string;
  metadata?: string | Record<string, unknown>;
};

type PaystackApiResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
};

@Injectable()
export class PaystackService {
  enabled(): boolean {
    return Boolean(this.secretKey());
  }

  secretKey(): string | undefined {
    return process.env.PAYSTACK_SECRET_KEY?.trim() || undefined;
  }

  /** True when using Paystack test keys (sk_test_...). */
  isTestMode(): boolean {
    return this.secretKey()?.startsWith('sk_test_') ?? false;
  }

  currency(): string {
    return process.env.PAYSTACK_CURRENCY?.trim() || 'NGN';
  }

  /** Paystack requires a fully qualified callback URL after checkout. */
  callbackUrl(): string {
    const override = process.env.PAYSTACK_CALLBACK_URL?.trim();
    if (override) return override;
    const frontend = (process.env.FRONTEND_URL ?? 'http://localhost:3002').split(',')[0].trim();
    return `${frontend.replace(/\/$/, '')}/checkout/verify`;
  }

  /** https://paystack.com/docs/api/transaction/ — channels body param */
  channels(): string[] {
    const raw = process.env.PAYSTACK_CHANNELS ?? 'card,bank,ussd,bank_transfer';
    return raw.split(',').map((channel) => channel.trim()).filter(Boolean);
  }

  amountToSubunit(amountMajor: number): number {
    return Math.round(amountMajor * 100);
  }

  /** https://paystack.com/docs/payments/webhooks/ — x-paystack-signature HMAC SHA512 */
  verifyWebhookSignature(signature: string | undefined, payload: string): boolean {
    const secret = this.secretKey();
    if (!secret) return true;
    if (!signature) return false;
    const expected = createHmac('sha512', secret).update(payload).digest('hex');
    if (signature.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  parseMetadata(raw: unknown): Record<string, unknown> {
    if (!raw) return {};
    if (typeof raw === 'object') return raw as Record<string, unknown>;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return {};
  }

  isSuccessfulCharge(
    data: PaystackVerifyData | undefined,
    expected: { reference: string; amountSubunit: number; currency: string },
  ): boolean {
    if (!data) return false;
    if (data.status !== 'success') return false;
    if (data.reference !== expected.reference) return false;
    if ((data.currency || '').toUpperCase() !== expected.currency.toUpperCase()) return false;
    return Number(data.amount) === expected.amountSubunit;
  }

  async initializeTransaction(input: {
    email: string;
    amountMajor: number;
    reference: string;
    orderId: string;
    orderNumber: string;
    customerName?: string;
  }): Promise<PaystackInitializeData> {
    const secret = this.secretKey();
    if (!secret) throw new BadRequestException('Paystack is not configured');

    const metadata = JSON.stringify({
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      custom_fields: [
        { display_name: 'Order number', variable_name: 'order_number', value: input.orderNumber },
      ],
    });

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount: String(this.amountToSubunit(input.amountMajor)),
        currency: this.currency(),
        reference: input.reference,
        callback_url: this.callbackUrl(),
        channels: this.channels(),
        metadata,
      }),
    });

    const result = (await response.json()) as PaystackApiResponse<PaystackInitializeData>;
    if (!response.ok || !result.status || !result.data?.authorization_url) {
      throw new BadRequestException(result.message || 'Payment initialization failed');
    }
    return result.data;
  }

  async verifyTransaction(reference: string): Promise<{ ok: boolean; data?: PaystackVerifyData; raw: unknown }> {
    const secret = this.secretKey();
    if (!secret) return { ok: false, raw: null };

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const raw = await response.json();
    const result = raw as PaystackApiResponse<PaystackVerifyData>;
    if (!response.ok || !result.status || !result.data) return { ok: false, raw };
    return { ok: true, data: result.data, raw };
  }
}
