"use server";

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
    return;
  }

  const token = sess.firebaseIdToken as string | undefined;
  if (!token) throw new Error("Brak firebaseIdToken w sesji");

  adminAuth.verifyIdToken(token);
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    await verifyFirebaseIdToken();
    return fn(...args);
  }) as T;
}
