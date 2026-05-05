import type { NearbyUser } from '@/types/matching';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
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

export function getNearbyUsers(token: string, limit = 10) {
  return request<NearbyUser[]>(`/matching/nearby?limit=${limit}`, token);
}
