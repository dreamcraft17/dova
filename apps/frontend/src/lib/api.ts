const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshSession(): Promise<boolean> {
  const response = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.ok;
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
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

  return data;
}
