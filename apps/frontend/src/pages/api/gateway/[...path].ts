import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '8mb',
  },
};

const HOP = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade', 'host', 'content-length']);

async function rawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backend = process.env.DOVA_BACKEND_URL?.replace(/\/$/, '');
  const key = process.env.DOVA_INTEGRATION_KEY?.trim();
  if (!backend || !key) {
    res.status(503).json({ message: 'Storefront gateway is not configured', code: 'GATEWAY_UNCONFIGURED' });
    return;
  }

  const parts = req.query.path;
  const suffix = Array.isArray(parts) ? parts.join('/') : parts || '';
  const searchIndex = req.url?.indexOf('?') ?? -1;
  const search = searchIndex >= 0 ? req.url!.slice(searchIndex) : '';
  const url = `${backend}/${suffix}${search}`;

  const headers: Record<string, string> = { 'X-Api-Key': key };
  for (const [name, value] of Object.entries(req.headers)) {
    if (!value || HOP.has(name)) continue;
    if (name === 'x-api-key') continue;
    headers[name] = Array.isArray(value) ? value.join(',') : value;
  }

  const method = req.method || 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : await rawBody(req);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method,
      headers,
      body: body && body.length ? new Uint8Array(body) : undefined,
      redirect: 'manual',
    });
  } catch {
    res.status(502).json({ message: 'Upstream API unreachable', code: 'GATEWAY_BAD_GATEWAY' });
    return;
  }

  res.status(upstream.status);
  upstream.headers.forEach((value, name) => {
    if (name === 'transfer-encoding' || name === 'content-encoding') return;
    res.setHeader(name, value);
  });
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}
