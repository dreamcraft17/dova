CREATE TABLE IF NOT EXISTS chat_questions (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_questions_created_idx ON chat_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_questions_user_created_idx ON chat_questions(user_id, created_at DESC);

INSERT INTO chat_questions (id, user_id, text, created_at)
SELECT id, user_id, text, created_at
FROM chat_messages
WHERE role = 'user'
ON CONFLICT (id) DO NOTHING;
