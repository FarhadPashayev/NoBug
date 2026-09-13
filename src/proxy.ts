import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

const COOKIE = "nobug.corp.lang";

function pickLocale(req: NextRequest): string {
  const fromCookie = req.cookies.get(COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;

  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    // Remember the language the visitor is actually using.
    const res = NextResponse.next();
    if (req.cookies.get(COOKIE)?.value !== first) {
      res.cookies.set(COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  }

  // "/" or "/anket?xidmet=3" → "/az" / "/az/anket?xidmet=3"
  const url = req.nextUrl.clone();
  url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
