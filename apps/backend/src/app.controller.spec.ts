import { AppController } from './app.controller';
import { DOVA_OPENAPI } from './openapi-spec';
import type { ProductDto } from './auth.dto';

function makeUploadsDouble() {
  let counter = 0;
  return {
    saveProductImage: jest.fn(async () => `https://cdn.example.com/uploaded-${++counter}.jpg`),
    validateExternalImageUrl: jest.fn(),
    resolveProductImageUrl: jest.fn(async (url: string) => url),
  };
}

describe('AppController discovery', () => {
  const controller = new AppController({} as never, {} as never, {} as never, {} as never, {} as never, {} as never);

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

describe('AppController product image merging', () => {
  function makeController(uploads = makeUploadsDouble()) {
    const controller = new AppController({} as never, {} as never, {} as never, {} as never, uploads as never, {} as never);
    return { controller, uploads };
  }

  function callApplyProductImages(controller: AppController, body: Partial<ProductDto>, files?: { image?: unknown[]; images?: unknown[] }) {
    return (controller as any).applyProductImages(body, files);
  }

  it('uses a single legacy-field upload as the only image', async () => {
    const { controller, uploads } = makeController();
    const result = await callApplyProductImages(controller, {}, { image: [{ mimetype: 'image/jpeg', buffer: Buffer.from('x') }] });
    expect(uploads.saveProductImage).toHaveBeenCalledTimes(1);
    expect(result.imageUrls).toHaveLength(1);
    expect(result.imageUrl).toBe(result.imageUrls[0]);
  });

  it('merges kept external URLs with newly uploaded files, cover first', async () => {
    const { controller, uploads } = makeController();
    const body: Partial<ProductDto> = { imageUrls: ['https://cdn.example.com/kept-1.jpg', 'https://cdn.example.com/kept-2.jpg'] };
    const result = await callApplyProductImages(controller, body, { images: [{ mimetype: 'image/png', buffer: Buffer.from('y') }] });
    expect(result.imageUrls).toEqual([
      'https://cdn.example.com/kept-1.jpg',
      'https://cdn.example.com/kept-2.jpg',
      'https://cdn.example.com/uploaded-1.jpg',
    ]);
    expect(result.imageUrl).toBe('https://cdn.example.com/kept-1.jpg');
    expect(uploads.resolveProductImageUrl).toHaveBeenCalledTimes(2);
  });

  it('falls back to the legacy single imageUrl field when imageUrls is absent', async () => {
    const { controller, uploads } = makeController();
    const result = await callApplyProductImages(controller, { imageUrl: 'https://cdn.example.com/legacy.jpg' }, {});
    expect(result.imageUrls).toEqual(['https://cdn.example.com/legacy.jpg']);
    expect(result.imageUrl).toBe('https://cdn.example.com/legacy.jpg');
    expect(uploads.saveProductImage).not.toHaveBeenCalled();
  });

  it('caps the merged gallery at MAX_PRODUCT_IMAGES', async () => {
    const { controller } = makeController();
    const kept = Array.from({ length: 5 }, (_, i) => `https://cdn.example.com/kept-${i}.jpg`);
    const newFiles = Array.from({ length: 4 }, () => ({ mimetype: 'image/jpeg', buffer: Buffer.from('z') }));
    const result = await callApplyProductImages(controller, { imageUrls: kept }, { images: newFiles });
    expect(result.imageUrls).toHaveLength(6);
    expect(result.imageUrls.slice(0, 5)).toEqual(kept);
  });

  it('produces no images when nothing is kept or uploaded', async () => {
    const { controller } = makeController();
    const result = await callApplyProductImages(controller, {}, {});
    expect(result.imageUrls).toEqual([]);
    expect(result.imageUrl).toBeUndefined();
  });
});
