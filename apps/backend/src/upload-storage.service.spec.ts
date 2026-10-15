import { mkdtemp, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { UploadStorageService } from './upload-storage.service';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('UploadStorageService', () => {
  it('stores product images on disk and returns a public uploads URL', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dova-upload-'));
    process.env.UPLOAD_DIR = dir;
    process.env.API_PUBLIC_URL = 'https://api.example.test';

    const storage = new UploadStorageService();
    const url = await storage.saveProductImage({ mimetype: 'image/png', buffer: PNG });

    expect(url).toMatch(/^https:\/\/api\.example\.test\/uploads\/products\/[a-f0-9-]+\.png$/);
    const filename = url.split('/').pop()!;
    const saved = await readFile(join(dir, 'products', filename));
    expect(saved.equals(PNG)).toBe(true);

    delete process.env.UPLOAD_DIR;
    delete process.env.API_PUBLIC_URL;
  });

  it('imports external image URLs and stores them locally', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dova-upload-'));
    process.env.UPLOAD_DIR = dir;
    process.env.API_PUBLIC_URL = 'https://api.example.test';

    const storage = new UploadStorageService();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(PNG, { status: 200, headers: { 'content-type': 'image/png' } }),
    );

    const url = await storage.importProductImageFromUrl('https://cdn.example.test/photo.png');
    expect(url).toMatch(/^https:\/\/api\.example\.test\/uploads\/products\//);
    expect(fetchMock).toHaveBeenCalled();

    fetchMock.mockRestore();
    delete process.env.UPLOAD_DIR;
    delete process.env.API_PUBLIC_URL;
  });
});
