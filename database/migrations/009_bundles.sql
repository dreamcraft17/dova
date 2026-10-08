-- Admin-curated product bundles (Bundle Feature, see DOVA_Bundle_*.md)
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  bundle_price NUMERIC(12,2) NOT NULL CHECK (bundle_price > 0),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  position INT NOT NULL DEFAULT 0,
  UNIQUE (bundle_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_bundles_status_created ON bundles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundles_category_status ON bundles(category_id, status);
CREATE INDEX IF NOT EXISTS idx_bundle_contents_bundle ON bundle_contents(bundle_id, position);
CREATE INDEX IF NOT EXISTS idx_bundle_contents_product ON bundle_contents(product_id);

-- Cart: a bundle line has no single product, so product_id becomes nullable and a new
-- bundle_id column carries the bundle instead. Exactly one of the two must be set.
ALTER TABLE cart_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES bundles(id) ON DELETE RESTRICT;

ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique_product ON cart_items(cart_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique_bundle ON cart_items(cart_id, bundle_id) WHERE bundle_id IS NOT NULL;

ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_xor_bundle;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_xor_bundle CHECK (num_nonnulls(product_id, bundle_id) = 1);

-- Orders: a bundle purchase is expanded into one order_item per component product (so supplier
-- fulfillment, stock_adjustments, and per-item status transitions are unaffected by bundles) —
-- product_id/supplier_id on order_items stay NOT NULL and unchanged. bundle_id plus the three
-- snapshot columns just tag which rows belong to one bundle purchase and preserve its price/name
-- at order time (FR-008), independent of later bundle edits.
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES bundles(id) ON DELETE RESTRICT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_quantity NUMERIC(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_name_snapshot VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_unit_price_snapshot NUMERIC(12,2);

CREATE INDEX IF NOT EXISTS idx_order_items_bundle ON order_items(bundle_id) WHERE bundle_id IS NOT NULL;
