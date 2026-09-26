import { readFileSync } from "node:fs";

export const base = `http://localhost:${process.env.TEST_PORT ?? "3400"}`;
let ipCounter = 0;
/** Each test gets its own fake client IP so the 5/hour limiter never bleeds between tests. */
export const freshIp = () => `203.0.113.${(ipCounter++ % 250) + 1}`;

export async function postLead(body: Record<string, unknown>, ip = freshIp()) {
  const res = await fetch(`${base}/api/leads`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

export const contact = (over: Record<string, unknown> = {}) => ({ source: "contact", name: "API Test", email: "api@example.com", subject: "API sorğu", lang: "az", website: "", openedAt: Date.now() - 10_000, ...over });

/** Session cookie for the admin, obtained through the real login route. */
export async function adminCookie() {
  const res = await fetch(`${base}/api/admin/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

export function fixture(name: string, type: string) {
  const buf = readFileSync(`tests/fixtures/${name}`);
  return new File([buf], name, { type });
}

export async function upload(file: File, folder = "projects", cookie?: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch(`${base}/api/admin/upload`, { method: "POST", body: fd, headers: cookie ? { cookie } : {} });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, string> };
}
