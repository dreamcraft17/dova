ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) NOT NULL DEFAULT 'pending';
ALTER TABLE products ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products(approval_status);

-- Adding the column backfills every existing row to 'pending' — but those
-- products are already live today, so grandfather them in as approved
-- instead of wiping out the whole marketplace catalog on migrate.
UPDATE products SET approval_status = 'approved', approved_at = NOW() WHERE approval_status = 'pending';
