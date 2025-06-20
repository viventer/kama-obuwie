import axios from "axios";
import { getAllegroClientAccessToken } from "./auth";
import { ALLEGRO_API_BASE_URL, getAllegroHeaders } from "./global";

export async function getAllegroSizingTables() {
  const accessToken = await getAllegroClientAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/sale/size-tables`;
  try {
    const response = await axios.get(url, {
      headers: allegroHeaders,
    });
  } catch (error) {
    console.error(error);
  }
}
