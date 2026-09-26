"use client";

import { fetchWithTimeout } from "@/lib/fetch";

/** Thin fetch wrapper: 20 s timeout, throws with the API's message so TanStack Query surfaces it. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      ...init,
      timeoutMs: 20_000,
      headers: init?.body instanceof FormData ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (e) {
    throw new Error(e instanceof Error && e.name === "TimeoutError" ? "Server cavab vermir — internet bağlantısını yoxlayın" : "Şəbəkə xətası — internet bağlantısını yoxlayın");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Xəta (${res.status})`);
  return json as T;
}

export const jsonBody = (data: unknown) => JSON.stringify(data);
