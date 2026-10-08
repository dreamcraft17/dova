-- Cart delivery slots + fractional kg/L quantities
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(20) NOT NULL DEFAULT 'morning';
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_delivery_slot_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_delivery_slot_check CHECK (delivery_slot IN ('morning', 'evening'));

ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_quantity_check;
ALTER TABLE cart_items ALTER COLUMN quantity TYPE NUMERIC(10, 2) USING quantity::NUMERIC(10, 2);
ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_check CHECK (quantity > 0);

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_check;
ALTER TABLE order_items ALTER COLUMN quantity TYPE NUMERIC(10, 2) USING quantity::NUMERIC(10, 2);
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0);
