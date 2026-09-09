import { frontendOrigins, integrationKeyMatches, isInternalFrontendRequest, parseIntegrationKeyHashes } from './integration-keys';

describe('integration-keys', () => {
  it('parses named secrets', () => {
    const hashes = parseIntegrationKeyHashes('storefront:aaa,partner:bbb');
    expect(hashes).toHaveLength(2);
    expect(integrationKeyMatches('aaa', hashes)).toBe(true);
    expect(integrationKeyMatches('bbb', hashes)).toBe(true);
    expect(integrationKeyMatches('aaa ', hashes)).toBe(true);
    expect(integrationKeyMatches('ccc', hashes)).toBe(false);
  });

  it('treats empty env as no secrets', () => {
    expect(parseIntegrationKeyHashes('')).toEqual([]);
    expect(parseIntegrationKeyHashes(undefined)).toEqual([]);
    expect(integrationKeyMatches('aaa', [])).toBe(false);
  });

  it('treats the storefront Origin as internal', () => {
    const env = { FRONTEND_URL: 'https://dova.dntech.id,http://localhost:3001' };
    expect(frontendOrigins(env)).toEqual(['https://dova.dntech.id', 'http://localhost:3001']);
    expect(isInternalFrontendRequest({ origin: 'https://dova.dntech.id' }, env)).toBe(true);
    expect(isInternalFrontendRequest({ referer: 'https://dova.dntech.id/auth/login' }, env)).toBe(true);
    expect(isInternalFrontendRequest({ origin: 'https://evil.example' }, env)).toBe(false);
    expect(isInternalFrontendRequest({}, env)).toBe(false);
  });
});
