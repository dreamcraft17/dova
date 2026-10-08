CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role VARCHAR(20),
  action VARCHAR(120) NOT NULL,
  category VARCHAR(40) NOT NULL,
  method VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  resource_id VARCHAR(255),
  status_code INT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_category_created_idx ON audit_logs(category, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_created_idx ON audit_logs(actor_user_id, created_at DESC);
