import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { applySecurityHeaders } from "@/lib/security-headers";

// Three jobs, on every non-static request:
//   1. the canonical host is www.nobug.az — the apex and the Vercel preview
//      host redirect (308) here, so the redirect itself carries the security
//      headers too
//   2. the public site is locale-prefixed — "/" and "/anket" go to "/az/…"
//   3. /admin is private — everything but the login screen needs a session.
//
// The proxy only checks that a session cookie is present: that is enough to
// bounce anonymous visitors without a database round trip on every
// navigation. The real check (session row, expiry) happens once per render
// in the dashboard layout via requireUser(), and in every server action.

const CANONICAL_HOST = "www.nobug.az";
const REDIRECT_HOSTS = new Set(["nobug.az", "no-bug-eta.vercel.app"]);
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
  const host = req.headers.get("host")?.split(":")[0] ?? "";

  if (REDIRECT_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    return applySecurityHeaders(NextResponse.redirect(url, 308));
  }

  if (pathname.startsWith("/admin")) {
    // the login page itself redirects signed-in users after verifying the session
    if (pathname === "/admin/login") return applySecurityHeaders(NextResponse.next());
    return applySecurityHeaders(hasSessionCookie(req) ? NextResponse.next() : toLogin(req));
  }

  if (isLocale(pathname.split("/")[1])) return applySecurityHeaders(NextResponse.next());

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return applySecurityHeaders(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|uploads|favicon.ico|robots.txt|sitemap.xml|sw.js|offline.html|.*\\..*).*)"],
};
