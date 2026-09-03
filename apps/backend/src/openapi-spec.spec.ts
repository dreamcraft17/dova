import { DOVA_OPENAPI } from './openapi-spec';

describe('DOVA_OPENAPI', () => {
  it('is OpenAPI 3.0 with production and local servers under /api/v1', () => {
    expect(DOVA_OPENAPI.openapi).toBe('3.0.3');
    expect(DOVA_OPENAPI.info.title).toBe('DOVA Marketplace API');
    expect(DOVA_OPENAPI.servers.map((s) => s.url)).toEqual([
      'https://api.dova.dntech.id/api/v1',
      'http://localhost:3000/api/v1',
    ]);
  });

  it('documents discovery, catalog, auth, cart, orders, and payments paths', () => {
    expect(Object.keys(DOVA_OPENAPI.paths)).toEqual(
      expect.arrayContaining([
        '/',
        '/health',
        '/openapi.json',
        '/categories',
        '/auth/login',
        '/cart',
        '/orders',
        '/payments/initialize',
      ]),
    );
  });
});
