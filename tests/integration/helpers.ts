import { vi } from "vitest";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

// Session is mocked at module level in every integration file:
//   vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
export async function signInAsAdmin() {
  const user = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  vi.mocked(getSession).mockResolvedValue({ id: user.id, email: user.email, name: user.name, role: "ADMIN" });
  return user;
}
export function signOut() {
  vi.mocked(getSession).mockResolvedValue(null);
}
export const L = (az: string, en = "", ru = "") => ({ az, en, ru });
export const noImage: { url: string | null; path: string | null } = { url: null, path: null };
export { prisma };
