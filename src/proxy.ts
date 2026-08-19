import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin guard: require Supabase session cookie (full check happens server-side in admin layout).
  const adminMatch = pathname.match(/^(?:\/(fa|en))?\/admin(?!\/login)(\/.*)?$/);
  if (adminMatch) {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = `${adminMatch[1] ? `/${adminMatch[1]}` : ""}/admin/login`;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
