import { adminAuth, adminDB } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { idToken, refreshToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    // 1. Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const { uid, name, email } = decoded;

    // 2. Generate sessionId & store in Redis
    const sessionId = uuidv4();
    const sessionKey = `session:${sessionId}`;

    // 3. Set HttpOnly, Secure, SameSite=Strict cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year in seconds - practically "forever"
    });

    // 4. On first login, create Firestore user document
    const userRef = adminDB.collection("users").doc(uid);
    const userDoc = await userRef.get();
    await redis.hset(sessionKey, {
      userId: uid,
      firebaseIdToken: idToken,
      refreshToken: refreshToken || "", // Dodaj refresh token
      role: userDoc.exists
        ? userDoc.data()?.role || "UNVERIFIED"
        : "UNVERIFIED",
      perms: JSON.stringify({}),
    });

    // Ustaw długi TTL dla sesji (1 rok)
    await redis.expire(sessionKey, 365 * 24 * 60 * 60);

    if (!userDoc.exists) {
      await userRef.set({
        email: email || null,
        firstName: name?.split(" ")[0] || null,
        lastName: name?.split(" ")[1] || null,
        role: "UNVERIFIED",
        perms: {},
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: error }, { status: 401 });
  }
}
