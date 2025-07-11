"use server";

import axios from "axios";
import { getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders } from "./global";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type lastEventId = {
  AL1?: string;
  AL2?: string;
};

export async function getAllegroOrderEvents(
  lastEventId?: lastEventId | undefined
) {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/order/events?type=READY_FOR_PROCESSING&type=CANCELLED&limit=60`;
  let urlAL1 = url;
  let urlAL2 = url;
  if (lastEventId?.AL1) {
    urlAL1 += `&from=${lastEventId.AL1}`;
  }
  if (lastEventId?.AL2) {
    urlAL2 += `&from=${lastEventId.AL2}`;
  }

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(urlAL1, { headers: headers.AL1 }),
      axios.get(urlAL2, { headers: headers.AL2 }),
    ]);

    return {
      AL1: AL1Response.data.events,
      AL2: AL2Response.data.events,
    };
  } catch (error) {
    console.error(error);
  }
}
