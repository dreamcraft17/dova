-- Native feedback board persistence
CREATE TABLE IF NOT EXISTS feedback_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  votes INT NOT NULL DEFAULT 0,
  voter_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  comment_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_status ON feedback_posts(status);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_votes ON feedback_posts(votes DESC);

CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feedback_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_post ON feedback_comments(post_id);

CREATE TABLE IF NOT EXISTS feedback_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  published_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
