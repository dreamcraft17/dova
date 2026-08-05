/**
 * Unit tests for FeedLog integration helpers.
 * @author Dozer (@dreamraft17) - Software Engineer
 */
describe('getFeedlogUrl', () => {
  const originalIntegrated = process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
  const original = process.env.NEXT_PUBLIC_FEEDLOG_URL;

  afterEach(() => {
    if (originalIntegrated === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    else process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = originalIntegrated;
    if (original === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    else process.env.NEXT_PUBLIC_FEEDLOG_URL = original;
    jest.resetModules();
  });

  async function load() {
    return await import('./feedlog');
  }

  it('returns /feedback in integrated MVP mode by default', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    expect((await load()).getFeedlogUrl()).toBe('/feedback');
  });

  it('returns null when integrated is disabled and env is unset', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = 'false';
    delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    expect((await load()).getFeedlogUrl()).toBeNull();
  });

  it('returns trimmed URL without trailing slashes in external mode', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = 'false';
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com///';
    expect((await load()).getFeedlogUrl()).toBe('https://feedback.example.com');
  });

  it('preserves localhost dev URLs in external mode', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = 'false';
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'http://localhost:3010';
    expect((await load()).getFeedlogUrl()).toBe('http://localhost:3010');
  });
});

describe('getFeedlogFeedbackHref', () => {
  const originalIntegrated = process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
  const originalFeedlog = process.env.NEXT_PUBLIC_FEEDLOG_URL;
  const originalApi = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (originalIntegrated === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    else process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = originalIntegrated;
    if (originalFeedlog === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    else process.env.NEXT_PUBLIC_FEEDLOG_URL = originalFeedlog;
    if (originalApi === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalApi;
    jest.resetModules();
  });

  async function load() {
    return await import('./feedlog');
  }

  it('returns integrated portal path for guests', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: false })).toBe('/feedback');
  });

  it('returns null when external mode has no FeedLog URL', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = 'false';
    delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: false })).toBeNull();
  });

  it('returns portal URL for guests in external mode', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = 'false';
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: false })).toBe(
      'https://feedback.example.com',
    );
  });

  it('returns SSO API path for logged-in users', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1/';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: true, returnTo: '/roadmap' })).toBe(
      'http://localhost:3000/api/v1/feedback/sso?return_to=%2Froadmap',
    );
  });

  it('sanitizes unsafe return_to paths', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect(
      (await load()).getFeedlogFeedbackHref({ isLoggedIn: true, returnTo: '//evil.com' }),
    ).toBe('http://localhost:3000/api/v1/feedback/sso?return_to=%2F');
  });

  it('builds integrated subpaths for roadmap', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/v1';
    expect((await load()).getFeedlogFeedbackHref({ isLoggedIn: false, returnTo: '/roadmap' })).toBe(
      '/feedback/roadmap',
    );
  });
});

describe('isFeedlogSameOrigin', () => {
  const originalIntegrated = process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
  const original = process.env.NEXT_PUBLIC_FEEDLOG_URL;

  afterEach(() => {
    if (originalIntegrated === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    else process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = originalIntegrated;
    if (original === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    else process.env.NEXT_PUBLIC_FEEDLOG_URL = original;
    jest.resetModules();
  });

  it('is same-origin in integrated mode', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED;
    expect((await import('./feedlog')).isFeedlogSameOrigin()).toBe(true);
  });

  it('is external when sibling URL is configured', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_INTEGRATED = 'false';
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com';
    expect((await import('./feedlog')).isFeedlogSameOrigin()).toBe(false);
  });
});
