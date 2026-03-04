import { NextResponse } from "next/server";
import { ROUTES, isProtectedPath } from "./src/config/routes";
import { AUTH_TOKEN_COOKIE } from "./src/lib/authConstants";

export function middleware(request) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !token) {
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