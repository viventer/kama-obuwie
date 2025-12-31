import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("sessionId")?.value;
  if (!session) {
    console.log("Brak coookie sesji w middleware - przekierowanie na login.");
    return NextResponse.redirect(new URL("/admin-auth/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-panel", "/admin-panel/:path*"],
};
