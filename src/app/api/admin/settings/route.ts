import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { settingsSchema } from "@/lib/admin/schemas";
import { handleError, parseBody } from "@/lib/admin/api-helpers";

export const runtime = "nodejs";

const SINGLETON = "singleton";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const settings = await prisma.siteSettings.findUnique({ where: { id: SINGLETON }, include: { footerLinks: { orderBy: [{ column: "asc" }, { position: "asc" }] } } });
    return NextResponse.json({ settings });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const { footerLinks, ...data } = await parseBody(req, settingsSchema);
    const settings = await prisma.$transaction(async (tx) => {
      await tx.siteSettings.upsert({ where: { id: SINGLETON }, create: { id: SINGLETON, ...data }, update: data });
      await tx.footerLink.deleteMany({ where: { settingsId: SINGLETON } });
      if (footerLinks.length) {
        await tx.footerLink.createMany({
          data: footerLinks.map((l, i) => ({ settingsId: SINGLETON, column: l.column, label: l.label, href: l.href, position: i })),
        });
      }
      return tx.siteSettings.findUniqueOrThrow({ where: { id: SINGLETON }, include: { footerLinks: { orderBy: [{ column: "asc" }, { position: "asc" }] } } });
    });
    return NextResponse.json({ settings });
  } catch (e) {
    return handleError(e);
  }
}
