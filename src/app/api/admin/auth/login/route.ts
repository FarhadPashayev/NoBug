import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/admin/schemas";
import { fail, handleError, parseBody } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

// Crude but effective: a few failed attempts per IP per window.
const attempts = new Map<string, number[]>();
const WINDOW = 15 * 60 * 1000;
const MAX = 8;

export async function POST(req: Request) {
  try {
    assertDatabase();
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return fail("AUTH_SECRET təyin olunmayıb", 503);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const now = Date.now();
    const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW);
    if (recent.length >= MAX) return fail("Çox sayda cəhd. 15 dəqiqə sonra yenidən yoxlayın.", 429);

    const { email, password } = await parseBody(req, loginSchema);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const ok = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !ok) {
      attempts.set(ip, [...recent, now]);
      // one message for both cases: never reveal whether the address exists
      return fail("E-poçt və ya şifrə yanlışdır", 401);
    }

    attempts.delete(ip);
    const token = await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    await setSessionCookie(token);
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    return handleError(e);
  }
}
