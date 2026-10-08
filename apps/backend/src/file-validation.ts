import { BadRequestException } from '@nestjs/common';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOC_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

function isWebp(buffer: Buffer): boolean {
  return startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && buffer.length >= 12
    && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
}

function detectImageMime(buffer: Buffer): string | undefined {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (isWebp(buffer)) return 'image/webp';
  return undefined;
}

function detectDocMime(buffer: Buffer): string | undefined {
  const image = detectImageMime(buffer);
  if (image) return image;
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  return undefined;
}

export function assertProductImage(buffer: Buffer, claimedMime: string): void {
  if (!buffer?.length) throw new BadRequestException('Image file is empty');
  if (!IMAGE_MIMES.has(claimedMime)) {
    throw new BadRequestException('Image must be JPG, PNG, or WEBP');
  }
  const detected = detectImageMime(buffer);
  if (!detected || detected !== claimedMime) {
    throw new BadRequestException('Image content does not match declared file type');
  }
}

export function assertSupplierDocument(buffer: Buffer, claimedMime: string): void {
  if (!buffer?.length) throw new BadRequestException('Document file is empty');
  if (!DOC_MIMES.has(claimedMime)) {
    throw new BadRequestException('Document must be PDF, JPG, or PNG');
  }
  const detected = detectDocMime(buffer);
  if (!detected || detected !== claimedMime) {
    throw new BadRequestException('Document content does not match declared file type');
  }
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'application/pdf': return 'pdf';
    default: throw new BadRequestException('Unsupported file type');
  }
}

export function assertExternalImageUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new BadRequestException('Image URL must be a valid http(s) URL');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BadRequestException('Image URL must use http or https');
  }
}
