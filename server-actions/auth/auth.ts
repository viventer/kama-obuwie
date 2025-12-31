"use server";

import { adminAuth } from "@/firebase/firebaseAdmin";
import { refreshFirebaseIdToken } from "@/lib/firebaseTokenRefresh";
import { redis } from "@/upstash/redis";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthorizationError = {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  message: string;
};

export async function verifyUser(roles?: string[]) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) return false;

  const key = `session:${sessionId}`;
  const sess = await redis.hgetall(key);

  // Sprawdź czy sesja istnieje i ma wszystkie wymagane dane
  if (!sess || !sess.firebaseIdToken || !sess.role) {
    await redis.del(key);
    return false;
  }

  // Zweryfikuj token Firebase
  try {
    await adminAuth.verifyIdToken(sess.firebaseIdToken as string, true);
  } catch (error) {
    console.error("Token verification failed:", error);

    const refreshToken = (sess.refreshToken as string) || "";
    if (!refreshToken) {
      await redis.del(key);
      return false;
    }

    try {
      const refreshed = await refreshFirebaseIdToken(refreshToken);

      await redis.hset(key, {
        firebaseIdToken: refreshed.id_token,
        refreshToken: refreshed.refresh_token,
      });

      await adminAuth.verifyIdToken(refreshed.id_token, true);
    } catch (refreshError) {
      console.error("Server-side token refresh failed:", refreshError);
      await redis.del(key);
      return false;
    }
  }

  // Sprawdź uprawnienia ról jeśli są wymagane
  if (roles && roles.length > 0) {
    if (!roles.includes(sess.role as string)) {
      redirect("/admin-auth/unauthorized");
    }
  }

  return true;
}

/**
 * Pobiera userId aktualnie zalogowanego użytkownika
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) return null;

  const key = `session:${sessionId}`;
  const sess = await redis.hgetall(key);

  return (sess?.userId as string) || null;
}
