import axios from "axios";
import { redis } from "@/upstash/redis";
import { adminDB } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";
import { getSingleAllegroHeaders } from "./global";
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
  // 2. Pobierz globalne tokeny Allegro z Redis
  const redisTokens = await redis.hgetall("allegroAuthData");
  if (!redisTokens) {
    throw new Error("Brak tokenów Allegro w Redis");
  }

  const now = Math.floor(Date.now() / 1000);
  const result = { AL1: "", AL2: "" };

  // 3. Pobierz refresh tokeny z Firestore
  const refreshTokensDoc = await adminDB
    .collection("allegroAuthData")
    .doc("tokens")
    .get();
  const refreshTokensData = refreshTokensDoc.data();

  if (!refreshTokensData) {
    throw new Error("Brak tokenów Allegro w bazie danych");
  }

  // Przetwórz oba konta
  for (const account of ["AL1", "AL2"] as const) {
    const accessToken = redisTokens[`${account}AccessToken`] as
      | string
      | undefined;
    const expiryTs = parseInt(
      (redisTokens[`${account}TokenExpiry`] as string) || "0",
      10
    );

    // 4. Jeśli token jest nadal ważny (z buforem), użyj go
    if (accessToken && now + REFRESH_BUFFER < expiryTs) {
      result[account] = accessToken;
      continue;
    }

    // 5. Token wygasł — pobierz refreshToken z Firestore
    const refreshToken = refreshTokensData[account]?.refreshToken as
      | string
      | undefined;
    if (!refreshToken) {
      throw new Error(`Brak refresh tokena Allegro dla konta ${account}`);
    }

    // 6. Odśwież token w Allegro
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

    // 7. Zapisz nowy access token w Redis (globalnie)
    const newExpiry = now + expires_in;
    await redis.hset("allegroAuthData", {
      [`${account}AccessToken`]: access_token,
      [`${account}TokenExpiry`]: newExpiry.toString(),
    });
    await redis.expire("allegroAuthData", 60 * 60 * 24 * 7);

    // 8. Zapisz nowy refresh token w Firestore
    await adminDB
      .collection("allegroAuthData")
      .doc("tokens")
      .set({ [account]: { refreshToken: refresh_token } }, { merge: true });

    result[account] = access_token;
  }

  // Przedłuż TTL sesji w Redis
  await redis.expire("allegroAuthData", 60 * 60 * 24 * 7);

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

export async function getAllegroAccessTokensForBackgroundJob(): Promise<{
  AL1: string;
  AL2: string;
}> {
  const now = Math.floor(Date.now() / 1000);
  const result = { AL1: "", AL2: "" };

  // 1. Pobierz globalne tokeny z Redis
  const redisTokens = await redis.hgetall("allegroAuthData");

  // 2. Pobierz refresh tokeny z Firestore
  const refreshTokensDoc = await adminDB
    .collection("allegroAuthData")
    .doc("tokens")
    .get();
  const refreshTokensData = refreshTokensDoc.data();

  if (!refreshTokensData) {
    throw new Error("Brak tokenów Allegro w bazie danych");
  }

  for (const account of ["AL1", "AL2"] as const) {
    const cachedToken = redisTokens?.[`${account}AccessToken`] as
      | string
      | undefined;
    const cachedExpiry = parseInt(
      (redisTokens?.[`${account}TokenExpiry`] as string) || "0",
      10
    );

    // 3. Jeśli token jest nadal ważny (z buforem), użyj go
    if (cachedToken && cachedExpiry && now + REFRESH_BUFFER < cachedExpiry) {
      result[account] = cachedToken;
      continue;
    }

    // 4. Token wygasł - pobierz refreshToken z Firestore
    const refreshToken = refreshTokensData[account]?.refreshToken as
      | string
      | undefined;
    if (!refreshToken) {
      throw new Error(`Brak refresh tokena Allegro dla konta ${account}`);
    }

    // 5. Odśwież token w Allegro
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

    // 6. Zapisz nowy access token w Redis
    await redis.hset("allegroAuthData", {
      [`${account}AccessToken`]: access_token,
      [`${account}TokenExpiry`]: newExpiry.toString(),
    });
    await redis.expire("allegroAuthData", 60 * 60 * 24 * 7);

    // 7. Zapisz nowy refresh token w Firestore
    await adminDB
      .collection("allegroAuthData")
      .doc("tokens")
      .set({ [account]: { refreshToken: refresh_token } }, { merge: true });

    result[account] = access_token;
  }

  return result;
}
