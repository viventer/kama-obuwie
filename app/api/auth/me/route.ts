import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { refreshFirebaseIdToken } from "@/lib/firebaseTokenRefresh";
import { redis } from "@/upstash/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId")?.value;
  if (!sessionId) return NextResponse.json({ user: null }, { status: 200 });

  const key = `session:${sessionId}`;

  const sessionHash = await redis.hgetall(key);
  if (!sessionHash || !sessionHash.userId) {
    return NextResponse.json({ message: "Brak sesji" }, { status: 401 });
  }

  const userId = sessionHash.userId as string;
  let firebaseIdToken = (sessionHash.firebaseIdToken as string) || "";

  try {
    if (!firebaseIdToken) {
      const refreshToken = (sessionHash.refreshToken as string) || "";
      if (!refreshToken) {
        return NextResponse.json({ message: "Brak tokena" }, { status: 401 });
      }

      const refreshed = await refreshFirebaseIdToken(refreshToken);
      firebaseIdToken = refreshed.id_token;
      await redis.hset(key, {
        firebaseIdToken: refreshed.id_token,
        refreshToken: refreshed.refresh_token,
      });
    }

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

    // Token Firebase nieważny/wygaśnięty -> spróbuj odświeżyć po stronie serwera.
    const refreshToken = (sessionHash.refreshToken as string) || "";
    if (!refreshToken) {
      return NextResponse.json({ message: "Token wygasł" }, { status: 401 });
    }

    try {
      const refreshed = await refreshFirebaseIdToken(refreshToken);
      await redis.hset(key, {
        firebaseIdToken: refreshed.id_token,
        refreshToken: refreshed.refresh_token,
      });

      await adminAuth.verifyIdToken(refreshed.id_token, true);

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
    } catch {
      return NextResponse.json({ message: "Token wygasł" }, { status: 401 });
    }
  }
}
