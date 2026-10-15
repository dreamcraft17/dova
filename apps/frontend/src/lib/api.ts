import { authHeaders, clearTokens, getRefreshToken, isRememberMe, setTokens } from './auth-session';

/** Same-origin gateway avoids cross-origin fetch failures (mobile/CORS/cookies) on the storefront domain. */
export function resolveApiBase(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || '/api/gateway').replace(/\/$/, '');
  if (typeof window === 'undefined') return configured;
  if (configured.startsWith('http')) {
    try {
      const target = new URL(configured);
      if (target.origin !== window.location.origin) {
        return '/api/gateway';
      }
    } catch {
      return '/api/gateway';
    }
  }
  return configured.startsWith('/') ? configured : `/${configured}`;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type AuthPayload = { accessToken?: string; refreshToken?: string };

function parseErrorPayload(data: Record<string, unknown>) {
  const nested = data.message;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const payload = nested as Record<string, unknown>;
    return {
      message: typeof payload.message === 'string' ? payload.message : 'Request failed',
      code: typeof payload.code === 'string' ? payload.code : undefined,
    };
  }
  return {
    message:
      typeof data.message === 'string'
        ? data.message
        : typeof data.error === 'string'
          ? data.error
          : 'Request failed',
    code: typeof data.code === 'string' ? data.code : undefined,
  };
}

const AUTH_NO_RETRY = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/send-registration-code',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/change-password',
  '/auth/refresh',
]);

let pendingRememberMe: boolean | undefined;

export function configureLoginPersistence(rememberMe: boolean) {
  pendingRememberMe = rememberMe;
}

function persistAuthTokens(path: string, data: unknown) {
  if (!data || typeof data !== 'object') return;
  const payload = data as AuthPayload;
  if (path === '/auth/logout') {
    clearTokens();
    return;
  }
  if (payload.accessToken) {
    const remember =
      path === '/auth/login' || path === '/auth/verify-otp' ? pendingRememberMe : undefined;
    setTokens(payload.accessToken, payload.refreshToken, remember);
    pendingRememberMe = undefined;
  }
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  const response = await fetch(`${resolveApiBase()}/auth/refresh`, {
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
  if (data.accessToken) setTokens(data.accessToken, data.refreshToken, isRememberMe() ? true : undefined);
  return Boolean(data.accessToken);
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  let body = options.body;
  if (path === '/auth/logout' && !body) {
    const refreshToken = getRefreshToken();
    if (refreshToken) body = JSON.stringify({ refreshToken });
  }
  const base = resolveApiBase();
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      body,
      credentials: 'include',
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError(
      'Cannot reach the server. Check your connection, or ask support to verify the storefront API gateway (Publish Product / save).',
      0,
      'NETWORK_ERROR',
    );
  }
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !retried && !AUTH_NO_RETRY.has(path)) {
    const refreshed = await refreshSession();
    if (refreshed) return api<T>(path, options, true);
  }

  if (!response.ok) {
    const { message, code } = parseErrorPayload(data as Record<string, unknown>);
    throw new ApiError(message, response.status, code);
  }

  persistAuthTokens(path, data);
  return data;
}
