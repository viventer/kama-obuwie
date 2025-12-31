import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("sessionId")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "No session" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const idToken = body?.idToken as string | undefined;
  if (!idToken)
    return NextResponse.json({ error: "No token" }, { status: 400 });

  try {
    const { uid } = await adminAuth.verifyIdToken(idToken, true);
    const key = `session:${sessionId}`;

    // Odświeżanie tokena nie powinno tworzyć nowych sesji.
    const sessionHash = await redis.hgetall(key);
    if (!sessionHash || Object.keys(sessionHash).length === 0) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 401 }
      );
    }

    // Jeśli sesja ma już userId, upewnij się że token jest dla tego samego użytkownika.
    const existingUserId = sessionHash.userId as string | undefined;
    if (existingUserId && existingUserId !== uid) {
      return NextResponse.json({ message: "User mismatch" }, { status: 403 });
    }

    await redis.hset(key, { userId: uid, firebaseIdToken: idToken });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid token: ${err}` },
      { status: 401 }
    );
  }
}
