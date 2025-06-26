import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { getAllegroHeaders } from "./global";

export async function getAllegroSizingTables() {
  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);
  const url = `${process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL}/sale/size-tables`;
  try {
    const response = await axios.get(url, {
      headers: allegroHeaders,
    });
  } catch (error) {
    console.error(error);
  }
}
