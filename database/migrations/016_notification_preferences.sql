CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  new_order_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  order_status_updates BOOLEAN NOT NULL DEFAULT TRUE,
  product_approval_updates BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_updates BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
