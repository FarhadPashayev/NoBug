import { auth, hasAuthSecret, type Role } from "./index";

export type SessionUser = { id: string; email: string; name: string; role: Role };

/**
 * Server components and route handlers. Never throws: without AUTH_SECRET
 * (or a database) nobody is signed in, and the login page explains why.
 */
export async function getSession(): Promise<SessionUser | null> {
  if (!hasAuthSecret || !process.env.DATABASE_URL) return null;
  try {
    const session = await auth();
    const u = session?.user;
    if (!u?.id) return null;
    return { id: u.id, email: u.email ?? "", name: u.name ?? "", role: u.role ?? "ADMIN" };
  } catch (e) {
    console.error("[auth] session lookup failed:", e);
    return null;
  }
}
