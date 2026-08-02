describe('getFeedlogUrl', () => {
  const original = process.env.NEXT_PUBLIC_FEEDLOG_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    else process.env.NEXT_PUBLIC_FEEDLOG_URL = original;
    jest.resetModules();
  });

  async function load() {
    return await import('./feedlog');
  }

  it('returns null when env is unset or blank', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    expect((await load()).getFeedlogUrl()).toBeNull();

    process.env.NEXT_PUBLIC_FEEDLOG_URL = '   ';
    expect((await load()).getFeedlogUrl()).toBeNull();
  });

  it('returns trimmed URL without trailing slashes', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com///';
    expect((await load()).getFeedlogUrl()).toBe('https://feedback.example.com');
  });

  it('preserves localhost dev URLs', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'http://localhost:3010';
    expect((await load()).getFeedlogUrl()).toBe('http://localhost:3010');
  });
});

describe('getFeedlogFeedbackHref', () => {
  const originalFeedlog = process.env.NEXT_PUBLIC_FEEDLOG_URL;
  const originalApi = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (originalFeedlog === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    else process.env.NEXT_PUBLIC_FEEDLOG_URL = originalFeedlog;
    if (originalApi === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalApi;
    jest.resetModules();
  });

  async function load() {
    return await import('./feedlog');
  }

  it('returns null when FeedLog URL is unset', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect((await load()).getFeedlogFeedbackHref()).toBeNull();
  });

  it('returns portal URL for guests', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: false })).toBe(
      'https://feedback.example.com',
    );
  });

  it('returns SSO API path for logged-in users', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1/';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: true, returnTo: '/roadmap' })).toBe(
      'http://localhost:3000/api/v1/feedback/sso?return_to=%2Froadmap',
    );
  });

  it('sanitizes unsafe return_to paths', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect(
      (await load()).getFeedlogFeedbackHref({ isLoggedIn: true, returnTo: '//evil.com' }),
    ).toBe('http://localhost:3000/api/v1/feedback/sso?return_to=%2F');
  });
});
