import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { ALLEGRO_API_BASE_URL, getAllegroHeaders } from "./global";

type DictionaryValue = {
  id: string;
  value: string;
  dependsOnValueIds: string[];
};

type Restrictions = {
  multipleChoices: boolean;
};

export type AllegroProductParameter = {
  id: string;
  name: string;
  type: "dictionary" | "float" | "integer" | "string" | "boolean";
  required: boolean;
  requiredIf: null;
  displayedIf: null;
  dictionary?: DictionaryValue[];
  restrictions?: Restrictions;
  unit: string | null;
};

export type AllegroProductParametersResponse = {
  [key: string]: AllegroProductParameter;
};

export async function getProductParameters(
  allegroCategoryId: string
): Promise<AllegroProductParametersResponse> {
  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/sale/categories/${allegroCategoryId}/product-parameters`;
  const response = await axios.get(url, {
    headers: allegroHeaders,
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch product parameters");
  }

  const parameters = response.data.parameters;
  return parameters;
}
