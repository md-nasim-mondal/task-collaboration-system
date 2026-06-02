import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/projects", "/tasks", "/notifications"];

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Unauthenticated user trying to access a protected route → send to /login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting /login or /signup → send to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
