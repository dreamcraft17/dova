import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PaystackService } from './paystack.service';
import { decryptPayoutValue } from './payout-crypto';

@Injectable()
export class ReimbursementService {
  constructor(
    private readonly database: DatabaseService,
    private readonly paystack: PaystackService,
  ) {}

  minWithdrawalMajor(): number {
    const raw = Number(process.env.DOVA_REIMBURSEMENT_MIN_NGN ?? 1000);
    return Number.isFinite(raw) && raw >= 1000 ? raw : 1000;
  }

  /** Best practice: supplier requests, admin sends via Paystack (OTP at finance). Set true only for dev/automation. */
  autoPayoutEnabled(): boolean {
    return process.env.DOVA_REIMBURSEMENT_AUTO === 'true';
  }

  async listBanks() {
    const banks = await this.paystack.listBanks('nigeria');
    return banks.map((bank) => ({ code: bank.code, name: bank.name, slug: bank.slug }));
  }

  async accrueForDeliveredItem(supplierId: string, orderItemId: string) {
    await this.database.accrueReimbursementForDeliveredItem(supplierId, orderItemId);
  }

  async supplierSummary(supplierId: string) {
    const summary = await this.database.supplierReimbursementSummary(supplierId);
    const base = {
      minWithdrawal: this.minWithdrawalMajor(),
      payoutsEnabled: this.paystack.enabled(),
      approvalRequired: !this.autoPayoutEnabled(),
    };
    if (!summary) {
      return {
        available: 0,
        pending: 0,
        paid: 0,
        currency: this.paystack.currency(),
        history: [] as const,
        ...base,
      };
    }
    return { ...summary, ...base };
  }

  async listPendingApprovals() {
    return (await this.database.listPendingReimbursementApprovals()) ?? [];
  }

  async syncPaystackRecipient(supplierId: string, input: {
    bankCode: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
  }) {
    if (!this.paystack.enabled()) return null;
    const recipient = await this.paystack.createTransferRecipient({
      name: input.accountName,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
      metadata: { supplierId, bankName: input.bankName },
    });
    await this.database.setPayoutRecipientCode(supplierId, recipient.recipient_code);
    return recipient.recipient_code;
  }

  private async recipientForSupplier(supplierId: string) {
    const prefs = await this.database.payoutPreferences(supplierId);
    if (!prefs?.account_number_ciphertext || !prefs.bank_code) {
      throw new BadRequestException('Supplier payout bank details are incomplete.');
    }
    let recipientCode = prefs.paystack_recipient_code as string | undefined;
    if (!recipientCode && this.paystack.enabled()) {
      const accountNumber = decryptPayoutValue(prefs.account_number_ciphertext);
      recipientCode = await this.syncPaystackRecipient(supplierId, {
        bankCode: prefs.bank_code,
        bankName: prefs.bank_name,
        accountName: prefs.account_name,
        accountNumber,
      }) ?? undefined;
    }
    if (this.paystack.enabled() && !recipientCode) {
      throw new BadRequestException('Paystack payout recipient is not configured for this supplier.');
    }
    return recipientCode;
  }

  private transferStatusBucket(status: string): 'processing' | 'awaiting_otp' {
    return status === 'otp' ? 'awaiting_otp' : 'processing';
  }

