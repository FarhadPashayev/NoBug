import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/admin/schemas";
import { fail, handleError, parseBody } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireApiUser();
  if (session instanceof NextResponse) return session;
  try {
    assertDatabase();
    const { currentPassword, newPassword } = await parseBody(req, passwordSchema);
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) return fail("Cari şifrə yanlışdır", 401);

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
