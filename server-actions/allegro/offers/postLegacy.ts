"use server";

import {
  AllegroOffer,
  AllegroOfferParameters,
  OfferWithId,
} from "@/firebase/schemas/offersSchemas";
import {
  convertToAllegroDescription,
  removeDynamicSizeAndInsoleParameters,
  replaceVariablesInAllegroOfferDescription,
} from "@/helpers/allegroOffers";
import axios from "axios";
import { choosingSizeImageFilePath, safetyInformation } from "@/lib/constants";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { buildExternalId } from "@/helpers/externalId";
import { getImageUrl } from "@/server-actions/files/files";
import { handleAllegroApiError } from "@/server-actions/errorHandlers";

export async function postIndividualAllegroOfferFromLegacy(params: {
  offer: OfferWithId;
  legacy: LegacyProductWithId;
  size: string;
  insoleLengthText: string;
  insoleLengthValue: number;
  channel: "AL1" | "AL2";
  allegroHeaders: Record<string, string>;
  url: string;
  allegroCategoryId: string;
  images: string[];
  productParameters: AllegroOfferParameters;
  sizeTableAllegroId?: string;
}): Promise<string> {
  const {
    offer,
    legacy,
    size,
    insoleLengthText,
    insoleLengthValue,
    channel,
    allegroHeaders,
    url,
    allegroCategoryId,
    images: inputImages,
    productParameters,
    sizeTableAllegroId,
  } = params;

  if (!offer.SKU) {
    throw new Error("Brak SKU w ofercie.");
  }
  if (!offer.signature) {
    throw new Error("Brak signature w ofercie.");
  }
  if (!offer.availability?.[size]) {
    throw new Error(`Rozmiar ${size} nie istpnieje w dostępności oferty.`);
  }
  if (!legacy.allegroDescription) {
    throw new Error("Brak allegroDescription w legacyProduct.");
  }
  if (!insoleLengthText) {
    throw new Error("Brak insoleLengthText dla wystawienia oferty legacy.");
  }
  if (Number.isNaN(insoleLengthValue)) {
    throw new Error("Brak insoleLengthValue dla wystawienia oferty legacy.");
  }
  if (!legacy.responsibleProducer) {
    throw new Error("Brak responsibleProducer w legacyProduct.");
  }

  const insoleLengthParamName =
    legacy.rootCategory === "obuwie dziecięce"
      ? "Długość wkładki wew."
      : "Długość wkładki";

  const nextProductParameters: AllegroOfferParameters = [
    ...removeDynamicSizeAndInsoleParameters(productParameters),
    { name: "Rozmiar", values: [size] },
    { name: insoleLengthParamName, values: [insoleLengthValue] },
  ];

  // Idempotentnie dopnij obrazek "jak dobrać rozmiar" na koniec
  const images = [...inputImages];
  const choosingSizeImageUrl = await getImageUrl(choosingSizeImageFilePath);
  if (choosingSizeImageUrl) {
    const urlStr = choosingSizeImageUrl as string;
    const existingIndex = images.indexOf(urlStr);
    if (existingIndex !== -1) {
      images.splice(existingIndex, 1);
    }
    images.push(urlStr);
  }

  const nextPrice = offer.sellingPrices?.[channel];
  if (!nextPrice) {
    throw new Error(`Brak ceny sprzedaży dla kanału ${channel}.`);
  }

  const shippingRateId = offer.shippingRates?.[channel]?.allegroId;
  if (!shippingRateId) {
    throw new Error(
      `Brak stawek wysyłki (shippingRates) dla kanału ${channel}.`,
    );
  }

  const impliedWarrantyId = offer.impliedWarranty?.[channel];
  if (!impliedWarrantyId) {
    throw new Error(
      `Brak warunków reklamacji (impliedWarranty) dla kanału ${channel}.`,
    );
  }

  const returnPolicyId = offer.returnPolicy?.[channel];
  if (!returnPolicyId) {
    throw new Error(
      `Brak polityki zwrotów (returnPolicy) dla kanału ${channel}.`,
    );
  }

  const productSet = [
    {
      responsibleProducer: {
        type: "NAME" as const,
        name: legacy.responsibleProducer,
      },
      safetyInformation: {
        type: "TEXT" as const,
        description: safetyInformation,
      },
      responsiblePerson: {
        name: process.env.RESPONSIBLE_PERSON_NAME!,
      },
      product: {
        name: `${offer.title} ${size ? size : ""}`.trim(),
        category: {
          id: allegroCategoryId,
        },
        parameters: nextProductParameters,
        images: images,
      },
    },
  ];

  const nextExternalId = buildExternalId({
    signature: offer.signature,
    SKU: offer.SKU,
    size,
  });

  const description = replaceVariablesInAllegroOfferDescription({
    description: legacy.allegroDescription,
    variableValues: {
      rozmiar: size,
      "długość wkładki": insoleLengthText,
    },
  });

  const payload: AllegroOffer = {
    description,
    productSet,
    sellingMode: {
      price: {
        amount: nextPrice as string,
        currency: "PLN",
      },
    },
    delivery: {
      handlingTime: "PT24H",
      shippingRates: {
        id: shippingRateId,
      },
    },
    images,
    afterSalesServices: {
      impliedWarranty: { id: impliedWarrantyId as string },
      returnPolicy: { id: returnPolicyId as string },
      ...(offer.warranty?.[channel]
        ? { warranty: { id: offer.warranty[channel] } }
        : {}),
    },
    stock: {
      available: Number(offer.availability[size].value || "0"),
      unit: "PAIR",
    },
    external: { id: nextExternalId },
    ...(channel === "AL1" && sizeTableAllegroId
      ? { sizeTable: { id: sizeTableAllegroId } }
      : {}),
  };

  try {
    const resp = await axios.post(url, payload, {
      headers: allegroHeaders,
    });
    return resp.data.id! as string;
  } catch (err) {
    return handleAllegroApiError(
      err,
      "Błąd podczas tworzenia oferty na Allegro (legacy)",
    );
  }
}

export { convertToAllegroDescription };
