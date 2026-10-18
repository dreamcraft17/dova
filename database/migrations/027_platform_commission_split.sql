-- Platform commission: DOVA keeps 20% of each delivered order item's
-- subtotal, supplier gets 80% (rate configurable via DOVA_SUPPLIER_SHARE_RATE,
-- see apps/backend/src/commission.ts). New accruals compute this split
-- directly (see migration-adjacent change in database.service.ts).
--
-- This backfills earnings that were already accrued at the old 100% rate
-- but not yet paid out (status 'available'/'locked') down to the new split.
-- Rows already marked 'paid' are left untouched on purpose — that money has
-- already been transferred to suppliers in full via Paystack and can't be
-- clawed back from here.

ALTER TABLE supplier_reimbursement_earnings
  ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

UPDATE supplier_reimbursement_earnings
SET
  platform_fee_amount = amount - ROUND(amount * 0.8, 2),
  amount = ROUND(amount * 0.8, 2)
WHERE status IN ('available', 'locked');
