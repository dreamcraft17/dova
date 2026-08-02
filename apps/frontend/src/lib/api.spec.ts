import { api } from './api';

describe('frontend api client', () => {
  afterEach(() => jest.restoreAllMocks());

  it('sends JSON requests with credentials enabled', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(api('/health')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'), expect.objectContaining({ credentials: 'include' }));
  });

  it('converts API errors into readable exceptions', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 }));
    await expect(api('/auth/login', { method: 'POST' })).rejects.toThrow('Invalid credentials');
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
