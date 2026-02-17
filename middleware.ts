import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  // Public routes – no protection
  const publicRoutes = ["/", "/login", "/forgot-password"];

  // If it's a public route -> allow
  if (publicRoutes.includes(url)) {
    return NextResponse.next();
  }

  // If route is protected and no token -> redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect everything except public pages
     * Add all your protected routes here
     */
    "/dashboard/:path*",
    "/reports/:path*",
    "/collections/:path*",
    "/revenue/:path*",
    "/settings/:path*",
  ],
};
