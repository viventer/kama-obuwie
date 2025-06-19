import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const url = new URL("/api/auth/me", req.url);

  const resp = await fetch(url.toString(), {
    headers: {
      cookie: cookieHeader,
    },
  });
  const data = await resp.json();
  console.log(data);

  if (!data.user.role || data.user.role === "UNVERIFIED") {
    return NextResponse.redirect(new URL("/admin-auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-panel", "/admin-panel/:path*"],
};
