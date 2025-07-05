import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account");

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/sessionId=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (!sessionId) {
    return NextResponse.json({ error: "Brak sesji" }, { status: 401 });
  }

  const clientId =
    account === "AL1" ? process.env.AL_CLIENT_ID! : process.env.AL2_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/allegro/callback?account=${account}`;
  const state = encodeURIComponent(sessionId);

  const authUrl =
    `${process.env.NEXT_PUBLIC_ALLEGRO_BASE_URL}/auth/oauth/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  return NextResponse.redirect(authUrl);
}
