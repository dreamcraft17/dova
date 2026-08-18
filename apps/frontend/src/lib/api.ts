import { authHeaders, clearTokens, getRefreshToken, setTokens } from './auth-session';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthPayload = { accessToken?: string; refreshToken?: string };

function persistAuthTokens(path: string, data: unknown) {
  if (!data || typeof data !== 'object') return;
  const payload = data as AuthPayload;
  if (path === '/auth/logout') {
    clearTokens();
    return;
  }
  if (payload.accessToken) {
    setTokens(payload.accessToken, payload.refreshToken);
  }
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  const response = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });
  if (!response.ok) {
    clearTokens();
    return false;
  }
  const data = (await response.json().catch(() => ({}))) as AuthPayload;
  if (data.accessToken) setTokens(data.accessToken, data.refreshToken);
  return Boolean(data.accessToken);
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  let body = options.body;
  if (path === '/auth/logout' && !body) {
    const refreshToken = getRefreshToken();
    if (refreshToken) body = JSON.stringify({ refreshToken });
  }
  const response = await fetch(`${API}${path}`, {
    ...options,
    body,
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !retried && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed) return api<T>(path, options, true);
  }

  if (!response.ok) {
    const message = data.message || data.error || 'Request failed';
    throw new ApiError(message, response.status);
  }

  persistAuthTokens(path, data);
  return data;
}
