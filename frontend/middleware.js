import { NextResponse } from "next/server";
import { ROUTES, PROTECTED_PATH_PREFIXES } from "./src/config/routes";

export function middleware(request) {
  const token = request.cookies.get("sportsee_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === ROUTES.LOGIN && token) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/coach-ai/:path*", "/profile/:path*", "/login"],
};