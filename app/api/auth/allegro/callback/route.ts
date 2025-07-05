import { adminDB } from "@/firebase/firebaseAdmin";
import { exchangeCodeForTokens } from "@/server-actions/allegro/auth";
import { redis } from "@/upstash/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const encodedState = searchParams.get("state"); // tu trafia Twój sessionId
  const account = searchParams.get("account");
  const state = encodedState ? decodeURIComponent(encodedState) : null;

  if (!code || !state || !account) {
    return NextResponse.json(
      { error: "Brak code, state lub account" },
      { status: 400 }
    );
  }

  const key = `session:${state}`;

  // 1) Pobranie sesji z Redis jako hash
  const sessionHash = await redis.hgetall(key);
  if (!sessionHash || !sessionHash.userId || !sessionHash.firebaseIdToken) {
    return NextResponse.json(
      { error: "Nieznana lub niekompletna sesja" },
      { status: 401 }
    );
  }
  const userId = sessionHash.userId as string;

  try {
    // 2) Wymiana kodu na tokeny w Allegro
    const { access_token, refresh_token, expires_in } =
      await exchangeCodeForTokens(
        code,
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/allegro/callback?account=${account}`
      );

    // 3) Aktualizacja sesji w Redis (dodanie tokenu Allegro)
    const expiryTs = Math.floor(Date.now() / 1000) + expires_in;

    if (account === "AL1") {
      await redis.hset(key, {
        AL1AccessToken: access_token,
        AL1TokenExpiry: expiryTs.toString(),
      });
    } else {
      await redis.hset(key, {
        AL2AccessToken: access_token,
        AL2TokenExpiry: expiryTs.toString(),
      });
    }
    await redis.expire(key, 60 * 60 * 24 * 7);

    // 4) Zapis refreshToken w Firestore pod users/<uid>.allegro.refreshToken
    await adminDB
      .collection("users")
      .doc(userId)
      .set(
        {
          allegro: {
            [account]: {
              refreshToken: refresh_token,
            },
          },
        },
        { merge: true }
      );

    // 5) Przekierowanie z powrotem do panelu
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin-panel`;
    return NextResponse.redirect(returnUrl);
  } catch (error) {
    console.error("Allegro exchange error:", error);
    return NextResponse.json(
      { error: "Błąd podczas wymiany tokenów Allegro" },
      { status: 502 }
    );
  }
}
