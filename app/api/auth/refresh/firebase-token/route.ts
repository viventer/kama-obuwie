import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/sessionId=([^;]+)/);
  if (!match)
    return NextResponse.json({ error: "No session" }, { status: 400 });

  const { idToken } = await req.json();
  if (!idToken)
    return NextResponse.json({ error: "No token" }, { status: 400 });

  try {
    const { uid } = await adminAuth.verifyIdToken(idToken);

    await redis.set(
      `session:${match[1]}`,
      JSON.stringify({ userId: uid, firebaseIdToken: idToken }),
      { ex: 60 * 60 * 24 * 7 }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