  private async sendPaystackTransfer(input: { reimbursementId: string; supplierId: string; amount: number; reference: string }) {
    const recipientCode = await this.recipientForSupplier(input.supplierId);
    if (!this.paystack.enabled()) {
      await this.database.markReimbursementSuccess(input.reference, { mode: 'mock', note: 'Paystack disabled' });
      return { status: 'success', amount: input.amount, reference: input.reference, mode: 'mock' as const };
    }
    try {
      const transfer = await this.paystack.initiateTransfer({
        amountSubunit: this.paystack.amountToSubunit(input.amount),
        recipientCode: recipientCode!,
        reference: input.reference,
        reason: 'DOVA supplier product reimbursement',
      });
      const bucket = this.transferStatusBucket(transfer.status);
      await this.database.markReimbursementProcessing(input.reimbursementId, transfer.transfer_code, transfer, bucket);
      if (this.paystack.isSuccessfulTransfer(transfer)) {
        await this.database.markReimbursementSuccess(input.reference, transfer);
        return { status: 'success', amount: input.amount, reference: input.reference, transferCode: transfer.transfer_code };
      }
      const otpHint =
        bucket === 'awaiting_otp'
          ? 'Complete the Paystack transfer OTP sent to your business email, then wait for confirmation.'
          : 'Transfer initiated. Paystack will confirm via webhook when the bank receives funds.';
      return {
        status: transfer.status,
        amount: input.amount,
        reference: input.reference,
        transferCode: transfer.transfer_code,
        message: otpHint,
      };
    } catch (error) {
      await this.database.markReimbursementFailed(input.reference, (error as Error).message, { error: (error as Error).message });
      throw error;
    }
  }

  /** Supplier: lock balance and queue for finance (default) or auto-send when DOVA_REIMBURSEMENT_AUTO=true. */
  async requestWithdrawal(supplierId: string) {
    const prefs = await this.database.payoutPreferences(supplierId);
    if (!prefs?.account_number_ciphertext || !prefs.bank_code) {
      throw new BadRequestException('Add payout bank details in Settings before requesting reimbursement.');
    }

    const reference = this.paystack.buildReimbursementReference(supplierId);
    const locked = await this.database.lockAvailableReimbursement(supplierId, reference, this.minWithdrawalMajor());
    if (!locked || 'error' in locked) {
      throw new BadRequestException(
        `Minimum reimbursement is ₦${this.minWithdrawalMajor().toLocaleString('en-NG')}. Available: ₦${Number(locked && 'available' in locked ? locked.available : 0).toLocaleString('en-NG')}.`,
      );
    }

    if (this.autoPayoutEnabled()) {
      return this.sendPaystackTransfer({
        reimbursementId: locked.id,
        supplierId,
        amount: locked.amount,
        reference: locked.reference,
      });
    }

    return {
      status: 'pending_approval',
      amount: locked.amount,
      reference: locked.reference,
      message: 'Payout request submitted. DOVA finance will send funds to your bank after review.',
    };
  }

  /** Admin: execute Paystack transfer for an approved queue item. */
  async adminSendReimbursement(reimbursementId: string) {
    const row = await this.database.getReimbursementById(reimbursementId);
    if (!row) throw new NotFoundException('Reimbursement not found');
    if (row.status !== 'pending_approval') {
      throw new BadRequestException(`Cannot send payout in status "${row.status}".`);
    }
    return this.sendPaystackTransfer({
      reimbursementId: row.id,
      supplierId: row.supplier_id,
      amount: Number(row.amount),
      reference: row.paystack_reference,
    });
  }

  async adminRejectReimbursement(reimbursementId: string, reason?: string) {
    const row = await this.database.getReimbursementById(reimbursementId);
    if (!row) throw new NotFoundException('Reimbursement not found');
    if (row.status !== 'pending_approval') {
      throw new BadRequestException(`Cannot reject payout in status "${row.status}".`);
    }
    await this.database.markReimbursementFailed(row.paystack_reference, reason?.trim() || 'Rejected by admin', { rejected: true });
    return { status: 'failed', id: reimbursementId };
  }

  async handleTransferWebhook(event: string, data: unknown) {
    const transfer = this.paystack.transferFromWebhookData(data);
    if (!transfer?.reference?.startsWith('dova_reimb_')) return { handled: false };
    if (event === 'transfer.success' || this.paystack.isSuccessfulTransfer(transfer)) {
      await this.database.markReimbursementSuccess(transfer.reference, data);
      return { handled: true, status: 'success' };
    }
    if (event === 'transfer.failed' || event === 'transfer.reversed' || this.paystack.isFailedTransferStatus(transfer.status)) {
      await this.database.markReimbursementFailed(transfer.reference, event, data);
      return { handled: true, status: 'failed' };
    }
    return { handled: true, status: transfer.status };
  }
}
