const ACCESS_KEY = 'dova_access_token';
const REFRESH_KEY = 'dova_refresh_token';
const REMEMBER_KEY = 'dova_remember_me';
export const REMEMBER_EMAIL_KEY = 'dova_remember_email';

function readStore(kind: 'local' | 'session'): Storage | null {
  if (typeof window !== 'undefined') {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  }
  const globalStore = globalThis as typeof globalThis & { localStorage?: Storage; sessionStorage?: Storage };
  return kind === 'local' ? globalStore.localStorage ?? null : globalStore.sessionStorage ?? null;
}

export function isRememberMe(): boolean {
  return readStore('local')?.getItem(REMEMBER_KEY) === '1';
}

export function setRememberMe(enabled: boolean) {
  const local = readStore('local');
  if (!local) return;
  if (enabled) local.setItem(REMEMBER_KEY, '1');
  else local.removeItem(REMEMBER_KEY);
}

function primaryStore(): Storage | null {
  return isRememberMe() ? readStore('local') : readStore('session');
}

function secondaryStore(): Storage | null {
  return isRememberMe() ? readStore('session') : readStore('local');
}

export function getAccessToken(): string | null {
  return readStore('local')?.getItem(ACCESS_KEY) ?? readStore('session')?.getItem(ACCESS_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return readStore('local')?.getItem(REFRESH_KEY) ?? readStore('session')?.getItem(REFRESH_KEY) ?? null;
}

export function setTokens(accessToken: string, refreshToken?: string, rememberMe?: boolean) {
  const store = primaryStore();
  if (!store) {
    if (rememberMe !== undefined) setRememberMe(rememberMe);
    const retry = primaryStore();
    if (!retry) return;
    secondaryStore()?.removeItem(ACCESS_KEY);
    secondaryStore()?.removeItem(REFRESH_KEY);
    retry.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) retry.setItem(REFRESH_KEY, refreshToken);
    return;
  }
  if (rememberMe !== undefined) setRememberMe(rememberMe);
  const active = primaryStore();
  secondaryStore()?.removeItem(ACCESS_KEY);
  secondaryStore()?.removeItem(REFRESH_KEY);
  active?.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) active?.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  readStore('local')?.removeItem(ACCESS_KEY);
  readStore('local')?.removeItem(REFRESH_KEY);
  readStore('session')?.removeItem(ACCESS_KEY);
  readStore('session')?.removeItem(REFRESH_KEY);
  readStore('local')?.removeItem(REMEMBER_KEY);
  readStore('local')?.removeItem(REMEMBER_EMAIL_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getRememberedEmail(): string | null {
  if (!isRememberMe()) return null;
  return readStore('local')?.getItem(REMEMBER_EMAIL_KEY) ?? null;
}

export function setRememberedEmail(email: string | null) {
  const local = readStore('local');
  if (!local) return;
  if (email && isRememberMe()) local.setItem(REMEMBER_EMAIL_KEY, email);
  else local.removeItem(REMEMBER_EMAIL_KEY);
}
