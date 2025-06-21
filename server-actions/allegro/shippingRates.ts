"use server";

import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { ALLEGRO_API_BASE_URL, getAllegroHeaders } from "./global";

export async function getAllegroShippingRates() {
  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/sale/shipping-rates`;
  try {
    const response = await axios.get(url, {
      headers: allegroHeaders,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
