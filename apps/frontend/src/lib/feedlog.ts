/**
 * Native DOVA feedback board — routes live at /feedback on the storefront.
 * @author Dozer (@dreamraft17) - Software Engineer
 */
export const FEEDBACK_PATH = '/feedback';

export function isFeedlogEnabled(): boolean {
  return true;
}

export function getFeedlogUrl(): string {
  return FEEDBACK_PATH;
}

export function getFeedlogFeedbackHref(options: { isLoggedIn?: boolean; returnTo?: string } = {}): string {
  const base = FEEDBACK_PATH;
  if (!options.returnTo || options.returnTo === '/') return base;
  if (options.returnTo.startsWith('/roadmap')) return `${base}/roadmap`;
  return base;
}

export function isFeedlogSameOrigin(): boolean {
  return true;
}

/** @deprecated Native feedback — SSO not used. */
export function getFeedlogSsoPath() {
  return null;
}

/** @deprecated Native feedback — always integrated. */
export function isFeedlogIntegrated(): boolean {
  return true;
}

/** @deprecated Native feedback — return paths are safe by construction. */
export function sanitizeFeedlogReturnTo(returnTo?: string): string {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) return '/';
  return returnTo;
}
