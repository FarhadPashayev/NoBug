import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

// Two jobs:
//   1. the public site is locale-prefixed — "/" and "/anket" go to "/az/…"
//   2. /admin is private — everything but the login screen needs a session.
//
// The proxy only checks that a session cookie is present: that is enough to
// bounce anonymous visitors without a database round trip on every
// navigation. The real check (session row, expiry) happens once per render
// in the dashboard layout via requireUser(), and in every server action.

const SESSION_COOKIES = ["__Secure-authjs.session-token", "authjs.session-token"];
const hasSessionCookie = (req: NextRequest) => SESSION_COOKIES.some((name) => Boolean(req.cookies.get(name)?.value));

const toLogin = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    // the login page itself redirects signed-in users after verifying the session
    if (pathname === "/admin/login") return NextResponse.next();
    return hasSessionCookie(req) ? NextResponse.next() : toLogin(req);
  }

  if (isLocale(pathname.split("/")[1])) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
