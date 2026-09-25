import { hasDatabase, prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Store an enquiry in the panel's inbox. Best-effort: the email is the system
 * of record today, so a database problem must never fail the visitor's form.
 */
export async function recordLead(input: {
  name: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  locale?: string;
  source: "anket" | "contact";
  answers?: Record<string, unknown>;
}) {
  if (!hasDatabase) return;
  try {
    await prisma.lead.create({
      data: {
        name: input.name,
        email: input.email ?? "",
        phone: input.phone ?? "",
        service: input.service ?? "",
        message: input.message ?? "",
        locale: input.locale ?? "az",
        source: input.source,
        answers: (input.answers ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (e) {
    console.error("[leads] could not record:", e);
  }
}
