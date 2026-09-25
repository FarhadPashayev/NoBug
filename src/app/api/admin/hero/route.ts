import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { heroSchema, partnerLogoSchema } from "@/lib/admin/schemas";
import { handleError, parseBody } from "@/lib/admin/api-helpers";
import { z } from "zod";

export const runtime = "nodejs";

const payload = heroSchema.extend({ partnerLogos: z.array(partnerLogoSchema).max(20).default([]) });

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const hero = await prisma.hero.findUnique({ where: { locale: "az" }, include: { partnerLogos: { orderBy: { position: "asc" } } } });
    return NextResponse.json({ hero });
  } catch (e) {
    return handleError(e);
  }
}

/** Upsert the singleton, replacing the logo list in one transaction. */
export async function PUT(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const { partnerLogos, ...data } = await parseBody(req, payload);
    const hero = await prisma.$transaction(async (tx) => {
      const row = await tx.hero.upsert({ where: { locale: data.locale }, create: data, update: data });
      await tx.partnerLogo.deleteMany({ where: { heroId: row.id } });
      if (partnerLogos.length) {
        await tx.partnerLogo.createMany({
          data: partnerLogos.map((l, i) => ({ heroId: row.id, name: l.name, imageUrl: l.imageUrl, href: l.href, position: i })),
        });
      }
      return tx.hero.findUniqueOrThrow({ where: { id: row.id }, include: { partnerLogos: { orderBy: { position: "asc" } } } });
    });
    return NextResponse.json({ hero });
  } catch (e) {
    return handleError(e);
  }
}
