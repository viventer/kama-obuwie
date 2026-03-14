"use server";

import { AllegroOfferParameters } from "@/firebase/schemas/offersSchemas";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";
import { getAllegroUserAccessToken } from "../auth";
import { getSingleAllegroHeaders } from "../global";
import axios from "axios";

type Primitive = string | number | boolean | string[] | number[];

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export async function formatAllegroProductParameters(
  productData: {
    productParameters: ProductParameters;
    allegroCategoryId: string;
    productBrand?: string;
  },
  parametersNames: string[],
): Promise<AllegroOfferParameters> {
  const result: AllegroOfferParameters = [];
  const { productParameters, allegroCategoryId, productBrand } = productData;

  // 1. Scalamy wszystkie required + optional
  const allEntries: [string, Primitive | Primitive[]][] = [
    ...Object.entries(productParameters.required),
    ...Object.entries(productParameters.optional),
  ];

  for (const [name, rawValue] of allEntries) {
    if (!parametersNames.includes(name.toLowerCase())) {
      console.warn(
        `Parametr "${name}" nie jest dostępny w Allegro dla kategorii ${allegroCategoryId} i zostanie pominięty.`,
      );
      continue;
    }
    // 2. Usuń puste stringi
    if (Array.isArray(rawValue)) {
      // Tablica → przefiltruj
      const cleaned = rawValue.filter((v) => v !== "");
      if (cleaned.length === 0) {
        // cała tablica była pusta → pomiń parametr
        continue;
      }
      // wyciągnij pierwszą i resztę
      const values: [Primitive, ...Primitive[]] = [
        cleaned[0],
        ...cleaned.slice(1),
      ];
      result.push({ name, values });
    } else {
      // Pojedyncza wartość
      if (rawValue === "") {
        // pusty string → pomiń parametr
        continue;
      }

      if (
        name === "Marka" &&
        (rawValue === "inna" || rawValue === "Inna marka")
      ) {
        if (!productBrand) {
          throw new Error(
            "Brak marki produktu, ale marka 'inna' została wybrana.",
          );
        }

        const { ambiguousValueId, parameterId } =
          await getAllegroBrandAmbiguousValueId(allegroCategoryId);

        result.push({
          name: "Marka",
          valuesIds: [ambiguousValueId],
          values: [productBrand],
        });

        continue;
      }

      result.push({ name, values: [rawValue] });
    }
  }

  return result;
}

async function getAllegroBrandAmbiguousValueId(categoryId: string): Promise<{
  ambiguousValueId: string;
  parameterId: string;
}> {
  const accessToken = await getAllegroUserAccessToken();
  const headers = getSingleAllegroHeaders(accessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/categories/${categoryId}/parameters`;

  const resp = await axios.get(url, {
    headers,
  });
  const parameters = resp.data.parameters;

  const brandParameter = parameters.find(
    (p: { name: string }) => p.name === "Marka",
  );

  if (!brandParameter) {
    throw new Error("Nie znaleziono parametru 'Marka' w kategorii.");
  }

  const ambiguousValueId = brandParameter.options.ambiguousValueId;

  return {
    ambiguousValueId,
    parameterId: brandParameter.id,
  };
}
