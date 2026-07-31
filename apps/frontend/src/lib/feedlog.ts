/**
 * FeedLog (feedback / roadmap / changelog) runs as a sibling self-hosted app.
 * Set NEXT_PUBLIC_FEEDLOG_URL to enable storefront links (e.g. http://localhost:3010).
 */
export function getFeedlogUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_FEEDLOG_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}
