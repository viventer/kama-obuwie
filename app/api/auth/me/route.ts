import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/sessionId=([^;]+)/);
  if (!match) return NextResponse.json({ user: null }, { status: 200 });

  const key = `session:${match[1]}`;

  const sessionHash = await redis.hgetall(key);
  if (!sessionHash || !sessionHash.firebaseIdToken || !sessionHash.userId) {
    return NextResponse.json({ message: "Brak sesji" }, { status: 401 });
  }

  const firebaseIdToken = sessionHash.firebaseIdToken as string;
  const userId = sessionHash.userId as string;
  const isAllegroConnected = Boolean(sessionHash?.allegroAccessToken);

  if (!isAllegroConnected) {
    return NextResponse.json(
      { message: "Nie podłączono Allegro" },
      { status: 403 }
    );
  }

  try {
    await adminAuth.verifyIdToken(firebaseIdToken, true);

    const userDoc = await adminDB.collection("users").doc(userId).get();
    const data = userDoc.exists ? userDoc.data() : null;

    return NextResponse.json({
      user: {
        email: data?.email || null,
        firstName: data?.firstName || null,
        lastName: data?.lastName || null,
        createdAt: data?.createdAt?.toDate().toISOString() || null,
        perms: data?.perms || {},
        role: data?.role || null,
        isAllegroConnected,
      },
    });
  } catch {
    redis.del(key);
    return NextResponse.json({ message: "Brak sesji" }, { status: 401 });
  }
}
