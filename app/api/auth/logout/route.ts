import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/sessionId=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId) {
    await redis.del(`session:${sessionId}`);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("sessionId", "", {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
