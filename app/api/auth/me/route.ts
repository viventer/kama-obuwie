import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/sessionId=([^;]+)/);
  if (!match) return NextResponse.json({ user: null }, { status: 200 });

  const sessionRaw = await redis.get(`session:${match[1]}`);
  if (!sessionRaw) return NextResponse.json({ user: null }, { status: 200 });

  const { firebaseIdToken, userId } =
    typeof sessionRaw === "string"
      ? JSON.parse(sessionRaw as string)
      : sessionRaw;
  try {
    await adminAuth.verifyIdToken(firebaseIdToken);
    const userDoc = await adminDB.collection("users").doc(userId).get();
    const data = userDoc.exists ? userDoc.data() : null;
    return NextResponse.json({
      user: {
        email: data?.email,
        firstName: data?.firstName,
        lastName: data?.lastName,
        createdAt: data?.createdAt?.toDate().toISOString() || null,
        perms: data?.perms || {},
        role: data?.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
