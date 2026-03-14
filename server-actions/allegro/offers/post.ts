"use server";

import { PostOfferBody } from "@/app/api/allegro/offers/route";
import {
  AllegroIndividualOffer,
  AllegroOffer,
} from "@/firebase/schemas/offersSchemas";
import {
  Description,
  DescriptionVariable,
} from "@/firebase/schemas/productsSchemas";
import { convertToAllegroDescription } from "@/helpers/allegroOffers";

import axios from "axios";
import { choosingSizeImageFilePath, safetyInformation } from "@/lib/constants";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { addMissingAllegroParameters } from "@/components/adminPanel/assortment/helpers/allegroParameters";
import { getFormattedSizingTable } from "@/lib/utils";
import { buildExternalId } from "@/helpers/externalId";
import { resolveSingleAvailabilityKey } from "@/helpers/availability";
import { verifyUser } from "@/server-actions/auth/auth";
import { getAllegroUserAccessTokens } from "../auth";
import { getImageUrl } from "@/server-actions/files/files";
import { getAllegroHeaders } from "../global";
import { getProductParametersNames } from "../products";
import { formatAllegroProductParameters } from "./parameters";
import { handleAllegroApiError } from "@/server-actions/errorHandlers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export const postAllegroOffer = async (
  data: PostOfferBody,
): Promise<{ AL1: Record<string, string>; AL2: Record<string, string> }> => {
  await verifyUser(["ADMIN", "VERIFIED"]);
  const {
    offer,
    product,
    images,
    allegroCategoryId,
    sizingTable,
    colorVariant,
    SKU,
  } = data;

  const choosingSizeImageUrl = await getImageUrl(choosingSizeImageFilePath);
  if (choosingSizeImageUrl) {
    images.push(choosingSizeImageUrl as string);
  }

  // Pobierz tokeny dla obu kont
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const allegroHeaders = getAllegroHeaders(AL1AccessToken, AL2AccessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers`;
  const insoleLengths = sizingTable?.insoleLengths || [];
  const hasSizes = insoleLengths.length > 0;

  const results = { AL1: {}, AL2: {} } as {
    AL1: Record<string, string>;
    AL2: Record<string, string>;
  };

  const parametersNames = await getProductParametersNames(allegroCategoryId);

  // Przetwórz oba konta równolegle
  const channelPromises = (["AL1", "AL2"] as const).map(async (channel) => {
    const allegroOfferData: Omit<
      AllegroOffer,
      "stock" | "description" | "productSet"
    > = {
      sellingMode: {
        price: {
          amount: offer.sellingPrices[channel] as string,
          currency: "PLN",
        },
      },
      delivery: {
        handlingTime: "PT24H",
        shippingRates: {
          id: offer.shippingRates[channel]?.allegroId as string,
        },
      },
      images,
      afterSalesServices: {
        returnPolicy: {
          id: offer.returnPolicy![channel] as string,
        },
        impliedWarranty: {
          id: offer.impliedWarranty![channel] as string,
        },
      },
      payments: {
        invoice: "VAT" as const,
      },
      taxSettings: {
        rates: [
          {
            rate: "23.00" as const,
            countryCode: "PL" as const,
          },
        ],
      },
    };

    // Dodaj tabele rozmiarów tylko dla AL1
    if (channel === "AL1" && sizingTable.allegroId) {
      allegroOfferData.sizeTable = { id: sizingTable.allegroId };
    }

    if (offer.warranty?.[channel]) {
      allegroOfferData.afterSalesServices.warranty = {
        id: offer.warranty[channel],
      };
    }

    const channelResults: Record<string, string> = {};

    if (hasSizes) {
      for (const insoleLength of insoleLengths) {
        const allegroId = await postIndividualAllegroOffer(
          {
            allegroOfferData,
            insoleLength,
            insoleLengths,
            availabilityKey: insoleLength.size.toString(),
            offer,
            product,
            colorVariant,
            allegroHeaders: allegroHeaders[channel],
            url,
            allegroCategoryId,
            images,
            channel,
            SKU,
          },
          parametersNames,
        );

        channelResults[insoleLength.size.toString()] = allegroId;
      }
    } else {
      const availabilityKey = resolveSingleAvailabilityKey(offer.availability);

      const allegroId = await postIndividualAllegroOffer(
        {
          allegroOfferData,
          insoleLength: null,
          insoleLengths: [],
          availabilityKey,
          offer,
          product,
          colorVariant,
          allegroHeaders: allegroHeaders[channel],
          url,
          allegroCategoryId,
          images,
          channel,
          SKU,
        },
        parametersNames,
      );

      channelResults[availabilityKey] = allegroId;
    }

    return { channel, results: channelResults };
  });

  const channelResults = await Promise.all(channelPromises);

  channelResults.forEach(({ channel, results: channelResultsData }) => {
    results[channel] = channelResultsData;
  });

  return results;
};

export async function postIndividualAllegroOffer(
  data: AllegroIndividualOffer,
  parametersNames: string[],
): Promise<string> {
  const {
    images,
    allegroOfferData,
    insoleLength,
    insoleLengths,
    availabilityKey,
    offer,
    product,
    colorVariant,
    allegroHeaders,
    url,
    allegroCategoryId,
    channel,
    SKU,
  } = data;

  // Upewnij się, że obrazek "jak dobrać rozmiar" jest na końcu listy (idempotentnie)
  const choosingSizeImageUrl = await getImageUrl(choosingSizeImageFilePath);
  if (choosingSizeImageUrl) {
    const urlStr = choosingSizeImageUrl as string;
    const existingIndex = images.indexOf(urlStr);
    if (existingIndex !== -1) {
      images.splice(existingIndex, 1);
    }
    images.push(urlStr);
  }

  const formattedProductParameters = await formatAllegroProductParameters(
    {
      productParameters: product.parameters,
      allegroCategoryId,
      productBrand: product.brand,
    },
    parametersNames,
  );

  const allegroProductParameters = addMissingAllegroParameters(
    formattedProductParameters,
    product.rootCategory as string,
    insoleLength || null,
    colorVariant,
    product.manufacturerCode,
    insoleLength ? offer.EAN?.[`r${insoleLength.size}`] : undefined,
  );

  if (!product?.responsibleProducer?.[channel]) {
    throw new Error(`Brak producenta odpowiedzialnego dla kanału ${channel}.`);
  }

  const productSet = [
    {
      responsibleProducer: {
        type: "NAME" as const,
        name: product.responsibleProducer[channel],
      },
      safetyInformation: {
        type: "TEXT" as const,
        description: safetyInformation,
      },
      responsiblePerson: {
        name: process.env.RESPONSIBLE_PERSON_NAME!,
      },
      product: {
        name: `${offer.title}${insoleLength?.size ? ` ${insoleLength.size}` : ""}`,
        category: {
          id: allegroCategoryId,
        },
        parameters: allegroProductParameters,
        images: images,
      },
    },
  ];

  const formattedSizingTable =
    Array.isArray(insoleLengths) && insoleLengths.length > 0
      ? getFormattedSizingTable(insoleLengths)
      : "";

  const descriptionVariableValues: Record<DescriptionVariable, string> = {
    rozmiar: insoleLength?.size?.toString() || "",
    kolor: colorVariant.color,
    marka: product.brand || "",
    "kod producenta": product.manufacturerCode || "",
    rozmiarówka: formattedSizingTable,
    "długość wkładki": insoleLength
      ? insoleLength.insoleLength.toString().replace(".", ",") + " cm"
      : "",
    "tytuł oferty": offer.title,
  };

  const description = await convertToAllegroDescription(
    product.description as Description,
    images,
    descriptionVariableValues,
  );

  const signature = `${product.brand ? product.brand : ""} ${
    product.manufacturerCode
  } ${getColorVariantName(colorVariant)}`;

  // Dodaj unikalny identyfikator (dla akcesoriów może nie być rozmiaru)
  const externalId = buildExternalId({
    signature,
    SKU,
    size: insoleLength?.size || null,
  });

  const allegroOffer: AllegroOffer = {
    ...allegroOfferData,
    description,
    productSet,
    stock: {
      available: Number(offer.availability?.[availabilityKey]?.value || "0"),
      unit: "PAIR",
    },
    external: {
      id: externalId,
    },
  };

  try {
    const resp = await axios.post(url, allegroOffer, {
      headers: allegroHeaders,
    });
    return resp.data.id! as string;
  } catch (err) {
    return handleAllegroApiError(
      err,
      "Błąd podczas tworzenia oferty na Allegro",
    );
  }
}
