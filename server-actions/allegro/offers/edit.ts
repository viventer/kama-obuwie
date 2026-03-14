"use server";

import { AllegroOffer } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "@/server-actions/auth/auth";
import {
  getAllegroAccessTokensForBackgroundJob,
  getAllegroUserAccessToken,
} from "../auth";
import { getSingleAllegroHeaders } from "../global";
import { handleAllegroApiError } from "@/server-actions/errorHandlers";
import axios from "axios";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export const editAllegroOffer = async (
  id: string,
  channel: "AL1" | "AL2",
  data: Partial<AllegroOffer>,
  options?: { userId?: string; skipAuth?: boolean },
): Promise<void> => {
  // Pomiń weryfikację jeśli mamy userId (zadanie w tle) lub skipAuth
  if (!options?.userId && !options?.skipAuth) {
    await verifyUser(["ADMIN", "VERIFIED"]);
  }

  let accessToken: string;
  if (options?.userId) {
    // Zadanie w tle - użyj funkcji bez sesji
    const tokens = await getAllegroAccessTokensForBackgroundJob();
    accessToken = tokens[channel];
  } else {
    // Normalny request - użyj sesji
    accessToken = await getAllegroUserAccessToken(channel);
  }

  const headers = getSingleAllegroHeaders(accessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers/${id}`;

  try {
    await axios.patch(url, data, { headers });
  } catch (error) {
    handleAllegroApiError(error, "Błąd podczas edytowania oferty Allegro");
  }
};
