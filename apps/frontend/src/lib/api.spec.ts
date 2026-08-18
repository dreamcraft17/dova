import { ApiError, api } from './api';
import { clearTokens, getAccessToken, setTokens } from './auth-session';

function mockSessionStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(global, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
    },
  });
}

describe('frontend api client', () => {
  beforeEach(() => {
    mockSessionStorage();
    sessionStorage.clear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('sends JSON requests with credentials enabled', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(api('/health')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'), expect.objectContaining({ credentials: 'include' }));
  });

  it('stores tokens after login and sends Authorization header on later requests', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ accessToken: 'access-1', refreshToken: 'refresh-1', user: { id: '1' } }), { status: 200 }),
    );
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: '1' }), { status: 200 }));

    await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'a@b.c', password: 'password1' }) });
    expect(getAccessToken()).toBe('access-1');

    await api('/auth/me');
    const [, init] = fetchMock.mock.calls[1];
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.Authorization).toBe('Bearer access-1');
  });

  it('converts API errors into readable exceptions with status', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 }));
    await expect(api('/auth/login', { method: 'POST' })).rejects.toMatchObject({ message: 'Invalid credentials', status: 401 });
    await expect(api('/auth/login', { method: 'POST' })).rejects.toBeInstanceOf(ApiError);
  });

  it('retries protected requests once after a successful refresh', async () => {
    setTokens('expired-token', 'refresh-1');
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'access-2', refreshToken: 'refresh-2' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 }));

    await expect(api('/cart')).resolves.toEqual({ items: [], total: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ refreshToken: 'refresh-1' });
    expect(getAccessToken()).toBe('access-2');
  });

  it('clears tokens on logout', async () => {
    setTokens('access-1', 'refresh-1');
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Logged out' }), { status: 200 }));
    await api('/auth/logout', { method: 'POST' });
    expect(getAccessToken()).toBeNull();
  });

  it('falls back to a generic message when the API body has no message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('not-json', { status: 500 }));
    await expect(api('/broken')).rejects.toThrow('Request failed');
  });

  it('omits JSON Content-Type for FormData uploads', async () => {
    const form = new FormData();
    form.append('file', new Blob(['x']), 'x.png');
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await api('/upload', { method: 'POST', body: form });
    const [, init] = (fetch as jest.Mock).mock.calls[0];
    expect(init.headers?.['Content-Type']).toBeUndefined();
  });
});
