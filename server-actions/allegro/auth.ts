import axios from "axios";
import { redis } from "@/upstash/redis";
import { adminDB } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";

// client access token jest używany do autoryzacji zapytań do Allegro API, które nie wymagają dostępu do danych użytkownika
const ALLEGRO_BASE_URL = process.env.ALLEGRO_BASE_URL!;

export async function getAllegroClientAccessToken() {
  const clientId = process.env.ALLEGRO_CLIENT_ID!;
  const clientSecret = process.env.ALLEGRO_CLIENT_SECRET!;
  const tokenUrl = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

  const resp = await axios.post(
    tokenUrl,
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username: clientId, password: clientSecret },
    }
  );

  return resp.data.access_token;
}

const REFRESH_BUFFER = 60; // sekundy, bufor bezpieczeństwa przed wygaśnięciem tokena

export async function getAllegroUserAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  const key = `session:${sessionId}`;

  // 1. Pobierz hash sesji z Redis
  const sess = await redis.hgetall(key);
  if (!sess || !sess.userId || !sess.allegroAccessToken) {
    throw new Error(
      "Brak sesji lub access tokena Allegro w Redis. Użytkownik nie jest zalogowany."
    );
  }

  const accessToken = sess.allegroAccessToken as string | undefined;
  const expiryTs = parseInt(
    (sess.allegroAccessTokenExpiry as string) || "0",
    10
  );
  const now = Math.floor(Date.now() / 1000);

  // 2. Jeśli token jest nadal ważny (z buforem), zwróć go
  if (accessToken && now + REFRESH_BUFFER < expiryTs) {
    return accessToken;
  }

  // 3. Token wygasł — pobierz refreshToken z Firestore
  const userDoc = await adminDB
    .collection("users")
    .doc(sess.userId as string)
    .get();
  const refreshToken = userDoc.data()?.allegro?.AL1?.refreshToken as
    | string
    | undefined;
  if (!refreshToken) {
    throw new Error("Brak refresh tokena Allegro dla użytkownika");
  }

  // 4. Odśwież token w Allegro
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const basic = Buffer.from(
    `${process.env.ALLEGRO_CLIENT_ID}:${process.env.ALLEGRO_CLIENT_SECRET}`
  ).toString("base64");
  const tokenEndpoint = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

  const resp = await axios.post(`${tokenEndpoint}?${params.toString()}`, null, {
    headers: { Authorization: `Basic ${basic}` },
  });
  const { access_token, refresh_token, expires_in } = resp.data;

  // 5. Zapisz nowy access token w Redis (hash + TTL)
  const newExpiry = now + expires_in;
  await redis.hset(key, {
    allegroAccessToken: access_token,
    allegroAccessTokenExpiry: newExpiry.toString(),
  });
  await redis.expire(key, 60 * 60 * 24 * 7);

  // 6. Zapisz nowy refresh token w Firestore pod allegro.AL1.refreshToken
  await adminDB
    .collection("users")
    .doc(sess.userId as string)
    .set(
      { allegro: { AL1: { refreshToken: refresh_token } } },
      { merge: true }
    );

  return access_token;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const tokenEndpoint = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

  const url = new URL(tokenEndpoint);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("code", code);
  url.searchParams.set("redirect_uri", redirectUri);

  const basic = Buffer.from(
    `${process.env.ALLEGRO_CLIENT_ID}:${process.env.ALLEGRO_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios.post(url.toString(), null, {
    headers: {
      Authorization: `Basic ${basic}`,
    },
  });

  return response.data as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
