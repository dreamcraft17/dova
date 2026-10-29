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

export function sniffImageMime(buffer: Buffer): string | undefined {
  return detectImageMime(buffer);
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
  if (isPrivateHost(parsed.hostname)) {
    throw new BadRequestException('Image URL must point to a public host');
  }
}

/** Literal-host check (loopback, RFC1918, link-local incl. cloud metadata, IPv6 local). DNS names are re-checked after resolution by assertPublicHostname. */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) return true;
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (host.includes(':')) {
    const mapped = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isPrivateHost(mapped[1]);
    return host === '::' || host === '::1' || /^f[cd]/.test(host) || /^fe[89ab]/.test(host);
  }
  return false;
}
