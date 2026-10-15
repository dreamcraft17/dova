ALTER TABLE supplier_payout_preferences
  ADD COLUMN IF NOT EXISTS bank_code VARCHAR(16),
  ADD COLUMN IF NOT EXISTS paystack_recipient_code VARCHAR(32);

CREATE TABLE IF NOT EXISTS supplier_reimbursement_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  status VARCHAR(32) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'locked', 'paid')),
  reimbursement_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_reimbursement_earnings_supplier_status
  ON supplier_reimbursement_earnings (supplier_id, status);

CREATE TABLE IF NOT EXISTS supplier_reimbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  status VARCHAR(32) NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'pending_transfer', 'processing', 'awaiting_otp', 'success', 'failed')),
  paystack_reference VARCHAR(64) NOT NULL UNIQUE,
  transfer_code VARCHAR(64),
  paystack_response JSONB,
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE supplier_reimbursement_earnings
  ADD CONSTRAINT fk_reimbursement_earnings_payout
  FOREIGN KEY (reimbursement_id) REFERENCES supplier_reimbursements(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_supplier_reimbursements_supplier_created
  ON supplier_reimbursements (supplier_id, created_at DESC);
