import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { cookies } from "next/headers";

type Handler<T extends any[]> = (...args: T) => Promise<any>;

async function getUserSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) throw new Error("Brak aktywnej sesji");

  const key = `session:${sessionId}`;
  const sess = await redis.hgetall(key);
  if (!sess || !sess.firebaseIdToken || !sess.role) {
    await redis.del(key);
    NextResponse.redirect(new URL("/admin-auth/login", window.location.href));
    return;
  }

  try {
    adminAuth.verifyIdToken(sess.firebaseIdToken as string, true);
  } catch (error) {
    redis.del(key);
    NextResponse.redirect(new URL("/admin-auth/login", window.location.href));
    return;
  }

  return {
    uid: sess.userId as string,
    role: sess.role as string,
    perms: sess.perms,
  };
}

export function withAuth<T extends Handler<any[]>>(fn: T): T;
export function withAuth<T extends Handler<any[]>>(roles: string[], fn: T): T;
export function withAuth<T extends Handler<any[]>>(
  arg1: string[] | T,
  arg2?: T
): T {
  const roles = Array.isArray(arg1) ? arg1 : null;
  const fn = Array.isArray(arg1) ? arg2! : arg1;

  return (async (...args: Parameters<T>) => {
    const session = await getUserSession();

    if (!session?.role || (roles && !roles.includes(session.role))) {
      NextResponse.redirect(
        new URL("/admin-auth/unauthorized", window.location.href)
      );
      return;
    }

    return fn(...args);
  }) as T;
}
