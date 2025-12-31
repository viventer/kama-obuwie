export type FirebaseRefreshTokenResponse = {
  access_token: string;
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id?: string;
};

export async function refreshFirebaseIdToken(refreshToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!refreshToken) {
    throw new Error("Missing refreshToken");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to refresh token: ${res.status} ${text}`);
  }

  const data = (await res.json()) as FirebaseRefreshTokenResponse;
  if (!data?.id_token || !data?.refresh_token) {
    throw new Error("Invalid refresh token response");
  }

  return data;
}
