"use client";

/** Thin fetch wrapper: throws with the API's message so TanStack Query surfaces it. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Xəta (${res.status})`);
  return json as T;
}

export const jsonBody = (data: unknown) => JSON.stringify(data);
