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
});
