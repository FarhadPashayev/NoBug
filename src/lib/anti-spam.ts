import type { NextRequest } from "next/server";

// Three cheap checks instead of a CAPTCHA (README "Anti-spam without CAPTCHA").

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 3000;

// In-memory store — fine for a single instance. Swap for Redis/Upstash if the
// site is ever deployed to several instances.
const hits = new Map<string, number[]>();

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export function looksLikeBot(honeypot: unknown, openedAt: unknown): boolean {
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
  if (typeof openedAt !== "number" || !Number.isFinite(openedAt)) return true;
  return Date.now() - openedAt < MIN_FILL_MS;
}
