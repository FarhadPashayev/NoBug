import { NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { hasAuthSecret, signIn } from "@/lib/auth";
import { assertDatabase } from "@/lib/db";
import { loginSchema } from "@/schemas/auth";
import { fail, handleError, parseBody } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

// JSON front door for the login form; Auth.js does the actual sign-in and
// sets the session cookie. A few failed attempts per IP per window.
const attempts = new Map<string, number[]>();
const WINDOW = 15 * 60 * 1000;
const MAX = 8;

export async function POST(req: Request) {
  try {
    assertDatabase();
    if (!hasAuthSecret) return fail("AUTH_SECRET təyin olunmayıb", 503);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const now = Date.now();
    const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW);
    if (recent.length >= MAX) return fail("Çox sayda cəhd. 15 dəqiqə sonra yenidən yoxlayın.", 429);

    const { email, password } = await parseBody(req, loginSchema);
    try {
      await signIn("credentials", { email, password, redirect: false });
    } catch (e) {
      if (e instanceof AuthError) {
        attempts.set(ip, [...recent, now]);
        // one message for both cases: never reveal whether the address exists
        return fail("E-poçt və ya şifrə yanlışdır", 401);
      }
      throw e;
    }
    attempts.delete(ip);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
