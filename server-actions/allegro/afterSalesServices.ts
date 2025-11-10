"use server";

import axios from "axios";
import { getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders } from "./global";
import { handleAxiosError } from "../errorHandlers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export async function getAllegroReturnPolicies() {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/after-sales-service-conditions/return-policies`;

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(url, { headers: headers.AL1 }),
      axios.get(url, { headers: headers.AL2 }),
    ]);

    return {
      AL1: AL1Response.data.returnPolicies,
      AL2: AL2Response.data.returnPolicies,
    };
  } catch (error) {
    handleAxiosError(
      error,
      "Błąd podczas pobierania polityk zwrotów z Allegro"
    );
  }
}

export async function getAllegroImpliedWarranties() {
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
      AL1: AL1Response.data.impliedWarranties,
      AL2: AL2Response.data.impliedWarranties,
    };
  } catch (error) {
    handleAxiosError(error, "Błąd podczas pobierania gwarancji z Allegro");
  }
}

export async function getAllegroWarranties() {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/after-sales-service-conditions/warranties`;

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(url, { headers: headers.AL1 }),
      axios.get(url, { headers: headers.AL2 }),
    ]);

    return {
      AL1: AL1Response.data.warranties,
      AL2: AL2Response.data.warranties,
    };
  } catch (error) {
    handleAxiosError(
      error,
      "Błąd podczas pobierania warunków gwarancji z Allegro"
    );
  }
}
