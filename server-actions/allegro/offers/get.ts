"use server";

import { AllegroOffer } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "@/server-actions/auth/auth";
import {
  getAllegroAccessTokensForBackgroundJob,
  getAllegroUserAccessToken,
} from "../auth";
import { getSingleAllegroHeaders } from "../global";
import axios from "axios";
import { handleAllegroApiError } from "@/server-actions/errorHandlers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export const getAllegroOffer = async (
  id: string,
  channel: "AL1" | "AL2",
  options?: { userId?: string; skipAuth?: boolean },
): Promise<AllegroOffer> => {
  // Pomiń weryfikację jeśli mamy userId (zadanie w tle) lub skipAuth
  if (!options?.userId && !options?.skipAuth) {
    await verifyUser(["ADMIN", "VERIFIED"]);
  }

  let accessToken: string;
  if (options?.userId) {
    const tokens = await getAllegroAccessTokensForBackgroundJob();
    accessToken = tokens[channel];
  } else {
    accessToken = await getAllegroUserAccessToken(channel);
  }
  const headers = getSingleAllegroHeaders(accessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers/${id}`;

  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    if (!data) {
      throw new Error("Nie znaleziono oferty na Allegro.");
    }

    return data as AllegroOffer;
  } catch (error) {
    handleAllegroApiError(error, "Błąd podczas pobierania oferty z Allegro");
  }
};
