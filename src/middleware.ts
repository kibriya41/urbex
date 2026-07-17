import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.startsWith("/admin")) {
    try {
      // Perform a fetch to the Better-Auth session API.
      // This works seamlessly in Edge middleware without importing MongoDB or native node drivers.
      const sessionResponse = await fetch(new URL("/api/auth/get-session", request.url), {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (!sessionResponse.ok) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const session = await sessionResponse.json();

      // Check if user exists and has admin or moderator role
      if (!session || !session.user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const role = session.user.role;
      if (role !== "admin" && role !== "moderator") {
        // Not authorized, redirect to homepage or login
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware auth check failed:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
