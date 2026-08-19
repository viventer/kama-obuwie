"use server";

import axios from "axios";
import { redis } from "@/upstash/redis";
import { adminDB } from "@/firebase/firebaseAdmin";
import { getSingleAllegroHeaders } from "./global";

const ALLEGRO_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_BASE_URL!;
const ALLEGRO_AUTH_KEY = "allegroAuthData";
const REFRESH_BUFFER = 60;

type AllegroAccount = "AL1" | "AL2";

type AllegroTokens = {
  AL1: string;
  AL2: string;
};

type TokenCache = AllegroTokens & {
  expiresAt: number;
};

type RefreshTokens = Partial<Record<AllegroAccount, { refreshToken?: string }>>;

let tokenCache: TokenCache | null = null;
let refreshTokensCache: RefreshTokens | null = null;
let didPersistAuthKey = false;

export async function invalidateAllegroTokenCache(): Promise<void> {
  tokenCache = null;
  refreshTokensCache = null;
}

async function persistAllegroAuthKeyOnce(): Promise<void> {
  if (didPersistAuthKey) {
    return;
  }
  await redis.persist(ALLEGRO_AUTH_KEY);
  didPersistAuthKey = true;
}

async function getRefreshTokens(): Promise<RefreshTokens> {
  if (refreshTokensCache) {
    return refreshTokensCache;
  }

  const refreshTokensDoc = await adminDB
    .collection("allegroAuthData")
    .doc("tokens")
    .get();
  const refreshTokensData = refreshTokensDoc.data();

  if (!refreshTokensData) {
    throw new Error("Brak tokenów Allegro w bazie danych");
  }

  refreshTokensCache = refreshTokensData as RefreshTokens;
  return refreshTokensCache;
}

async function refreshAccountAccessToken(
  account: AllegroAccount,
  now: number,
): Promise<{ accessToken: string; expiresAt: number }> {
  const refreshTokens = await getRefreshTokens();
  const refreshToken = refreshTokens[account]?.refreshToken;
  if (!refreshToken) {
    throw new Error(`Brak refresh tokena Allegro dla konta ${account}`);
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const clientId =
    account === "AL1" ? process.env.AL1_CLIENT_ID! : process.env.AL2_CLIENT_ID!;
  const clientSecret =
    account === "AL1"
      ? process.env.AL1_CLIENT_SECRET!
      : process.env.AL2_CLIENT_SECRET!;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenEndpoint = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

  const resp = await axios.post(`${tokenEndpoint}?${params.toString()}`, null, {
    headers: {
      Authorization: `Basic ${basic}`,
      "User-Agent": process.env.ALLEGRO_USER_AGENT!,
    },
  });

  const { access_token, refresh_token, expires_in } = resp.data;
  const expiresAt = now + expires_in;

  await redis.hset(ALLEGRO_AUTH_KEY, {
    [`${account}AccessToken`]: access_token,
    [`${account}TokenExpiry`]: expiresAt.toString(),
  });
  await persistAllegroAuthKeyOnce();

  await adminDB
    .collection("allegroAuthData")
    .doc("tokens")
    .set({ [account]: { refreshToken: refresh_token } }, { merge: true });

  refreshTokensCache = {
    ...refreshTokens,
    [account]: { refreshToken: refresh_token },
  };

  return { accessToken: access_token, expiresAt };
}

export async function getAllegroClientAccessToken() {
  const clientId = process.env.ALLEGRO_CLIENT_ID!;
  const clientSecret = process.env.ALLEGRO_CLIENT_SECRET!;
  const tokenUrl = `${ALLEGRO_BASE_URL}/auth/oauth/token`;

  const resp = await axios.post(
    tokenUrl,
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": process.env.ALLEGRO_USER_AGENT!,
      },
      auth: { username: clientId, password: clientSecret },
    },
  );

  return resp.data.access_token;
}

export async function getAllegroUserAccessTokens(): Promise<AllegroTokens> {
  const now = Math.floor(Date.now() / 1000);

  if (
    tokenCache &&
    tokenCache.AL1 &&
    tokenCache.AL2 &&
    now + REFRESH_BUFFER < tokenCache.expiresAt
  ) {
    return { AL1: tokenCache.AL1, AL2: tokenCache.AL2 };
  }

  const redisTokens =
    (await redis.hgetall<Record<string, string>>(ALLEGRO_AUTH_KEY)) ?? {};
  await persistAllegroAuthKeyOnce();

  const result: AllegroTokens = { AL1: "", AL2: "" };
  const expiries: number[] = [];

  for (const account of ["AL1", "AL2"] as const) {
    const accessToken = redisTokens[`${account}AccessToken`];
    const expiryTs = parseInt(redisTokens[`${account}TokenExpiry`] || "0", 10);

    if (accessToken && now + REFRESH_BUFFER < expiryTs) {
      result[account] = accessToken;
      expiries.push(expiryTs);
      continue;
    }

    const refreshed = await refreshAccountAccessToken(account, now);
    result[account] = refreshed.accessToken;
    expiries.push(refreshed.expiresAt);
  }

  tokenCache = {
    ...result,
    expiresAt: Math.min(...expiries),
  };

  return result;
}

export async function getAllegroUserAccessToken(
  account: AllegroAccount = "AL1",
): Promise<string> {
  const tokens = await getAllegroUserAccessTokens();
  return tokens[account];
}

export const getAllegroAccessTokensForBackgroundJob =
  getAllegroUserAccessTokens;

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  account: string,
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
      "User-Agent": process.env.ALLEGRO_USER_AGENT!,
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
  correctAccount: string,
): Promise<boolean> {
  const headers = getSingleAllegroHeaders(accessToken);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL}/me`,
      {
        headers,
      },
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
