"use server";

import { adminAuth } from "@/firebase/firebaseAdmin";
import { redis } from "@/upstash/redis";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export type AuthorizationError = {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  message: string;
};

export async function verifyUser(roles?: string[]) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  if (!sessionId) return redirect("/admin-auth/login");

  const key = `session:${sessionId}`;
  const sess = await redis.hgetall(key);
  if (!sess || !sess.firebaseIdToken || !sess.role) {
    await redis.del(key);
    cookieStore.delete("sessionId");
    redirect("/admin-auth/login");
  }

  try {
    adminAuth.verifyIdToken(sess?.firebaseIdToken as string, true);
  } catch (error) {
    redirect("/admin-auth/login");
  }

  if (!roles) return;

  if (roles.length > 0 && !roles.includes(sess?.role as string)) {
    redirect("/admin-auth/unauthorized");
  }
}
