import type { MapRecomputeResult, MapUser } from '@/types/map';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

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
      // Fall back to the default message when the response has no JSON body.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getMapUsers() {
  return request<MapUser[]>('/map/users');
}

export function recomputeMapPositions(token: string) {
  return request<MapRecomputeResult>('/map/recompute', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
