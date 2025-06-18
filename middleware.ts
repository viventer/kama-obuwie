import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionId = req.cookies.get("sessionId")?.value;

  if (pathname === "/admin-panel/login") {
    if (sessionId) {
      return NextResponse.redirect(new URL("/admin-panel", req.url));
    }
  } else if (pathname.startsWith("/admin-panel")) {
    if (!sessionId) {
      return NextResponse.redirect(new URL("/admin-panel/login", req.url));
    }
  }

  return NextResponse.next();
}
