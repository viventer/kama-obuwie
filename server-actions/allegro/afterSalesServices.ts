"use server";

import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { getAllegroHeaders } from "./global";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export async function getAllegroReturnPolicies() {
  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/after-sales-service-conditions/return-policies`;
  try {
    const response = await axios.get(url, {
      headers: allegroHeaders,
    });
    return response.data.returnPolicies;
  } catch (error) {
    console.error(error);
  }
}
