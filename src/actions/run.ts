import { z } from "zod";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { requireActionUser } from "@/lib/auth/guard";
import type { ActionResult } from "./result";

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const failed = (error: string): ActionResult<never> => ({ ok: false, error });

/** Throw inside an action to send a specific message to the user. */
export class ActionError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ActionError";
    this.fieldErrors = fieldErrors;
  }
}

/** Session check + error translation around an action body (server only). */
export async function guarded<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    await requireActionUser();
    return ok(await fn());
  } catch (e) {
    if (e instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of e.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
      return { ok: false, error: "Formda xəta var", fieldErrors };
    }
    if (e instanceof DatabaseNotConfiguredError) return failed("Verilənlər bazası qoşulmayıb (DATABASE_URL)");
    if (e instanceof ActionError) return { ok: false, error: e.message, fieldErrors: e.fieldErrors };
    console.error("[action]", e);
    return failed(e instanceof Error && /Sessiya/.test(e.message) ? e.message : "Gözlənilməz xəta");
  }
}
