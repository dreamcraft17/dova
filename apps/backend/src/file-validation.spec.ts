import { BadRequestException } from '@nestjs/common';
import { assertProductImage, assertSupplierDocument } from './file-validation';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('file-validation', () => {
  it('accepts a valid PNG when mime matches content', () => {
    expect(() => assertProductImage(PNG, 'image/png')).not.toThrow();
  });

  it('rejects PNG content with JPEG mime', () => {
    expect(() => assertProductImage(PNG, 'image/jpeg')).toThrow(BadRequestException);
  });

  it('accepts PDF supplier documents', () => {
    const pdf = Buffer.from('%PDF-1.4 smoke');
    expect(() => assertSupplierDocument(pdf, 'application/pdf')).not.toThrow();
  });
});
