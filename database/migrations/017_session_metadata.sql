ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS token_type VARCHAR(16) NOT NULL DEFAULT 'refresh';
CREATE INDEX IF NOT EXISTS user_sessions_user_refresh_idx ON user_sessions(user_id, token_type, created_at DESC);
