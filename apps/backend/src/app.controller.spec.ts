import { AppController } from './app.controller';
import { DOVA_OPENAPI } from './openapi-spec';

describe('AppController discovery', () => {
  const controller = new AppController({} as never, {} as never, {} as never);

  it('returns API index with health and OpenAPI URLs', () => {
    expect(controller.apiIndex()).toEqual({
      service: 'dova-api',
      version: 'v1',
      health: '/api/v1/health',
      openapi: '/api/v1/openapi.json',
    });
  });

  it('returns liveness payload', () => {
    expect(controller.health()).toEqual({ status: 'ok', service: 'dova-api' });
  });

  it('serves the OpenAPI document', () => {
    expect(controller.openapi()).toBe(DOVA_OPENAPI);
  });
});
