import axios from "axios";
import { getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders } from "./global";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export async function getAllegroResponsibleProducers() {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/after-sales-service-conditions/implied-warranties`;

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
