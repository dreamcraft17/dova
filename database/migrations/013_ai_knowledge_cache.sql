CREATE TABLE IF NOT EXISTS ai_knowledge_cache (
  question_hash CHAR(64) PRIMARY KEY,
  normalized_question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  hit_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ai_knowledge_cache_expiry_idx ON ai_knowledge_cache(expires_at);
