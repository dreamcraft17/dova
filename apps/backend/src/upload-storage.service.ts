import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { assertExternalImageUrl, assertProductImage, assertSupplierDocument, extensionForMime } from './file-validation';

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
