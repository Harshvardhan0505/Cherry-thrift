import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, SESSION_COOKIE } from "./lib/session-cookie";

// Checkout and orders need a shopper account; the admin panel needs a team
// sign-in. This only checks that the right cookie is there, to send people to
// log in before the page loads; the pages themselves check the session
// properly.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/setup") return NextResponse.next();
    if (request.cookies.has(ADMIN_COOKIE)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/checkout", "/orders", "/orders/:path*", "/admin", "/admin/:path*"],
};
