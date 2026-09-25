import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";

/** Server components: redirect to the login screen when signed out. */
export async function requireUser(next = "/admin"): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Route handlers: `const user = await requireApiUser(); if (user instanceof NextResponse) return user;` */
export async function requireApiUser(): Promise<SessionUser | NextResponse> {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return user;
}

/** Server actions: throw so the caller's try/catch turns it into a toast. */
export async function requireActionUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("Sessiya bitib — yenidən daxil olun");
  return user;
}
