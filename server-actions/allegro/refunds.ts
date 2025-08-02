"use server";

import {
  AllegroRefund,
  AllegroRefundSchema,
} from "@/firebase/schemas/ordersSchemas";
import { getAllegroUserAccessToken } from "./auth";
import { getSingleAllegroHeaders } from "./global";
import { verifyUser } from "../auth/auth";
import { handleAxiosError } from "../helpers";
import axios from "axios";
import { allegroSalesChannels } from "@/lib/constants";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export async function createAllegroRefund(
  allegroRefund: AllegroRefund,
  account: "AL1" | "AL2"
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  if (!allegroSalesChannels.includes(account)) {
    throw new Error("Nieprawidłowy kanał sprzedaży Allegro.");
  }

  const accessToken = await getAllegroUserAccessToken(account);
  const headers = getSingleAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/payments/refunds`;

  AllegroRefundSchema.parse(allegroRefund);

  try {
    await axios.post(url, allegroRefund, {
      headers,
    });
  } catch (error) {
    handleAxiosError(error, "Błąd podczas tworzenia zwrotu w Allegro");
  }
}
