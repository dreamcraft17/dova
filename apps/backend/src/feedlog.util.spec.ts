import {
  buildFeedlogSsoRedirectUrl,
  sanitizeFeedlogReturnTo,
  signFeedlogSsoJwt,
} from './feedlog.util';

describe('feedlog.util', () => {
  const secret = 'a'.repeat(64);

  it('signs HS256 JWT with email, name, exp', () => {
    const token = signFeedlogSsoJwt(
      { email: 'user@dova.local', name: 'Demo User', exp: 1_700_000_000 },
      secret,
    );
    const [header, body, sig] = token.split('.');
    expect(header).toBeTruthy();
    expect(body).toBeTruthy();
    expect(sig).toBeTruthy();
    expect(JSON.parse(Buffer.from(body!, 'base64url').toString())).toEqual({
      email: 'user@dova.local',
      name: 'Demo User',
      exp: 1_700_000_000,
    });
  });

  it('sanitizes unsafe return_to values', () => {
    expect(sanitizeFeedlogReturnTo('/roadmap')).toBe('/roadmap');
    expect(sanitizeFeedlogReturnTo('//evil.com')).toBe('/');
    expect(sanitizeFeedlogReturnTo('https://evil.com')).toBe('/');
    expect(sanitizeFeedlogReturnTo(undefined)).toBe('/');
  });

  it('builds SSO redirect when secret is set', () => {
    const url = buildFeedlogSsoRedirectUrl(
      { email: 'supplier@dova.local', fullName: 'Demo Supplier' },
      {
        baseUrl: 'https://feedback.dova.example/',
        secret,
        returnTo: '/roadmap',
        now: 1_700_000_000,
        ttlSeconds: 300,
      },
    );
    expect(url.startsWith('https://feedback.dova.example/api/sso/jwt?')).toBe(true);
    expect(url).toContain('return_to=%2Froadmap');
    expect(url).toContain('jwt=');
  });

  it('falls back to plain portal URL without SSO secret', () => {
    const url = buildFeedlogSsoRedirectUrl(
      { email: 'user@dova.local', fullName: 'User' },
      { baseUrl: 'https://feedback.dova.example', secret: '' },
    );
    expect(url).toBe('https://feedback.dova.example');
  });
});
