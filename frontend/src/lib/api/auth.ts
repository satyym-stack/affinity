import type {
  AuthUser,
  LoginPayload,
  SignupPayload,
  TokenResponse
} from '@/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const TOKEN_STORAGE_KEY = 'affinity_token';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = 'Request failed.';

    try {
      const data = (await response.json()) as { detail?: string };
      message = data.detail ?? message;
    } catch {
      // Some server errors return plain text instead of JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function signup(payload: SignupPayload) {
  return request<TokenResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function login(payload: LoginPayload) {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(token: string) {
  return request<AuthUser>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
