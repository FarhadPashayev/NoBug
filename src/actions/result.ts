// Shared shape for every server action: the client shows `error` in a toast
// and maps `fieldErrors` back onto the form. This file is imported by client
// components too, so it must stay free of server-only imports (see run.ts).
export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Client helper: unwrap or throw so useMutation's onError gets the message. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data;
  const err = new Error(result.error) as Error & { fieldErrors?: Record<string, string> };
  err.fieldErrors = result.fieldErrors;
  throw err;
}
