ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS business_whatsapp VARCHAR(20);
