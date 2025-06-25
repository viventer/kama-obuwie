import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/sessionId=([^;]+)/);
  if (!match)
    return NextResponse.json({ message: "No session" }, { status: 200 });

  const { idToken } = await req.json();
  if (!idToken)
    return NextResponse.json({ error: "No token" }, { status: 400 });

  try {
    const { uid } = await adminAuth.verifyIdToken(idToken, true);
    const key = `session:${match[1]}`;

    await redis.hset(key, { userId: uid, firebaseIdToken: idToken });
    await redis.expire(key, 60 * 60 * 24 * 7);

    return NextResponse.json({ success: true });
  } catch (err) {
    redis.del(`session:${match[1]}`);
    return NextResponse.json(
      { error: `Invalid token: ${err}` },
      { status: 401 }
    );
  }
}
