import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenCookie = request.cookies.get("adminAccessToken");
  const refreshTokenCookie = request.cookies.get("adminRefreshToken");
  let accessToken = tokenCookie?.value;
  const refreshToken = refreshTokenCookie?.value;

  const redirectToLogin = () => {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete({ name: "adminAccessToken", path: "/" });
    res.cookies.delete({ name: "adminRefreshToken", path: "/" });
    return res;
  };

  let userRole: string | null = null;

  // 1. Local JWT Validation (Non-blocking)
  if (accessToken) {
    try {
      const decoded: any = jwtDecode(accessToken);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (!isExpired) {
        userRole = decoded.role;
      }
    } catch (error) {
      // Invalid token
    }
  }

  // Note: We REMOVED the blocking fetch refresh-token call.
  // Refreshing should be handled by:
  // 1. A client-side interceptor (Axios/Fetch)
  // 2. Or a background refresh in the AuthProvider
  // This ensures Middleware stays < 50ms.

  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !userRole && !refreshToken) {
    return redirectToLogin();
  }

  if (userRole) {
    if (userRole === "USER" && isDashboard) {
      // If a standard user tries to access admin dashboard, redirect them or show error
      // Since this is a dedicated admin project, maybe redirect to a "not authorized" or just back to home
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/login" && userRole === "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};


