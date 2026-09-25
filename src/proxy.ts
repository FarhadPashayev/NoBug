import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getSessionFromRequest } from "@/lib/auth/session";

// Two jobs:
//   1. the public site is locale-prefixed — "/" and "/anket" go to "/az/…"
//   2. /admin is private — everything but the login screen needs a session
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const user = await getSessionFromRequest(req);
    if (user) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (isLocale(pathname.split("/")[1])) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
