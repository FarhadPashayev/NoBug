import { NextResponse } from "next/server";
import { prisma, assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { handleError } from "@/lib/admin/api-helpers";
import { LEAD_STATUSES } from "@/lib/admin/schemas";

export const runtime = "nodejs";

/** Read-only inbox. `?format=csv` streams the current filter as a download. */
export async function GET(req: Request) {
  const user = await requireApiUser();
  if (user instanceof NextResponse) return user;
  try {
    assertDatabase();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const where = status && (LEAD_STATUSES as readonly string[]).includes(status) ? { status: status as (typeof LEAD_STATUSES)[number] } : {};
    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 1000 });

    if (url.searchParams.get("format") === "csv") {
      const head = ["Tarix", "Ad", "E-poçt", "Telefon", "Xidmət", "Mesaj", "Dil", "Mənbə", "Status"];
      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv = [
        head.join(","),
        ...leads.map((l) => [l.createdAt.toISOString(), l.name, l.email, l.phone, l.service, l.message, l.locale, l.source, l.status].map(esc).join(",")),
      ].join("\r\n");
      return new NextResponse("﻿" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="nobug-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ leads });
  } catch (e) {
    return handleError(e);
  }
}
