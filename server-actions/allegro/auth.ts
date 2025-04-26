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
