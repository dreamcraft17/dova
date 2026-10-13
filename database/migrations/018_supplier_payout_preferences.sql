CREATE TABLE IF NOT EXISTS supplier_payout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID UNIQUE NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  payout_method VARCHAR(32) NOT NULL DEFAULT 'bank_transfer',
  bank_name VARCHAR(120) NOT NULL,
  account_name VARCHAR(160) NOT NULL,
  account_number_ciphertext TEXT NOT NULL,
  account_number_last4 VARCHAR(4) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
