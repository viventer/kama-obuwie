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
import { getAllegroUserAccessToken } from "./auth";
import { AllegroHeaders, getAllegroHeaders } from "./global";
import axios, { AxiosError } from "axios";
import { getImageUrl } from "../images/images";
import { verifyUser } from "../auth/auth";
import { choosingSizeImageFilePath } from "@/lib/constants";

const ALLEGRO_API_BASE_URL = process.env.ALLEGRO_API_BASE_URL!;

type Primitive = string | number | boolean | string[] | number[];

type AllegroIndividualOffer = {
  allegroOfferData: Omit<AllegroOffer, "stock" | "description" | "productSet">;
  insoleLength: {
    size: number;
    insoleLength: number;
  };
  insoleLengths: {
    size: number;
    insoleLength: number;
  }[];
  offer: Offer;
  product: Product;
  colorVariant: ColorVariant;
  allegroHeaders: AllegroHeaders;
  url: string;
  allegroCategoryId: string;
  images: string[];
};

export const postAllegroOffer = async (
  data: PostOfferBody
): Promise<Record<string, string>> => {
  verifyUser(["ADMIN", "VERIFIED"]);
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

  const allegroOfferData: Omit<
    AllegroOffer,
    "stock" | "description" | "productSet"
  > = {
    sellingMode: {
      price: {
        amount: offer.sellingPrices.AL1 as string,
        currency: "PLN",
      },
    },
    delivery: {
      handlingTime: "PT24H",
      shippingRates: {
        id: offer.shippingRates.AL1?.allegroId as string,
      },
    },
    images,
  };

  const insoleLengths = sizingTable.insoleLengths;

  const accessToken = await getAllegroUserAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/product-offers`;
  const allegroHeaders = getAllegroHeaders(accessToken);

  const allegroIds: Record<string, string> = {};

  for (const insoleLength of insoleLengths) {
    const allegroId = await postIndividualAllegroOffer({
      allegroOfferData,
      insoleLength,
      insoleLengths,
      offer,
      product,
      colorVariant,
      allegroHeaders,
      url,
      allegroCategoryId,
      images,
    });

    allegroIds[insoleLength.size.toString()] = allegroId;
  }

  return allegroIds;
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
  } = data;

  const formattedProductParameters = formatAllegroProductParameters(
    product.parameters
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
    "długość wkładki": insoleLength.insoleLength.toString(),
    "tytuł oferty": offer.title,
  };

  const description = await convertToAllegroDescription(
    product.description as Description,
    images,
    descriptionVariableValues
  );

  const allegroOffer: AllegroOffer = {
    ...allegroOfferData,
    description,
    productSet,
    stock: {
      available: Number(offer.availability[insoleLength.size].value),
    },
    external: {
      id: offer.signature,
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

function formatAllegroProductParameters(
  productParameters: ProductParameters
): AllegroOfferParameters {
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
      result.push({ name, values: [rawValue] });
    }
  }

  return result;
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
  insoleLengths: { size: number; insoleLength: number }[]
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
          .replace(/<\/strong>/g, "</b>");

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
