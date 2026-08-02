/**
 * FeedLog (feedback / roadmap / changelog) runs as a sibling self-hosted app.
 * Set NEXT_PUBLIC_FEEDLOG_URL to enable storefront links (e.g. http://localhost:3010).
 */
export function getFeedlogUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_FEEDLOG_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

function getApiBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

/** Relative path on the FeedLog portal (must start with `/`). */
export function sanitizeFeedlogReturnTo(returnTo?: string): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) {
    return '/';
  }
  return returnTo;
}

/** DOVA API path that signs SSO JWT and redirects to FeedLog (requires login cookie). */
export function getFeedlogSsoPath(returnTo = '/'): string | null {
  const apiBase = getApiBaseUrl();
  if (!apiBase || !getFeedlogUrl()) return null;
  const safe = sanitizeFeedlogReturnTo(returnTo);
  return `${apiBase}/feedback/sso?return_to=${encodeURIComponent(safe)}`;
}

export type FeedlogLinkOptions = {
  isLoggedIn?: boolean;
  returnTo?: string;
};

/**
 * Public feedback board URL. Logged-in users go through DOVA SSO redirect when configured.
 */
export function getFeedlogFeedbackHref(options: FeedlogLinkOptions = {}): string | null {
  const portal = getFeedlogUrl();
  if (!portal) return null;

  if (options.isLoggedIn) {
    const sso = getFeedlogSsoPath(options.returnTo ?? '/');
    if (sso) return sso;
  }

  const safe = sanitizeFeedlogReturnTo(options.returnTo);
  if (safe === '/') return portal;
  return `${portal}${safe}`;
}

export function isFeedlogEnabled(): boolean {
  return getFeedlogUrl() !== null;
}
