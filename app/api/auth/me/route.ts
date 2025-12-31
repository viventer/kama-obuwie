import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  if (!sessionId) return NextResponse.json({ user: null }, { status: 200 });

  const key = `session:${sessionId}`;

  const sessionHash = await redis.hgetall(key);
  if (!sessionHash || !sessionHash.firebaseIdToken || !sessionHash.userId) {
    return NextResponse.json({ message: "Brak sesji" }, { status: 401 });
  }

  const firebaseIdToken = sessionHash.firebaseIdToken as string;
  const userId = sessionHash.userId as string;

  try {
    await adminAuth.verifyIdToken(firebaseIdToken, true);

    const userDoc = await adminDB.collection("users").doc(userId).get();
    const data = userDoc.exists ? userDoc.data() : null;

    return NextResponse.json({
      user: {
        uid: userId,
        email: data?.email || null,
        firstName: data?.firstName || null,
        lastName: data?.lastName || null,
        createdAt: data?.createdAt?.toDate().toISOString() || null,
        perms: data?.perms || {},
        role: data?.role || null,
      },
    });
  } catch (error) {
    const ttl = await redis.ttl(key);

    // -2: key does not exist, 0: expired
    if (ttl === -2 || ttl === 0) {
      await redis.del(key);
      return NextResponse.json({ message: "Sesja wygasła" }, { status: 401 });
    }

    // Token Firebase nieważny/wygaśnięty -> klient (admin) powinien go odświeżyć przez /api/auth/refresh/firebase-token
    return NextResponse.json({ message: "Token wygasł" }, { status: 401 });
  }
}
