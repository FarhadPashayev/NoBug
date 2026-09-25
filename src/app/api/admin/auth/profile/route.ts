import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { profileSchema } from "@/lib/admin/schemas";
import { fail, handleError, parseBody } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await requireApiUser();
  if (session instanceof NextResponse) return session;
  try {
    assertDatabase();
    const data = await parseBody(req, profileSchema);
    const email = data.email.toLowerCase();
    const taken = await prisma.user.findFirst({ where: { email, NOT: { id: session.id } }, select: { id: true } });
    if (taken) return fail("Bu e-poçt artıq istifadə olunur", 409);

    const user = await prisma.user.update({ where: { id: session.id }, data: { name: data.name, email } });
    // the session carries name/email, so it is re-issued on change
    await setSessionCookie(await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role }));
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    return handleError(e);
  }
}
