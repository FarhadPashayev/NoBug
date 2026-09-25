import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Session = a signed JWT in an httpOnly cookie. No third-party provider: the
 * panel has a handful of staff accounts, and this keeps the deployment to one
 * env var (AUTH_SECRET).
 */
export const SESSION_COOKIE = "nobug.admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export type SessionUser = { id: string; email: string; name: string; role: "ADMIN" | "EDITOR" };

function secretOrNull() {
  const value = process.env.AUTH_SECRET;
  return value && value.length >= 32 ? new TextEncoder().encode(value) : null;
}

/** Signing requires the secret; the login route turns this into a 503. */
function secret() {
  const key = secretOrNull();
  if (!key) throw new Error("AUTH_SECRET is missing or shorter than 32 characters");
  return key;
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function readSessionToken(token: string | undefined): Promise<SessionUser | null> {
  const key = secretOrNull();
  // no secret configured → nobody is signed in; never throw here, this runs in
  // the proxy on every /admin request
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return { id: String(payload.sub), email: String(payload.email), name: String(payload.name), role: payload.role === "EDITOR" ? "EDITOR" : "ADMIN" };
  } catch {
    return null;
  }
}

/** Server components and route handlers. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Proxy (edge) — takes the request because cookies() is not available there. */
export const getSessionFromRequest = (req: NextRequest) => readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
