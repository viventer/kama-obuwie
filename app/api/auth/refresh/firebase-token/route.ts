import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("sessionId")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "No session" }, { status: 401 });
  }

  const { idToken } = await req.json();
  if (!idToken)
    return NextResponse.json({ error: "No token" }, { status: 400 });

  try {
    const { uid } = await adminAuth.verifyIdToken(idToken, true);
    const key = `session:${sessionId}`;

    // Nie twórz nowej sesji w Redis jeśli stara zniknęła.
    const ttl = await redis.ttl(key);
    if (ttl === -2 || ttl === 0) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 401 }
      );
    }

    await redis.hset(key, { userId: uid, firebaseIdToken: idToken });

    return NextResponse.json({ success: true });
  } catch (err) {
    await redis.del(`session:${sessionId}`);
    return NextResponse.json(
      { error: `Invalid token: ${err}` },
      { status: 401 }
    );
  }
}
