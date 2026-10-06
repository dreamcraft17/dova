-- Password reset OTP (separate from email verification OTP)
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_resend_count INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_resend_window_start TIMESTAMP;
