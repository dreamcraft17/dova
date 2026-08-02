describe('getFeedlogUrl', () => {
  const original = process.env.NEXT_PUBLIC_FEEDLOG_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    else process.env.NEXT_PUBLIC_FEEDLOG_URL = original;
    jest.resetModules();
  });

  async function load() {
    return (await import('./feedlog')).getFeedlogUrl;
  }

  it('returns null when env is unset or blank', async () => {
    delete process.env.NEXT_PUBLIC_FEEDLOG_URL;
    expect((await load())()).toBeNull();

    process.env.NEXT_PUBLIC_FEEDLOG_URL = '   ';
    expect((await load())()).toBeNull();
  });

  it('returns trimmed URL without trailing slashes', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'https://feedback.example.com///';
    expect((await load())()).toBe('https://feedback.example.com');
  });

  it('preserves localhost dev URLs', async () => {
    process.env.NEXT_PUBLIC_FEEDLOG_URL = 'http://localhost:3010';
    expect((await load())()).toBe('http://localhost:3010');
  });
});
