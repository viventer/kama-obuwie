import {
  AllegroOfferParameters,
  Offer,
} from "@/firebase/schemas/offersSchemas";
import { ColorVariant } from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "./productsHelpers";

/**
 * Dodaje brakujące parametry Allegro do listy i decyduje o ich nazwach na podstawie rootCategory
 */
export function addMissingAllegroParameters(
  formattedProductParameters: AllegroOfferParameters,
  rootCategory: string,
  insoleLength: { size: string; insoleLength: number },
  colorVariant: ColorVariant,
  manufacturerCode: string,
  EAN?: string
): AllegroOfferParameters {
  const formattedManufacturerCode = `${manufacturerCode} ${getColorVariantName(
    colorVariant
  )}`;
  const shadeValue = colorVariant.shade ?? "";
  const additionalColorValue = colorVariant.additionalColor ?? "brak";

  const sizeParameterName =
    rootCategory === "obuwie dziecięce" ? "Rozmiar (new)" : "Rozmiar";

  const insoleLengthParameterName =
    rootCategory === "obuwie dziecięce"
      ? "Długość wkładki wew."
      : "Długość wkładki";

  const allegroProductParameters: AllegroOfferParameters = [
    ...formattedProductParameters,
    {
      name: sizeParameterName,
      values: [insoleLength.size.toString()],
    },
    {
      name: insoleLengthParameterName,
      values: [insoleLength.insoleLength.toString()],
    },
    {
      name: "Kolor",
      values: [colorVariant.color],
    },
    {
      name: "Kod producenta",
      values: [formattedManufacturerCode],
    },
  ];

  if (shadeValue) {
    allegroProductParameters.push({
      name: "Odcień",
      values: [shadeValue],
    });
  }

  if (additionalColorValue) {
    allegroProductParameters.push({
      name: "Kolor dodatkowy",
      values: [additionalColorValue],
    });
  }

  if (EAN) {
    allegroProductParameters.push({
      name: "EAN (GTIN)",
      values: [EAN],
    });
  }

  return allegroProductParameters;
}
