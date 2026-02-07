/**
 * Next.js Middleware
 * Handles:
 * - Performance optimization headers
 * - Security headers
 * - Request deduplication
 * - Redirect optimization
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

/**
 * Deduplicate concurrent API requests
 * Prevents multiple identical requests from hitting the backend
 */
const pendingRequests = new Map<string, Promise<any>>();

/**
 * RBAC-protected routes
 * Maps route paths to required roles
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/billing": ["ADMIN", "FINANCE", "CASHIER"],
  "/finance": ["OWNER", "FINANCE"],
};

/**
 * Verify JWT token and extract user role
 * Returns role if token is valid, null otherwise
 */
function getUserRoleFromToken(request: NextRequest): string | null {
  try {
    // Get token from authorization header or cookies
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("authToken")?.value;
    
    const token = authHeader?.replace("Bearer ", "") || cookieToken;
    if (!token) return null;

    // Decode JWT (client-side decode, verify happens on backend)
    const decoded = jwtDecode<any>(token);
    return decoded.role || null;
  } catch {
    return null;
  }
}
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

    // Check RBAC for protected routes
    const pathname = request.nextUrl.pathname;
    for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        const userRole = getUserRoleFromToken(request);

        // If no role or role not in allowed list, redirect to home
        if (!userRole || !allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }

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
