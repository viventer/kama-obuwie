import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function verifyFirebaseIdToken(): Promise<void> {
  // 1. Odczyt sessionId z ciasteczka HttpOnly
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) throw new Error("Brak aktywnej sesji");

  // 2. Pobranie hash z Redis
  const key = `session:${sessionId}`;
  const sess = await redis.hgetall(key);
  if (!sess || !sess.firebaseIdToken) {
    NextResponse.redirect(
      new URL("/admin-auth/unauthorized", window.location.href)
    );
    redis.del(key);
    return;
  }

  const token = sess.firebaseIdToken as string;

  try {
    adminAuth.verifyIdToken(token, true);
  } catch (error) {
    redis.del(key);
    throw new Error("Nieprawidłowy token sesji");
  }
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await verifyFirebaseIdToken();
    return fn(...args);
  }) as T;
}
