"use server";

import axios from "axios";
import { getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders } from "./global";
import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { handleAllegroApiError } from "../errorHandlers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type allegroReturnsResponse = {
  AL1: AllegroReturn[];
  AL2: AllegroReturn[];
};

export async function getAllegroReturns(
  allegroOrderId?: string | null
): Promise<allegroReturnsResponse | undefined> {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dni w milisekundach
  const monthAgoISO = monthAgo.toISOString();
  console.log(monthAgoISO);

  let url = `${ALLEGRO_API_BASE_URL}/order/customer-returns?createdAt.gte=${monthAgoISO}&limit=500`;

  // Dodaj filtrowanie po allegroOrderId jeśli został podany
  if (allegroOrderId) {
    url += `&orderId=${allegroOrderId}`;
  }

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(url, {
        headers: {
          ...headers.AL1,
          "Content-Type": "application/vnd.allegro.beta.v1+json",
          Accept: "application/vnd.allegro.beta.v1+json",
        },
      }),
      axios.get(url, {
        headers: {
          ...headers.AL2,
          "Content-Type": "application/vnd.allegro.beta.v1+json",
          Accept: "application/vnd.allegro.beta.v1+json",
        },
      }),
    ]);

    const sortedAL1 = AL1Response.data.customerReturns.sort(
      (a: AllegroReturn, b: AllegroReturn) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const sortedAL2 = AL2Response.data.customerReturns.sort(
      (a: AllegroReturn, b: AllegroReturn) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      AL1: sortedAL1,
      AL2: sortedAL2,
    };
  } catch (error) {
    handleAllegroApiError(error, "Błąd podczas pobierania zwrotów z Allegro");
  }
}
