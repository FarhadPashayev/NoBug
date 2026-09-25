import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { auth } from "@/lib/auth";

// Two jobs:
//   1. the public site is locale-prefixed — "/" and "/anket" go to "/az/…"
//   2. /admin is private — everything but the login screen needs a session.
// Proxy runs on the Node.js runtime in Next 16, so Auth.js can look the
// session up in the database here.

const toLogin = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
};

const adminGuard = auth((req) => {
  if (req.nextUrl.pathname === "/admin/login") {
    // signed-in users skip the form
    if (req.auth?.user) return NextResponse.redirect(new URL("/admin", req.nextUrl));
    return NextResponse.next();
  }
  return req.auth?.user ? NextResponse.next() : toLogin(req);
}) as unknown as (req: NextRequest, event: NextFetchEvent) => Promise<Response>;

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    try {
      return await adminGuard(req, event);
    } catch (e) {
      // no AUTH_SECRET / database → nobody is signed in; the login page explains
      console.error("[proxy] auth check failed:", e);
      return pathname === "/admin/login" ? NextResponse.next() : toLogin(req);
    }
  }

  if (isLocale(pathname.split("/")[1])) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
