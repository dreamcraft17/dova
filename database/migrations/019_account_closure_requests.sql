CREATE TABLE IF NOT EXISTS account_closure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS account_closure_requests_user_idx ON account_closure_requests(user_id, requested_at DESC);
