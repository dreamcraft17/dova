import { ApiError, api } from './api';

describe('frontend api client', () => {
  afterEach(() => jest.restoreAllMocks());

  it('sends JSON requests with credentials enabled', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(api('/health')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'), expect.objectContaining({ credentials: 'include' }));
  });

  it('converts API errors into readable exceptions with status', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 }));
    await expect(api('/auth/login', { method: 'POST' })).rejects.toMatchObject({ message: 'Invalid credentials', status: 401 });
    await expect(api('/auth/login', { method: 'POST' })).rejects.toBeInstanceOf(ApiError);
  });

  it('retries protected requests once after a successful refresh', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 }));

    await expect(api('/cart')).resolves.toEqual({ items: [], total: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
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
