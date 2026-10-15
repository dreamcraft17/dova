import { ReimbursementService } from './reimbursement.service';
import { PaystackService } from './paystack.service';

describe('ReimbursementService', () => {
  it('builds Paystack-safe transfer references', () => {
    const paystack = new PaystackService();
    const ref = paystack.buildReimbursementReference('11111111-2222-4333-8444-555555555555');
    expect(ref.startsWith('dova_reimb_')).toBe(true);
    expect(ref.length).toBeGreaterThanOrEqual(16);
    expect(ref.length).toBeLessThanOrEqual(50);
  });

  it('ignores unrelated transfer webhooks', async () => {
    const database = {
      markReimbursementSuccess: jest.fn(),
      markReimbursementFailed: jest.fn(),
    };
    const paystack = new PaystackService();
    const service = new ReimbursementService(database as never, paystack);
    const result = await service.handleTransferWebhook('transfer.success', { reference: 'other_ref', transfer_code: 'TRF_x', amount: 100, currency: 'NGN', status: 'success' });
    expect(result).toEqual({ handled: false });
  });
});
