import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getRememberedEmail,
  isRememberMe,
  setRememberedEmail,
  setTokens,
} from './auth-session';

function mockStorage() {
  const makeStore = () => {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
    };
  };
  const session = makeStore();
  const local = makeStore();
  Object.defineProperty(global, 'sessionStorage', { configurable: true, value: session });
  Object.defineProperty(global, 'localStorage', { configurable: true, value: local });
  return { session, local };
}

describe('auth-session remember me', () => {
  beforeEach(() => {
    mockStorage();
    clearTokens();
  });

  it('stores tokens in localStorage when remember me is enabled', () => {
    setTokens('access-1', 'refresh-1', true);
    expect(isRememberMe()).toBe(true);
    expect(localStorage.getItem('dova_access_token')).toBe('access-1');
    expect(sessionStorage.getItem('dova_access_token')).toBeNull();
  });

  it('stores tokens in sessionStorage when remember me is disabled', () => {
    setTokens('access-2', 'refresh-2', false);
    expect(isRememberMe()).toBe(false);
    expect(sessionStorage.getItem('dova_access_token')).toBe('access-2');
    expect(localStorage.getItem('dova_access_token')).toBeNull();
  });

  it('finds refresh token across stores for silent refresh', () => {
    setTokens('access-3', 'refresh-3', true);
    expect(getRefreshToken()).toBe('refresh-3');
    expect(getAccessToken()).toBe('access-3');
  });

  it('persists and restores remembered email', () => {
    setTokens('access-4', 'refresh-4', true);
    setRememberedEmail('buyer@example.com');
    expect(getRememberedEmail()).toBe('buyer@example.com');
    clearTokens();
    expect(getRememberedEmail()).toBeNull();
  });
});
