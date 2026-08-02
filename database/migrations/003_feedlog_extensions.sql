-- Shared Postgres with FeedLog (sibling app).
-- DOVA tables: users, products, orders, …
-- FeedLog tables: user, post, board, changelog, … (applied via `npm run db:migrate:feedlog`)
-- No cross-app foreign keys — SSO links accounts by email only.

CREATE EXTENSION IF NOT EXISTS vector;
