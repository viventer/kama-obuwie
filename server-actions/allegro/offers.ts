"use server";

import { PostOfferBody } from "@/app/api/allegro/offers/route";
import {
  AllegroOffer,
  AllegroOfferParameters,
  Offer,
} from "@/firebase/schemas/offersSchemas";
import {
  ColorVariant,
  Description,
  DescriptionVariable,
  DescriptionVariables,
  Product,
  ProductParameters,
} from "@/firebase/schemas/productsSchemas";
import { getAllegroUserAccessTokens, getAllegroUserAccessToken } from "./auth";
import {
  AllegroHeaders,
  getAllegroHeaders,
  getSingleAllegroHeaders,
} from "./global";
import axios, { AxiosError } from "axios";
import { getImageUrl } from "../images/images";
import { verifyUser } from "../auth/auth";
import { choosingSizeImageFilePath } from "@/lib/constants";
import { getColorVariantName } from "@/components/adminPanel/products/helpers/productsHelpers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

type Primitive = string | number | boolean | string[] | number[];

type AllegroIndividualOffer = {
  allegroOfferData: Omit<AllegroOffer, "stock" | "description" | "productSet">;
  insoleLength: {
    size: string;
    insoleLength: number;
  };
  insoleLengths: {
    size: string;
    insoleLength: number;
  }[];
  offer: Offer;
  product: Product;
  colorVariant: ColorVariant;
  allegroHeaders: AllegroHeaders;
  url: string;
  allegroCategoryId: string;
  images: string[];
  channel: "AL1" | "AL2";
};

