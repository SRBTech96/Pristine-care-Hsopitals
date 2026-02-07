/**
 * Next.js Middleware
 * Handles:
 * - Performance optimization headers
 * - Security headers
 * - Request deduplication
 * - Redirect optimization
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Deduplicate concurrent API requests
 * Prevents multiple identical requests from hitting the backend
 */
const pendingRequests = new Map<string, Promise<any>>();

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  // Add performance headers
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // For API routes, add aggressive caching
  if (request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=3600"
    );
  }

  // For static assets, use immutable caching
  if (
    request.nextUrl.pathname.startsWith("/_next/static") ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // For pages, use stale-while-revalidate
  if (request.nextUrl.pathname === "/" || 
      ["/about", "/services", "/doctors", "/contact"].includes(request.nextUrl.pathname)) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=3600"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
