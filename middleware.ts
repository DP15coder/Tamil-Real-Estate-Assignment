import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify_token } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check for auth token
  const token = request.cookies.get("auth-token");
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Verify token
  const payload = await verify_token(token.value);
  
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