export const getAllegroOffer = async (
  id: string,
  channel: "AL1" | "AL2"
): Promise<AllegroOffer> => {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const accessToken = await getAllegroUserAccessToken(channel);
  const headers = getSingleAllegroHeaders(accessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers/${id}`;

  const response = await axios.get(url, { headers });
  const data = response.data;

  if (!data) {
    throw new Error("Nie znaleziono oferty na Allegro.");
  }

  return data as AllegroOffer;
};

export const postAllegroOffer = async (
  data: PostOfferBody
): Promise<{ AL1: Record<string, string>; AL2: Record<string, string> }> => {
  await verifyUser(["ADMIN", "VERIFIED"]);
  const {
    offer,
    product,
    images,
    allegroCategoryId,
    sizingTable,
    colorVariant,
  } = data;

  const choosingSizeImageUrl = await getImageUrl(choosingSizeImageFilePath);
  images.push(choosingSizeImageUrl as string);

  // Pobierz tokeny dla obu kont
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const allegroHeaders = getAllegroHeaders(AL1AccessToken, AL2AccessToken);

  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers`;
  const insoleLengths = sizingTable.insoleLengths;

  const results = { AL1: {}, AL2: {} } as {
    AL1: Record<string, string>;
    AL2: Record<string, string>;
  };

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

    for (const insoleLength of insoleLengths) {
      const allegroId = await postIndividualAllegroOffer({
        allegroOfferData,
        insoleLength,
        insoleLengths,
        offer,
        product,
        colorVariant,
        allegroHeaders: allegroHeaders[channel],
        url,
        allegroCategoryId,
        images,
        channel,
      });

      channelResults[insoleLength.size.toString()] = allegroId;
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
  data: AllegroIndividualOffer
): Promise<string> {
  const {
    images,
    allegroOfferData,
    insoleLength,
    insoleLengths,
    offer,
    product,
    colorVariant,
    allegroHeaders,
    url,
    allegroCategoryId,
    channel,
  } = data;

  const formattedProductParameters = await formatAllegroProductParameters(
    product.parameters,
    allegroCategoryId,
    product.brand
  );
  const formattedManufacturerCode = `${product.manufacturerCode} ${colorVariant.color}`;

  const shadeValue = colorVariant.shade ?? "";
  const additionalColorValue = colorVariant.additionalColor ?? "brak";

  const sizeParameterName =
    product.rootCategory === "obuwie dziecięce" ? "Rozmiar (new)" : "Rozmiar";

  const insoleLengthParameterName =
    product.rootCategory === "obuwie dziecięce"
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

  const productSet = [
    {
      marketedBeforeGPSRObligation: true,
      product: {
        name: `${offer.title} ${insoleLength.size}`,
        category: {
          id: allegroCategoryId,
        },
        parameters: allegroProductParameters,
        images: images,
      },
    },
  ];

  const formattedSizingTable = getFormattedSizingTable(insoleLengths);

  const descriptionVariableValues: Record<DescriptionVariable, string> = {
    rozmiar: insoleLength.size.toString(),
    kolor: colorVariant.color,
    marka: product.brand || "",
    "kod producenta": product.manufacturerCode || "",
    rozmiarówka: formattedSizingTable,
    "długość wkładki":
      insoleLength.insoleLength.toString().replace(".", ",") + " cm",
    "tytuł oferty": offer.title,
  };

  const description = await convertToAllegroDescription(
    product.description as Description,
    images,
    descriptionVariableValues
  );

  const signature = `${product.brand ? product.brand : ""} ${
    product.manufacturerCode
  } ${getColorVariantName(colorVariant)}`;

  // Dodaj unikalny identyfikator z kanałem i rozmiarem
  const externalId = `${signature} ${channel}r${insoleLength.size}`;

  const allegroOffer: AllegroOffer = {
    ...allegroOfferData,
    description,
    productSet,
    stock: {
      available: Number(offer.availability[insoleLength.size].value),
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
    const error = err as AxiosError<{
      errors: Array<{
        code: string;
        details: string;
        message: string;
        path: string;
        userMessage: string;
        metadata: Record<string, any>;
      }>;
    }>;

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", JSON.stringify(error.response.data, null, 2));
      error.response.data.errors.forEach((e, idx) => {
        console.error(`Error #${idx + 1}`);
        console.error("  code       :", e.code);
        console.error("  message    :", e.message);
        console.error("  details    :", e.details);
        console.error("  userMessage:", e.userMessage);
        console.error("  path       :", e.path);
        console.error("  metadata   :", JSON.stringify(e.metadata));
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      // Błąd w konfiguracji Axios lub inny
      console.error("Unexpected error:", error.message);
    }
    throw new Error(
      `Błąd podczas publikacji oferty na Allegro: ${error.message}`
    );
  }
}

async function formatAllegroProductParameters(
  productParameters: ProductParameters,
  allegroCategoryId: string,
  productBrand?: string
): Promise<AllegroOfferParameters> {
  const result: AllegroOfferParameters = [];

  // 1. Scalamy wszystkie required + optional
  const allEntries: [string, Primitive | Primitive[]][] = [
    ...Object.entries(productParameters.required),
    ...Object.entries(productParameters.optional),
  ];

  for (const [name, rawValue] of allEntries) {
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
            "Brak marki produktu, ale marka 'inna' została wybrana."
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
    (p: { name: string }) => p.name === "Marka"
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

function replaceDescriptionVariables(
  text: string,
  values: Record<DescriptionVariable, string>
): string {
  let result = stripWrapperParagraphs(text);

  for (const variable of DescriptionVariables) {
    const regex = new RegExp(`{${variable}}`, "g");
    result = result.replace(regex, values[variable] ?? "");
  }

  return result;
}

function getFormattedSizingTable(
  insoleLengths: { size: string; insoleLength: number }[]
): string {
  const header = `
<h2>Jak dobrać rozmiar?</h2>
<p><b>1.</b>&nbsp;Stojąc na kartce papieru odrysuj kontur stopy.</p>
<p><b>2.</b>&nbsp;Zmierz w centymetrach odległość pomiędzy najdalszymi punktami (A).</p>
<p><b>3.</b>&nbsp;Dodaj do wyniku 0,5 cm i porównaj z długościami podanymi poniżej:</p>
`.trim();

  const listItems = insoleLengths
    .map(
      ({ size, insoleLength }) =>
        `<ul><li><b>r. ${size}</b> - ${insoleLength} cm</li></ul>`
    )
    .join("");

  return header + listItems;
}

export async function convertToAllegroDescription(
  description: Description,
  imagesUrls: string[],
  variableValues: Record<string, string>
): Promise<{
  sections: Array<{
    items: Array<{ type: "TEXT" | "IMAGE"; content?: string; url?: string }>;
  }>;
}> {
  const sections: Array<{
    items: Array<{ type: "TEXT" | "IMAGE"; content?: string; url?: string }>;
  }> = [];

  for (const row of description) {
    const items: Array<{
      type: "TEXT" | "IMAGE";
      content?: string;
      url?: string;
    }> = [];

    for (let idx = 0; idx < row.elementsTypes.length; idx++) {
      const type = row.elementsTypes[idx];
      const element = row.elements[idx];

      if (type === "text") {
        const raw = element.content ?? "";
        let content = replaceDescriptionVariables(raw, variableValues);
        content = content
          .replace(/<strong>/g, "<b>")
          .replace(/<\/strong>/g, "</b>")
          .replace(/<br\s*\/?>/gi, "");

        if (content) {
          items.push({ type: "TEXT", content });
        }
      } else if (type === "image") {
        const key = element.image!;
        let url: string;

        if (key === "rozmiarówka") {
          url = imagesUrls[imagesUrls.length - 1];
        } else {
          const index = parseInt(key, 10);
          url = imagesUrls[index - 1];
        }

        items.push({ type: "IMAGE", url });
      }
    }

    sections.push({ items });
  }

  return { sections };
}

function stripWrapperParagraphs(text: string): string {
  return text.replace(/<p>\s*{rozmiarówka}\s*<\/p>/g, "{rozmiarówka}");
}
