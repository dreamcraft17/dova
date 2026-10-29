import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { lookup } from 'dns/promises';
import { assertExternalImageUrl, isPrivateHost, assertProductImage, assertSupplierDocument, extensionForMime, sniffImageMime } from './file-validation';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

export type UploadedFilePayload = { mimetype: string; buffer: Buffer; originalname?: string };

@Injectable()
export class UploadStorageService {
  private readonly uploadRoot: string;
  private readonly publicBase: string;

  constructor() {
    this.uploadRoot = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    const port = process.env.PORT ?? '3000';
    this.publicBase = (process.env.API_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');
  }

  getUploadRoot(): string {
    return this.uploadRoot;
  }

  validateExternalImageUrl(url: string): void {
    assertExternalImageUrl(url);
  }

  /** Keep URLs we already host; otherwise download and store on DOVA (avoids hotlink/CORS issues in the browser). */
  async resolveProductImageUrl(url: string): Promise<string> {
    if (this.isHostedProductImageUrl(url)) return url;
    return this.importProductImageFromUrl(url);
  }

  private isHostedProductImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const base = new URL(this.publicBase);
      return parsed.origin === base.origin && parsed.pathname.startsWith('/uploads/products/');
    } catch {
      return false;
    }
  }

  /** One fetch hop that refuses private/internal targets; redirects are followed by the caller so every hop is re-checked. */
  private async fetchPublic(url: string, signal: AbortSignal): Promise<Response> {
    assertExternalImageUrl(url);
    const host = new URL(url).hostname.replace(/^\[|\]$/g, '');
    try {
      const addresses = await lookup(host, { all: true });
      if (addresses.some((entry) => isPrivateHost(entry.address))) {
        throw new BadRequestException('Image URL must point to a public host');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      // Unresolvable host: fetch below fails on its own with the generic message.
    }
    return fetch(url, {
      signal,
      redirect: 'manual',
      headers: {
        Accept: 'image/jpeg,image/png,image/webp,*/*',
        'User-Agent': 'DOVA-ProductImageImport/1.0',
      },
    });
  }

  async importProductImageFromUrl(url: string): Promise<string> {
    assertExternalImageUrl(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      let response = await this.fetchPublic(url, controller.signal);
      for (let hop = 0; hop < MAX_REDIRECTS && response.status >= 300 && response.status < 400; hop += 1) {
        const location = response.headers.get('location');
        if (!location) break;
        response = await this.fetchPublic(new URL(location, url).toString(), controller.signal);
      }
      if (!response.ok) {
        throw new BadRequestException(`Could not download image (HTTP ${response.status}). Try “Add images” from your phone instead.`);
      }
      const lengthHeader = Number(response.headers.get('content-length') || 0);
      if (lengthHeader > MAX_IMAGE_BYTES) {
        throw new BadRequestException('Image is larger than 5 MB');
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > MAX_IMAGE_BYTES) {
        throw new BadRequestException('Image is larger than 5 MB');
      }
      const detected = sniffImageMime(buffer);
      if (!detected) {
        throw new BadRequestException('Link must point to a JPG, PNG, or WEBP image file');
      }
      assertProductImage(buffer, detected);
      return this.saveProductImage({ mimetype: detected, buffer });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Could not fetch image from that link. Upload from your gallery or paste a direct image URL (ending in .jpg, .png, or .webp).',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async saveProductImage(file: UploadedFilePayload): Promise<string> {
    assertProductImage(file.buffer, file.mimetype);
    const ext = extensionForMime(file.mimetype);
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(this.uploadRoot, 'products');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);
    return `${this.publicBase}/uploads/products/${filename}`;
  }

  async saveSupplierDocument(file: UploadedFilePayload): Promise<string> {
    assertSupplierDocument(file.buffer, file.mimetype);
    const ext = extensionForMime(file.mimetype);
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(this.uploadRoot, 'supplier-docs');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);
    return `${this.publicBase}/uploads/supplier-docs/${filename}`;
  }
}
