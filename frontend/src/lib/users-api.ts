import type { PublicUserProfile, UserSearchResult } from '@/types/users';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
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

export function getPublicUserProfile(userId: number) {
  return request<PublicUserProfile>(`/users/${userId}/public-profile`);
}

export function searchUsers(query: string, limit = 10) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit)
  });

  return request<UserSearchResult[]>(`/users/search?${params.toString()}`);
}
