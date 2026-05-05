export type ThoughtStatus = 'draft' | 'published';
export type ThoughtVisibility = 'private' | 'public';

export type Thought = {
  id: number;
  user_id: number;
  content: string;
  status: ThoughtStatus;
  visibility: ThoughtVisibility;
  prompt_source: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicThought = Thought & {
  username: string;
  display_name: string;
};

type CreateThoughtPayload = {
  content: string;
  status: ThoughtStatus;
  visibility: ThoughtVisibility;
  prompt_source?: string | null;
};

type UpdateThoughtPayload = {
  content?: string;
  status?: ThoughtStatus;
  visibility?: ThoughtVisibility;
  prompt_source?: string | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { token, headers, ...requestInit } = init ?? {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {})
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

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function createThought(payload: CreateThoughtPayload, token: string) {
  return request<Thought>('/thoughts', {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  });
}

export function listMyThoughts(token: string) {
  return request<Thought[]>('/thoughts/me', { token });
}

export function listPublicThoughts(limit = 20) {
  return request<PublicThought[]>(`/thoughts/public?limit=${limit}`);
}

export function updateThought(
  thoughtId: number,
  payload: UpdateThoughtPayload,
  token: string
) {
  return request<Thought>(`/thoughts/${thoughtId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload)
  });
}

export function deleteThought(thoughtId: number, token: string) {
  return request<void>(`/thoughts/${thoughtId}`, {
    method: 'DELETE',
    token
  });
}
