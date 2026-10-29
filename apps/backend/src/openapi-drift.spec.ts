import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { AppController } from './app.controller';
import { DOVA_OPENAPI } from './openapi-spec';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch'];

function registeredRoutes(): Set<string> {
  const routes = new Set<string>();
  const proto = AppController.prototype as unknown as Record<string, unknown>;
  for (const name of Object.getOwnPropertyNames(proto)) {
    const handler = proto[name];
    if (typeof handler !== 'function') continue;
    const method = Reflect.getMetadata(METHOD_METADATA, handler);
    const path = Reflect.getMetadata(PATH_METADATA, handler);
    if (method === undefined || path === undefined) continue;
    const normalized = `/${String(path).replace(/^\/+/, '')}`.replace(/:([A-Za-z]+)/g, '{$1}');
    routes.add(`${HTTP_METHODS[method].toUpperCase()} ${normalized === '/' ? '/' : normalized.replace(/\/$/, '')}`);
  }
  return routes;
}

describe('OpenAPI spec vs registered routes', () => {
  it('documents only operations that exist on AppController', () => {
    const registered = registeredRoutes();
    expect(registered.size).toBeGreaterThan(100);
    const phantom: string[] = [];
    for (const [path, operations] of Object.entries(DOVA_OPENAPI.paths)) {
      for (const method of Object.keys(operations)) {
        if (!registered.has(`${method.toUpperCase()} ${path}`)) phantom.push(`${method.toUpperCase()} ${path}`);
      }
    }
    expect(phantom).toEqual([]);
  });

  it('documents the real success status for every POST (Nest defaults to 201)', () => {
    const wrong: string[] = [];
    for (const [path, operations] of Object.entries(DOVA_OPENAPI.paths)) {
      const post = (operations as Record<string, { responses: Record<string, unknown> }>).post;
      if (post && !('201' in post.responses)) wrong.push(path);
    }
    expect(wrong).toEqual([]);
  });
});
