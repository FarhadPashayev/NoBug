"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { passwordSchema, profileSchema } from "@/schemas/auth";
import { ActionError, guarded } from "./run";

export async function updateProfile(input: unknown) {
  return guarded(async () => {
    const user = (await getSession())!;
    const data = profileSchema.parse(input);
    const email = data.email.toLowerCase();
    const taken = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } }, select: { id: true } });
    if (taken) throw new ActionError("Bu e-poçt artıq istifadə olunur");
    await prisma.user.update({ where: { id: user.id }, data: { name: data.name, email } });
    revalidatePath("/admin", "layout");
    return null;
  });
}

export async function changePassword(input: unknown) {
  return guarded(async () => {
    const user = (await getSession())!;
    const data = passwordSchema.parse(input);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await verifyPassword(data.currentPassword, row.passwordHash))) throw new ActionError("Cari şifrə yanlışdır");
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(data.newPassword) } });
    // every other device is signed out; this one keeps its current session row
    const current = await prisma.session.findFirst({ where: { userId: user.id }, orderBy: { expires: "desc" }, select: { id: true } });
    await prisma.session.deleteMany({ where: { userId: user.id, NOT: current ? { id: current.id } : undefined } });
    return null;
  });
}
