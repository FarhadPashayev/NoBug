import { NextResponse } from "next/server";
import { z } from "zod";
import { DatabaseNotConfiguredError } from "@/lib/db";

/** Uniform JSON errors so the client can always read `error`. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(e: unknown) {
  if (e instanceof DatabaseNotConfiguredError) return fail("Verilənlər bazası qoşulmayıb (DATABASE_URL)", 503);
  if (e instanceof z.ZodError) return NextResponse.json({ error: "Doğrulama xətası", issues: z.treeifyError(e) }, { status: 422 });
  console.error("[admin api]", e);
  return fail("Gözlənilməz xəta", 500);
}

/** Parse a JSON body against a schema, throwing ZodError for handleError. */
export async function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  const raw = await req.json().catch(() => {
    throw new Error("Invalid JSON");
  });
  return schema.parse(raw);
}
