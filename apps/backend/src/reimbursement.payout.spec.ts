import { BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { ReimbursementService } from './reimbursement.service';

const SUPPLIER = '11111111-2222-4333-8444-555555555555';
const REF = 'dova_reimb_111111112222_abc';
const PREFS = { account_number_ciphertext: 'cipher', bank_code: '058', bank_name: 'GTBank', account_name: 'Farm Ltd', paystack_recipient_code: 'RCP_1' };

function setup() {
  const database = {
    payoutPreferences: jest.fn().mockResolvedValue(PREFS),
    lockAvailableReimbursement: jest.fn().mockResolvedValue({ id: 'reimb-1', amount: 5000, reference: REF }),
    markReimbursementProcessing: jest.fn().mockResolvedValue(undefined),
    markReimbursementSuccess: jest.fn().mockResolvedValue(undefined),
    markReimbursementFailed: jest.fn().mockResolvedValue(undefined),
    getReimbursementById: jest.fn(),
  };
  const paystack = new PaystackService();
  const service = new ReimbursementService(database as never, paystack);
  return { database, paystack, service };
}

describe('ReimbursementService payouts', () => {
  const originalEnv = { ...process.env };
  const setNodeEnv = (value: string) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = value;
  };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  describe('minWithdrawalMajor', () => {
    it.each([
      [undefined, 1000],
      ['500', 1000],
      ['not-a-number', 1000],
      ['2500', 2500],
    ])('DOVA_REIMBURSEMENT_MIN_NGN=%s gives %d', (raw, expected) => {
      if (raw === undefined) delete process.env.DOVA_REIMBURSEMENT_MIN_NGN;
      else process.env.DOVA_REIMBURSEMENT_MIN_NGN = raw;
      expect(setup().service.minWithdrawalMajor()).toBe(expected);
    });
  });

  describe('requestWithdrawal', () => {
    it('refuses when payout bank details are missing and locks nothing', async () => {
      const { service, database } = setup();
      database.payoutPreferences.mockResolvedValue({ bank_code: '058' });
      await expect(service.requestWithdrawal(SUPPLIER)).rejects.toThrow('Add payout bank details');
      expect(database.lockAvailableReimbursement).not.toHaveBeenCalled();
    });

    it('rejects a balance below the minimum and reports the available amount', async () => {
      const { service, database } = setup();
      database.lockAvailableReimbursement.mockResolvedValue({ error: 'below_minimum', available: 500 });
      await expect(service.requestWithdrawal(SUPPLIER)).rejects.toThrow(/Minimum reimbursement.*Available: ₦500/);
    });

    it('rejects when nothing could be locked', async () => {
      const { service, database } = setup();
      database.lockAvailableReimbursement.mockResolvedValue(null);
      await expect(service.requestWithdrawal(SUPPLIER)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('queues for finance approval by default without calling Paystack', async () => {
      delete process.env.DOVA_REIMBURSEMENT_AUTO;
      const { service, paystack } = setup();
      const transfer = jest.spyOn(paystack, 'initiateTransfer');
      await expect(service.requestWithdrawal(SUPPLIER)).resolves.toMatchObject({ status: 'pending_approval', amount: 5000, reference: REF });
      expect(transfer).not.toHaveBeenCalled();
    });

    describe('with DOVA_REIMBURSEMENT_AUTO=true', () => {
      beforeEach(() => {
        process.env.DOVA_REIMBURSEMENT_AUTO = 'true';
      });

      it('sends the transfer in subunits and records it as awaiting OTP', async () => {
        const { service, paystack, database } = setup();
        jest.spyOn(paystack, 'enabled').mockReturnValue(true);
        const transfer = jest.spyOn(paystack, 'initiateTransfer').mockResolvedValue({ transfer_code: 'TRF_1', reference: REF, amount: 500000, currency: 'NGN', status: 'otp' } as never);
        const result = await service.requestWithdrawal(SUPPLIER);
        expect(transfer).toHaveBeenCalledWith(expect.objectContaining({ amountSubunit: 500000, recipientCode: 'RCP_1', reference: REF }));
        expect(database.markReimbursementProcessing).toHaveBeenCalledWith('reimb-1', 'TRF_1', expect.anything(), 'awaiting_otp');
        expect(database.markReimbursementSuccess).not.toHaveBeenCalled();
        expect(result).toMatchObject({ status: 'otp', transferCode: 'TRF_1' });
      });

      it('marks success immediately when Paystack reports success', async () => {
        const { service, paystack, database } = setup();
        jest.spyOn(paystack, 'enabled').mockReturnValue(true);
        jest.spyOn(paystack, 'initiateTransfer').mockResolvedValue({ transfer_code: 'TRF_1', reference: REF, amount: 500000, currency: 'NGN', status: 'success' } as never);
        await expect(service.requestWithdrawal(SUPPLIER)).resolves.toMatchObject({ status: 'success' });
        expect(database.markReimbursementSuccess).toHaveBeenCalledTimes(1);
      });

      it('marks the payout failed and rethrows when the transfer call errors', async () => {
        const { service, paystack, database } = setup();
        jest.spyOn(paystack, 'enabled').mockReturnValue(true);
        jest.spyOn(paystack, 'initiateTransfer').mockRejectedValue(new Error('insufficient balance'));
        await expect(service.requestWithdrawal(SUPPLIER)).rejects.toThrow('insufficient balance');
        expect(database.markReimbursementFailed).toHaveBeenCalledWith(REF, 'insufficient balance', expect.anything());
      });

      it('refuses the mock payout path in production instead of marking it paid', async () => {
        setNodeEnv('production');
        const { service, paystack, database } = setup();
        jest.spyOn(paystack, 'enabled').mockReturnValue(false);
        await expect(service.requestWithdrawal(SUPPLIER)).rejects.toBeInstanceOf(ServiceUnavailableException);
        expect(database.markReimbursementSuccess).not.toHaveBeenCalled();
      });

      it('still mocks the payout outside production when Paystack is disabled', async () => {
        setNodeEnv('test');
        const { service, paystack, database } = setup();
        jest.spyOn(paystack, 'enabled').mockReturnValue(false);
        await expect(service.requestWithdrawal(SUPPLIER)).resolves.toMatchObject({ status: 'success', mode: 'mock' });
        expect(database.markReimbursementSuccess).toHaveBeenCalledWith(REF, expect.objectContaining({ mode: 'mock' }));
      });
    });
  });

  describe('adminSendReimbursement', () => {
    it('404s for an unknown payout', async () => {
      const { service, database } = setup();
      database.getReimbursementById.mockResolvedValue(undefined);
      await expect(service.adminSendReimbursement('nope')).rejects.toBeInstanceOf(NotFoundException);
    });

    it.each(['processing', 'success', 'failed'])('refuses to send a payout already in status %s', async (status) => {
      const { service, database, paystack } = setup();
      database.getReimbursementById.mockResolvedValue({ id: 'r1', status, supplier_id: SUPPLIER, amount: '5000', paystack_reference: REF });
      const transfer = jest.spyOn(paystack, 'initiateTransfer');
      await expect(service.adminSendReimbursement('r1')).rejects.toThrow(`Cannot send payout in status "${status}"`);
      expect(transfer).not.toHaveBeenCalled();
    });

    it('sends a pending_approval payout using the stored amount and reference', async () => {
      const { service, database, paystack } = setup();
      database.getReimbursementById.mockResolvedValue({ id: 'r1', status: 'pending_approval', supplier_id: SUPPLIER, amount: '5000.50', paystack_reference: REF });
      jest.spyOn(paystack, 'enabled').mockReturnValue(true);
      const transfer = jest.spyOn(paystack, 'initiateTransfer').mockResolvedValue({ transfer_code: 'TRF_2', reference: REF, amount: 500050, currency: 'NGN', status: 'pending' } as never);
      await service.adminSendReimbursement('r1');
      expect(transfer).toHaveBeenCalledWith(expect.objectContaining({ amountSubunit: 500050, reference: REF }));
    });
  });

  describe('adminRejectReimbursement', () => {
    it('404s for an unknown payout', async () => {
      const { service, database } = setup();
      database.getReimbursementById.mockResolvedValue(undefined);
      await expect(service.adminRejectReimbursement('nope')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('only rejects payouts that are still pending approval', async () => {
      const { service, database } = setup();
      database.getReimbursementById.mockResolvedValue({ id: 'r1', status: 'success', paystack_reference: REF });
      await expect(service.adminRejectReimbursement('r1')).rejects.toThrow('Cannot reject payout in status "success"');
      expect(database.markReimbursementFailed).not.toHaveBeenCalled();
    });

    it.each([
      ['  duplicate request  ', 'duplicate request'],
      [undefined, 'Rejected by admin'],
      ['   ', 'Rejected by admin'],
    ])('records the trimmed reason %j as %j', async (reason, recorded) => {
      const { service, database } = setup();
      database.getReimbursementById.mockResolvedValue({ id: 'r1', status: 'pending_approval', paystack_reference: REF });
      await expect(service.adminRejectReimbursement('r1', reason)).resolves.toEqual({ status: 'failed', id: 'r1' });
      expect(database.markReimbursementFailed).toHaveBeenCalledWith(REF, recorded, { rejected: true });
    });
  });

  describe('handleTransferWebhook', () => {
    const payload = (status: string) => ({ reference: REF, transfer_code: 'TRF_1', amount: 500000, currency: 'NGN', status });

    it('marks success exactly once on transfer.success', async () => {
      const { service, database } = setup();
      await expect(service.handleTransferWebhook('transfer.success', payload('success'))).resolves.toEqual({ handled: true, status: 'success' });
      expect(database.markReimbursementSuccess).toHaveBeenCalledTimes(1);
      expect(database.markReimbursementFailed).not.toHaveBeenCalled();
    });

    it.each(['transfer.failed', 'transfer.reversed'])('marks failure on %s', async (event) => {
      const { service, database } = setup();
      await expect(service.handleTransferWebhook(event, payload('failed'))).resolves.toEqual({ handled: true, status: 'failed' });
      expect(database.markReimbursementFailed).toHaveBeenCalledWith(REF, event, expect.anything());
      expect(database.markReimbursementSuccess).not.toHaveBeenCalled();
    });

    it('treats a failed status in an unrecognised event as failure', async () => {
      const { service, database } = setup();
      await service.handleTransferWebhook('transfer.updated', payload('abandoned'));
      expect(database.markReimbursementFailed).toHaveBeenCalledTimes(1);
    });

    it('reports but does not change state for an in-flight status', async () => {
      const { service, database } = setup();
      await expect(service.handleTransferWebhook('transfer.updated', payload('pending'))).resolves.toEqual({ handled: true, status: 'pending' });
      expect(database.markReimbursementSuccess).not.toHaveBeenCalled();
      expect(database.markReimbursementFailed).not.toHaveBeenCalled();
    });

    it.each([undefined, null, 'x', { reference: REF }])('ignores a malformed payload %j', async (data) => {
      const { service, database } = setup();
      await expect(service.handleTransferWebhook('transfer.success', data)).resolves.toEqual({ handled: false });
      expect(database.markReimbursementSuccess).not.toHaveBeenCalled();
    });
  });
});
