const ACCESS_KEY = 'dova_access_token';
const REFRESH_KEY = 'dova_refresh_token';

function tokenStore(): Storage | null {
  if (typeof window !== 'undefined') return window.sessionStorage;
  const globalStore = (globalThis as typeof globalThis & { sessionStorage?: Storage }).sessionStorage;
  return globalStore ?? null;
}

export function getAccessToken(): string | null {
  return tokenStore()?.getItem(ACCESS_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return tokenStore()?.getItem(REFRESH_KEY) ?? null;
}

export function setTokens(accessToken: string, refreshToken?: string) {
  const store = tokenStore();
  if (!store) return;
  store.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) store.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  tokenStore()?.removeItem(ACCESS_KEY);
  tokenStore()?.removeItem(REFRESH_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
