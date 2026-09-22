"use server";

import { PostOfferBody } from "@/app/api/allegro/offers/route";
import {
  AllegroOffer,
  AllegroOfferParameters,
  Offer,
  OfferWithId,
} from "@/firebase/schemas/offersSchemas";
import {
  ColorVariant,
  Description,
  DescriptionVariable,
  Product,
  ProductParameters,
} from "@/firebase/schemas/productsSchemas";
import {
  convertToAllegroDescription,
  removeDynamicSizeAndInsoleParameters,
  replaceVariablesInAllegroOfferDescription,
} from "@/helpers/allegroOffers";
import {
  getAllegroUserAccessTokens,
  getAllegroUserAccessToken,
  getAllegroAccessTokensForBackgroundJob,
} from "./auth";
import {
  AllegroHeaders,
  getAllegroHeaders,
  getSingleAllegroHeaders,
} from "./global";
import axios from "axios";
import { getImageUrl, getImagesUrls } from "../files/files";
import { verifyUser } from "../auth/auth";
import { choosingSizeImageFilePath, safetyInformation } from "@/lib/constants";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { handleAllegroApiError } from "../errorHandlers";
import { addMissingAllegroParameters } from "@/components/adminPanel/assortment/helpers/allegroParameters";
import { getFormattedSizingTable } from "@/lib/utils";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { buildExternalId } from "@/helpers/externalId";
import { resolveSingleAvailabilityKey } from "@/helpers/availability";
import {
  AllegroProductParametersResponse,
  getProductParametersNames,
} from "./products";
import {
  getAllegroResponsibleProducers,
  resolveAllegroResponsibleProducerName,
  type ResponsibleProducer,
} from "./responsibleProducers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

type Primitive = string | number | boolean | string[] | number[];

type AllegroIndividualOffer = {
  allegroOfferData: Omit<AllegroOffer, "stock" | "description" | "productSet">;
  insoleLength?: {
    size: string;
    insoleLength: number;
  } | null;
  insoleLengths?: {
    size: string;
    insoleLength: number;
  }[];
  availabilityKey: string;
  offer: Offer;
  product: Product;
  colorVariant: ColorVariant;
  allegroHeaders: AllegroHeaders;
  url: string;
  allegroCategoryId: string;
  images: string[];
  channel: "AL1" | "AL2";
  SKU: string;
  availableResponsibleProducers?: ResponsibleProducer[];
};

export const editAllegroOffer = async (
  id: string,
  channel: "AL1" | "AL2",
  data: Partial<AllegroOffer>,
  options?: { userId?: string; skipAuth?: boolean },
): Promise<void> => {
  // Pomiń weryfikację jeśli mamy userId (zadanie w tle) lub skipAuth
  if (!options?.userId && !options?.skipAuth) {
    await verifyUser(["ADMIN", "VERIFIED"]);
  }

  let accessToken: string;
  if (options?.userId) {
    // Zadanie w tle - użyj funkcji bez sesji
    const tokens = await getAllegroAccessTokensForBackgroundJob();
    accessToken = tokens[channel];
  } else {
    // Normalny request - użyj sesji
    accessToken = await getAllegroUserAccessToken(channel);
  }

  const headers = getSingleAllegroHeaders(accessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers/${id}`;

  try {
    await axios.patch(url, data, { headers });
  } catch (error) {
    handleAllegroApiError(error, "Błąd podczas edytowania oferty Allegro");
  }
};

export const getAllegroOffer = async (
  id: string,
  channel: "AL1" | "AL2",
  options?: { userId?: string; skipAuth?: boolean },
): Promise<AllegroOffer> => {
  // Pomiń weryfikację jeśli mamy userId (zadanie w tle) lub skipAuth
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

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers/${id}`;

  try {
    const response = await axios.get(url, { headers });
    const data = response.data;
    if (!data) {
      throw new Error("Nie znaleziono oferty na Allegro.");
    }

    return data as AllegroOffer;
  } catch (error) {
    handleAllegroApiError(error, "Błąd podczas pobierania oferty z Allegro");
  }
};

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
  const responsibleProducers = await getAllegroResponsibleProducers();

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
            availableResponsibleProducers:
              responsibleProducers?.[channel] ?? undefined,
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
          availableResponsibleProducers:
            responsibleProducers?.[channel] ?? undefined,
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

  const responsibleProducerName = await resolveAllegroResponsibleProducerName(
    product.responsibleProducer[channel],
    channel,
    { availableProducers: data.availableResponsibleProducers },
  );

  const productSet = [
    {
      responsibleProducer: {
        type: "NAME" as const,
        name: responsibleProducerName,
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

  const colorVariantName = getColorVariantName(colorVariant);
  const aiPhotos = (product.editedPhotos || []).filter(
    (p) => p.isAiCoCreated && p.colorVariantName === colorVariantName,
  );
  const aiUrls =
    aiPhotos.length > 0
      ? (await getImagesUrls(aiPhotos.map((p) => p.filePath))) || []
      : [];
  const aiCoCreatedImages = aiUrls
    .filter((url) => images.includes(url))
    .map((url) => ({ url }));

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
    ...(aiCoCreatedImages.length > 0
      ? { aiCoCreatedContent: { images: aiCoCreatedImages } }
      : {}),
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
  availableResponsibleProducers?: ResponsibleProducer[];
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
    availableResponsibleProducers,
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

  const responsibleProducerName = await resolveAllegroResponsibleProducerName(
    legacy.responsibleProducer,
    channel,
    { availableProducers: availableResponsibleProducers },
  );

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
        name: responsibleProducerName,
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

export async function formatAllegroProductParameters(
  productData: {
    productParameters: ProductParameters;
    allegroCategoryId: string;
  },
  parametersNames: string[],
): Promise<AllegroOfferParameters> {
  const result: AllegroOfferParameters = [];
  const { productParameters, allegroCategoryId } = productData;

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

      // "inna" / "Inna marka" nie jest już dostępna w Allegro (brak ambiguousValueId).
      // Oferty legacy z tą wartością mapujemy na słownikową wartość "bez marki".
      if (
        name === "Marka" &&
        (rawValue === "inna" || rawValue === "Inna marka")
      ) {
        result.push({ name: "Marka", values: ["bez marki"] });
        continue;
      }

      result.push({ name, values: [rawValue] });
    }
  }

  return result;
}

export { convertToAllegroDescription };
