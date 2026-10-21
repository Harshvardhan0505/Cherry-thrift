import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/session-cookie";

// Checkout and orders need an account. This only checks that the sign-in
// cookie is there, to send shoppers to log in before the page loads; the
// pages themselves check the session properly.
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/checkout", "/orders", "/orders/:path*"],
};
