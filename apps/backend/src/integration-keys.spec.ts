import { integrationKeyMatches, parseIntegrationKeyHashes } from './integration-keys';

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
});
