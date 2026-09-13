import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

// Unprefixed URLs always open in Azerbaijani: "/" → "/az", "/anket?xidmet=3" → "/az/anket?xidmet=3".
// No browser-language or cookie detection — EN/RU are reached only via the switcher.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isLocale(pathname.split("/")[1])) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
