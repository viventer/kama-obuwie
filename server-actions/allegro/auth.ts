import axios from "axios";
import { ALLEGRO_BASE_URL } from "./global";

export async function getAllegroAccessToken() {
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
