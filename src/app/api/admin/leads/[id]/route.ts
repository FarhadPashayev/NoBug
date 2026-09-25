import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { leadUpdateSchema } from "@/lib/admin/schemas";
import { handleError, parseBody } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

/** Only status and the internal note are editable — the submission itself is a record. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const { id } = await ctx.params;
    const data = await parseBody(req, leadUpdateSchema);
    const lead = await prisma.lead.update({ where: { id }, data });
    return NextResponse.json({ lead });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const { id } = await ctx.params;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
