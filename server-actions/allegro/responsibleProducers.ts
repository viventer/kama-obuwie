import axios from "axios";
import {
  getAllegroAccessTokensForBackgroundJob,
  getAllegroUserAccessToken,
  getAllegroUserAccessTokens,
} from "./auth";
import { getAllegroHeaders, getSingleAllegroHeaders } from "./global";
import { redirect } from "next/navigation";
import { verifyUser } from "../auth/auth";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type ResponsibleProducer = {
  id: string;
  name: string;
  producerData: {
    tradeName: string;
    address: {
      countryCode: string;
      street: string;
      postalCode: string;
      city: string;
    };
    contact: {
      email: string;
      phoneNumber: string | undefined;
      formUrl: string | undefined;
    };
  };
};

export type ResponsibleProducersResponse = {
  AL1: ResponsibleProducer[];
  AL2: ResponsibleProducer[];
};

export async function getAllegroResponsibleProducers() {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();

  if (!AL1AccessToken || !AL2AccessToken) {
    redirect("/admin-auth/allegro-connect");
  }

  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/sale/responsible-producers`;

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(url, { headers: headers.AL1 }),
      axios.get(url, { headers: headers.AL2 }),
    ]);

    return {
      AL1: AL1Response.data.responsibleProducers,
      AL2: AL2Response.data.responsibleProducers,
    };
  } catch (error) {
    console.error(error);
  }
}

export async function getAllegroResponsibleProducer(
  responsibleProducerId: string,
  channel: "AL1" | "AL2",
  options?: { userId?: string; skipAuth?: boolean }
): Promise<ResponsibleProducer> {
  if (!responsibleProducerId) {
    throw new Error("Brak responsibleProducerId.");
  }

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

  // Allegro endpoint dla pojedynczego zasobu
  const byIdUrl = `${ALLEGRO_API_BASE_URL}/sale/responsible-producers/${responsibleProducerId}`;

  try {
    const resp = await axios.get(byIdUrl, { headers });
    const data = resp.data;
    if (!data) {
      throw new Error("Brak danych producenta odpowiedzialnego.");
    }
    return data as ResponsibleProducer;
  } catch (error: any) {
    // Fallback: niektóre konta/wersje API potrafią nie udostępniać GET by-id.
    // Wtedy pobierz listę i znajdź po ID.
    try {
      const listUrl = `${ALLEGRO_API_BASE_URL}/sale/responsible-producers`;
      const listResp = await axios.get(listUrl, { headers });
      const list = (listResp.data?.responsibleProducers ||
        []) as ResponsibleProducer[];
      const found = list.find((p) => p.id === responsibleProducerId);
      if (!found) {
        throw new Error(
          `Nie znaleziono responsibleProducer o id=${responsibleProducerId} (fallback list).`
        );
      }
      return found;
    } catch (fallbackErr) {
      console.error(error);
      throw fallbackErr;
    }
  }
}
