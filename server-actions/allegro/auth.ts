import axios from "axios";
import { redis } from "@/upstash/redis";
import { adminDB } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { getAllegroHeaders, getSingleAllegroHeaders } from "./global";
import { redirect } from "next/navigation";

// client access token jest używany do autoryzacji zapytań do Allegro API, które nie wymagają dostępu do danych użytkownika
const ALLEGRO_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_BASE_URL!;

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

export async function getAllegroUserAccessTokens(): Promise<{
  AL1: string;
  AL2: string;
}> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  const key = `session:${sessionId}`;

  // 1. Pobierz hash sesji z Redis
  const sess = await redis.hgetall(key);
  if (!sess || !sess.userId || !sess.AL1AccessToken || !sess.AL2AccessToken) {
    redirect("/admin-auth/login");
  }

  const now = Math.floor(Date.now() / 1000);
  const result = { AL1: "", AL2: "" };

  // Pobierz dane użytkownika z Firestore raz
  const userDoc = await adminDB
    .collection("users")
    .doc(sess.userId as string)
    .get();
  const userData = userDoc.data();

  // Przetwórz oba konta
  for (const account of ["AL1", "AL2"] as const) {
    const accessToken = sess[`${account}AccessToken`] as string | undefined;
    const expiryTs = parseInt(
      (sess[`${account}TokenExpiry`] as string) || "0",
      10
    );

    // 2. Jeśli token jest nadal ważny (z buforem), użyj go
    if (accessToken && now + REFRESH_BUFFER < expiryTs) {
      result[account] = accessToken;
      continue;
    }

    // 3. Token wygasł — pobierz refreshToken z Firestore
    const refreshToken = userData?.allegro?.[account]?.refreshToken as
      | string
      | undefined;
    if (!refreshToken) {
      throw new Error(`Brak refresh tokena Allegro dla konta ${account}`);
    }

    // 4. Odśwież token w Allegro
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const clientId =
      account === "AL1"
        ? process.env.AL1_CLIENT_ID!
        : process.env.AL2_CLIENT_ID!;
    const clientSecret =
      account === "AL1"
        ? process.env.AL1_CLIENT_SECRET!
        : process.env.AL2_CLIENT_SECRET!;

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenEndpoint = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

    const resp = await axios.post(
      `${tokenEndpoint}?${params.toString()}`,
      null,
      {
        headers: { Authorization: `Basic ${basic}` },
      }
    );
    const { access_token, refresh_token, expires_in } = resp.data;

    // 5. Zapisz nowy access token w Redis
    const newExpiry = now + expires_in;
    await redis.hset(key, {
      [`${account}AccessToken`]: access_token,
      [`${account}TokenExpiry`]: newExpiry.toString(),
    });

    // 6. Zapisz nowy refresh token w Firestore
    await adminDB
      .collection("users")
      .doc(sess.userId as string)
      .set(
        { allegro: { [account]: { refreshToken: refresh_token } } },
        { merge: true }
      );

    result[account] = access_token;
  }

  // Przedłuż TTL sesji w Redis
  await redis.expire(key, 60 * 60 * 24 * 7);

  return result;
}

// Funkcja pomocnicza dla kompatybilności wstecznej - domyślnie zwraca token AL1
export async function getAllegroUserAccessToken(
  account: "AL1" | "AL2" = "AL1"
): Promise<string> {
  const tokens = await getAllegroUserAccessTokens();
  return tokens[account];
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  account: string
) {
  const tokenEndpoint = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

  const url = new URL(tokenEndpoint);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("code", code);
  url.searchParams.set("redirect_uri", redirectUri);

  const clientId =
    account === "AL1" ? process.env.AL1_CLIENT_ID! : process.env.AL2_CLIENT_ID!;

  const clientSecret =
    account === "AL1"
      ? process.env.AL1_CLIENT_SECRET!
      : process.env.AL2_CLIENT_SECRET!;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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

export async function checkAccountInfo(
  accessToken: string,
  correctAccount: string
): Promise<boolean> {
  const headers = getSingleAllegroHeaders(accessToken);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL}/me`,
      {
        headers,
      }
    );
    const login = response.data.login;
    if (correctAccount === "AL1") {
      return login === process.env.AL1_LOGIN;
    } else if (correctAccount === "AL2") {
      return login === process.env.AL2_LOGIN;
    } else {
      return false;
    }
  } catch (err) {
    console.log("Błąd podczas sprawdzania informacji o koncie Allegro:", err);
    return false;
  }
}

/**
 * Pobiera access tokeny Allegro dla zadań w tle (bez sesji użytkownika)
 * Używa bezpośrednio userId z parametru zamiast sesji cookie
 */
export async function getAllegroAccessTokensForBackgroundJob(
  userId: string
): Promise<{
  AL1: string;
  AL2: string;
}> {
  const now = Math.floor(Date.now() / 1000);
  const result = { AL1: "", AL2: "" };

  // Pobierz dane użytkownika z Firestore
  const userDoc = await adminDB.collection("users").doc(userId).get();
  const userData = userDoc.data();

  if (!userData) {
    throw new Error(`Nie znaleziono użytkownika o ID: ${userId}`);
  }

  // Przetwórz oba konta
  for (const account of ["AL1", "AL2"] as const) {
    // Pobierz refreshToken z Firestore
    const refreshToken = userData?.allegro?.[account]?.refreshToken as
      | string
      | undefined;
    if (!refreshToken) {
      throw new Error(`Brak refresh tokena Allegro dla konta ${account}`);
    }

    // Sprawdź czy mamy zapisany access token i jego ważność
    const cachedToken = userData?.allegro?.[account]?.accessToken as
      | string
      | undefined;
    const cachedExpiry = userData?.allegro?.[account]?.tokenExpiry as
      | number
      | undefined;

    // Jeśli mamy ważny token w cache, użyj go
    if (cachedToken && cachedExpiry && now + REFRESH_BUFFER < cachedExpiry) {
      result[account] = cachedToken;
      continue;
    }

    // Odśwież token w Allegro
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const clientId =
      account === "AL1"
        ? process.env.AL1_CLIENT_ID!
        : process.env.AL2_CLIENT_ID!;
    const clientSecret =
      account === "AL1"
        ? process.env.AL1_CLIENT_SECRET!
        : process.env.AL2_CLIENT_SECRET!;

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenEndpoint = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

    const resp = await axios.post(
      `${tokenEndpoint}?${params.toString()}`,
      null,
      {
        headers: { Authorization: `Basic ${basic}` },
      }
    );

    const { access_token, refresh_token, expires_in } = resp.data;
    const newExpiry = now + expires_in;

    // Zapisz nowy token w Firestore dla przyszłych wywołań
    await adminDB
      .collection("users")
      .doc(userId)
      .set(
        {
          allegro: {
            [account]: {
              accessToken: access_token,
              refreshToken: refresh_token,
              tokenExpiry: newExpiry,
            },
          },
        },
        { merge: true }
      );

    result[account] = access_token;
  }

  return result;
}
