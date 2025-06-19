import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieHeader = req.headers.get("cookie") ?? "";
  const url = new URL("/api/auth/me", req.url);

  const sessionId = req.cookies.get("sessionId")?.value;
  if (pathname === "/admin-auth/login") {
    if (sessionId) {
      return NextResponse.redirect(new URL("/admin-panel", req.url));
    }
    return NextResponse.next();
  }

  const resp = await fetch(url.toString(), {
    headers: {
      cookie: cookieHeader,
    },
  });
  const data = await resp.json();

  if (!data.user.role || data.user.role === "UNVERIFIED") {
    return NextResponse.redirect(new URL("/admin-auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-panel", "/admin-panel/:path*", "/admin-auth/login"],
};
