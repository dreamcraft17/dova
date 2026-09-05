-- AI assistant chat identities: maps a DOVA user to their Botpress Chat API identity/conversation
CREATE TABLE IF NOT EXISTS chat_identities (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  botpress_user_id VARCHAR(100) NOT NULL,
  botpress_user_key VARCHAR(500) NOT NULL,
  botpress_conversation_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
