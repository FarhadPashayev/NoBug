"use server";

import { revalidatePath } from "next/cache";
import { prisma, hasDatabase } from "@/lib/db";
import { seedAdmin, seedContent } from "@/lib/seed";
import { revalidateSite } from "./revalidate";

/**
 * First run on a fresh database: creates the admin account from
 * ADMIN_EMAIL / ADMIN_PASSWORD and copies the site's current content in.
 * Only works while the users table is empty, so it can never be used to
 * reset an existing installation. Not wrapped in `guarded` — there is no
 * user to guard with yet.
 */
export async function bootstrapPanel(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!hasDatabase) return { ok: false, error: "DATABASE_URL təyin olunmayıb" };
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return { ok: false, error: "ADMIN_EMAIL və ADMIN_PASSWORD təyin olunmayıb" };
    if ((await prisma.user.count()) > 0) return { ok: false, error: "Panel artıq quraşdırılıb" };
    await seedAdmin(prisma, { email, password, name: process.env.ADMIN_NAME });
    await seedContent(prisma);
    revalidateSite("/anket");
    revalidatePath("/admin/login");
    return { ok: true };
  } catch (e) {
    console.error("[bootstrap]", e);
    const msg = e instanceof Error ? e.message : "Gözlənilməz xəta";
    return { ok: false, error: /does not exist|relation/i.test(msg) ? "Cədvəllər yaradılmayıb — əvvəlcə `npm run db:push` işlədin" : msg };
  }
}

/** Login page: show the bootstrap card only while no account exists. */
export async function needsBootstrap(): Promise<boolean> {
  if (!hasDatabase) return false;
  try {
    return (await prisma.user.count()) === 0;
  } catch {
    return false;
  }
}
