ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude NUMERIC(10, 7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude NUMERIC(10, 7);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_latitude_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_latitude_check CHECK (delivery_latitude IS NULL OR delivery_latitude BETWEEN -90 AND 90);
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_longitude_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_longitude_check CHECK (delivery_longitude IS NULL OR delivery_longitude BETWEEN -180 AND 180);
