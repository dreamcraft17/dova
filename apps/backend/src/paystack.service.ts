import { BadRequestException, Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

/** https://paystack.com/docs/api/transaction/ */
export const PAYSTACK_API_BASE = 'https://api.paystack.co';
const PAYSTACK_TIMEOUT_MS = 10_000;

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

/** https://paystack.com/docs/payments/verify-payments/ */
export type PaystackTransactionStatus =
  | 'success'
  | 'failed'
  | 'abandoned'
  | 'ongoing'
  | 'pending'
  | 'processing'
  | 'queued'
  | 'reversed';

export type PaystackVerifyData = {
  status: PaystackTransactionStatus | string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  gateway_response?: string;
  metadata?: string | Record<string, unknown>;
};

export type PaystackChargeExpected = {
  reference: string;
  amountSubunit: number;
  currency: string;
};

/** https://paystack.com/docs/api/transfer-recipient/ */
export type PaystackTransferRecipient = {
  recipient_code: string;
  type: string;
  name: string;
  details?: { account_number?: string; bank_code?: string; bank_name?: string };
};

/** https://paystack.com/docs/api/transfer/ */
export type PaystackTransferData = {
  reference: string;
  transfer_code: string;
  amount: number;
  currency: string;
  status: string;
  recipient?: string;
  reason?: string;
};

export type PaystackBank = {
  name: string;
  slug: string;
  code: string;
  currency: string;
  type: string;
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

  /** True when using Paystack live keys (sk_live_...). */
  isLiveMode(): boolean {
    return this.secretKey()?.startsWith('sk_live_') ?? false;
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

  channelLabel(id: string): string {
    const labels: Record<string, string> = {
      card: 'Debit / Credit Card',
      bank: 'Bank Account',
      ussd: 'USSD',
      bank_transfer: 'Bank Transfer',
      qr: 'QR Code',
      mobile_money: 'Mobile Money',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      eft: 'EFT',
    };
    return labels[id] ?? id.replace(/_/g, ' ');
  }

  paymentConfig() {
    const enabled = this.enabled();
    return {
      provider: enabled ? 'paystack' : 'mock',
      mode: !enabled ? 'mock' : this.isTestMode() ? 'paystack_test' : 'paystack',
      currency: this.currency(),
      channels: this.channels().map((id) => ({ id, label: this.channelLabel(id) })),
    };
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

  isPendingStatus(status: string | undefined): boolean {
    return ['ongoing', 'pending', 'processing', 'queued'].includes(status ?? '');
  }

  isFailedStatus(status: string | undefined): boolean {
    return ['failed', 'abandoned', 'reversed'].includes(status ?? '');
  }

  pendingStatusMessage(status: string | undefined): string {
    if (status === 'ongoing') {
      return 'Payment is still in progress. Complete the OTP or bank transfer, then check again.';
    }
    if (status === 'processing') {
      return 'Payment is processing. Please wait a moment and try again.';
    }
    return 'Payment is pending confirmation. Please wait and try again shortly.';
  }

  failedStatusMessage(data: PaystackVerifyData | undefined): string {
    if (!data) return 'Payment verification failed';
    if (data.status === 'abandoned') return 'Payment was not completed.';
    if (data.status === 'reversed') return 'Payment was reversed.';
    return data.gateway_response?.trim() || 'Payment verification failed';
  }

  chargeFromWebhookData(data: unknown): PaystackVerifyData | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const row = data as Record<string, unknown>;
    const reference = typeof row.reference === 'string' ? row.reference : undefined;
    const amount = Number(row.amount);
    const currency = typeof row.currency === 'string' ? row.currency : undefined;
    const status = typeof row.status === 'string' ? row.status : 'success';
    if (!reference || !Number.isFinite(amount) || !currency) return undefined;
    return {
      status,
      reference,
      amount,
      currency,
      paid_at: typeof row.paid_at === 'string' ? row.paid_at : undefined,
      gateway_response: typeof row.gateway_response === 'string' ? row.gateway_response : undefined,
      metadata: row.metadata as PaystackVerifyData['metadata'],
    };
  }

  isSuccessfulCharge(data: PaystackVerifyData | undefined, expected: PaystackChargeExpected): boolean {
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

    let response: Response;
    try {
      response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
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
        signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
      });
    } catch {
      throw new BadRequestException('Payment provider is unavailable right now. Please try again.');
    }

    const result = (await response.json()) as PaystackApiResponse<PaystackInitializeData>;
    if (!response.ok || !result.status || !result.data?.authorization_url) {
      throw new BadRequestException(result.message || 'Payment initialization failed');
    }
    return result.data;
  }

  async verifyTransaction(reference: string): Promise<{ ok: boolean; data?: PaystackVerifyData; raw: unknown }> {
    const secret = this.secretKey();
    if (!secret) return { ok: false, raw: null };

    let response: Response;
    try {
      response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
      });
    } catch (error) {
      return { ok: false, raw: { error: (error as Error).message } };
    }
    const raw = await response.json();
    const result = raw as PaystackApiResponse<PaystackVerifyData>;
    if (!response.ok || !result.status || !result.data) return { ok: false, raw };
    return { ok: true, data: result.data, raw };
  }

  /** https://paystack.com/docs/api/miscellaneous/#bank */
  async listBanks(country = 'nigeria'): Promise<PaystackBank[]> {
    const secret = this.secretKey();
    if (!secret) return [];
    const response = await fetch(`${PAYSTACK_API_BASE}/bank?country=${encodeURIComponent(country)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
    });
    const result = (await response.json()) as PaystackApiResponse<PaystackBank[]>;
    if (!response.ok || !result.status || !Array.isArray(result.data)) return [];
    return result.data;
  }

  /** https://paystack.com/docs/api/transfer-recipient/#create */
  async createTransferRecipient(input: {
    name: string;
    accountNumber: string;
    bankCode: string;
    currency?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaystackTransferRecipient> {
    const secret = this.secretKey();
    if (!secret) throw new BadRequestException('Paystack is not configured');

    const response = await fetch(`${PAYSTACK_API_BASE}/transferrecipient`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'nuban',
        name: input.name,
        account_number: input.accountNumber,
        bank_code: input.bankCode,
        currency: input.currency ?? this.currency(),
        metadata: input.metadata,
      }),
      signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
    });
    const result = (await response.json()) as PaystackApiResponse<PaystackTransferRecipient>;
    if (!response.ok || !result.status || !result.data?.recipient_code) {
      throw new BadRequestException(result.message || 'Could not register payout account with Paystack');
    }
    return result.data;
  }

  /** https://paystack.com/docs/api/transfer/#initiate */
  async initiateTransfer(input: {
    amountSubunit: number;
    recipientCode: string;
    reference: string;
    reason?: string;
  }): Promise<PaystackTransferData> {
    const secret = this.secretKey();
    if (!secret) throw new BadRequestException('Paystack is not configured');
    if (!/^[a-z0-9_-]{16,50}$/i.test(input.reference)) {
      throw new BadRequestException('Invalid transfer reference format');
    }

    const response = await fetch(`${PAYSTACK_API_BASE}/transfer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'balance',
        amount: input.amountSubunit,
        recipient: input.recipientCode,
        reference: input.reference,
        reason: input.reason ?? 'DOVA supplier reimbursement',
        currency: this.currency(),
      }),
      signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
    });
    const result = (await response.json()) as PaystackApiResponse<PaystackTransferData>;
    if (!response.ok || !result.status || !result.data?.reference) {
      throw new BadRequestException(result.message || 'Transfer initiation failed');
    }
    return result.data;
  }

  /** https://paystack.com/docs/api/transfer/#verify */
  async verifyTransfer(reference: string): Promise<{ ok: boolean; data?: PaystackTransferData; raw: unknown }> {
    const secret = this.secretKey();
    if (!secret) return { ok: false, raw: null };
    const response = await fetch(`${PAYSTACK_API_BASE}/transfer/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
    });
    const raw = await response.json();
    const result = raw as PaystackApiResponse<PaystackTransferData>;
    if (!response.ok || !result.status || !result.data) return { ok: false, raw };
    return { ok: true, data: result.data, raw };
  }

  transferFromWebhookData(data: unknown): PaystackTransferData | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const row = data as Record<string, unknown>;
    const reference = typeof row.reference === 'string' ? row.reference : undefined;
    const transfer_code = typeof row.transfer_code === 'string' ? row.transfer_code : undefined;
    const amount = Number(row.amount);
    const currency = typeof row.currency === 'string' ? row.currency : undefined;
    const status = typeof row.status === 'string' ? row.status : undefined;
    if (!reference || !transfer_code || !Number.isFinite(amount) || !currency || !status) return undefined;
    return { reference, transfer_code, amount, currency, status };
  }

  isSuccessfulTransfer(data: PaystackTransferData | undefined): boolean {
    return (data?.status ?? '').toLowerCase() === 'success';
  }

  isFailedTransferStatus(status: string | undefined): boolean {
    return ['failed', 'reversed', 'abandoned'].includes((status ?? '').toLowerCase());
  }

  buildReimbursementReference(supplierId: string): string {
    const compact = supplierId.replace(/-/g, '').slice(0, 12);
    const stamp = Date.now().toString(36);
    return `dova_reimb_${compact}_${stamp}`.toLowerCase().slice(0, 50);
  }
}
