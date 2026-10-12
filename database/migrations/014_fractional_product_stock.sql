-- Products are sold by weight/volume (kg/L) with fractional cart/order quantities
-- since migration 004, but stock itself was still tracked as a whole number.
-- This finishes that: stock now tracks the same fractional units so a 0.5kg
-- purchase (pack-size shortcut) correctly depletes stock.
ALTER TABLE products ALTER COLUMN stock_quantity TYPE NUMERIC(10, 2);

ALTER TABLE stock_adjustments ALTER COLUMN quantity TYPE NUMERIC(10, 2);
ALTER TABLE stock_adjustments ALTER COLUMN stock_after TYPE NUMERIC(10, 2);
