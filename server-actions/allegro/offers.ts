"use server";

import { PostOfferBody } from "@/app/api/allegro/offers/route";
import {
  AllegroOffer,
  AllegroOfferDescriptionSectionSchema,
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
import { getAllegroAccessToken } from "./auth";
import {
  ALLEGRO_API_BASE_URL,
  AllegroHeaders,
  getAllegroHeaders,
} from "./global";
import axios from "axios";
import { choosingSizeImageFilePath } from "@/lib/constants";
import { getImagesUrls, getImageUrl } from "../images/images";

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
};

export async function postAllegroOffer(
  data: PostOfferBody
): Promise<Record<string, string>> {
  const {
    offer,
    product,
    images,
    allegroCategoryId,
    sizingTable,
    colorVariant,
  } = data;

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
    images: images,
  };

  const insoleLengths = sizingTable.insoleLengths;

  const accessToken = await getAllegroAccessToken();
  const url = `${ALLEGRO_API_BASE_URL}/sale/offers`;
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
    });

    allegroIds[insoleLength.size.toString()] = allegroId;
  }

  return allegroIds;
}

export async function postIndividualAllegroOffer(
  data: AllegroIndividualOffer
): Promise<string> {
  const {
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

  const allegroProductParameters: AllegroOfferParameters = [
    ...formattedProductParameters,
    {
      name: "Rozmiar",
      values: [insoleLength.size.toString()],
    },
    {
      name: "Długość wkładki",
      values: [insoleLength.insoleLength.toString()],
    },
    {
      name: "Kolor",
      values: [colorVariant.color],
    },
    {
      name: "Odcień",
      values: [shadeValue],
    },
    {
      name: "Kolor dodatkowy",
      values: [additionalColorValue],
    },
    {
      name: "Kod producenta",
      values: [formattedManufacturerCode],
    },
  ];

  const images = await getImagesUrls(
    product.editedPhotos?.map((image) => image.filePath) || []
  );

  const productSet = [
    {
      product: {
        name: offer.title,
        category: {
          id: allegroCategoryId,
        },
        parameters: allegroProductParameters,
        images: images as string[],
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
  };

  const photos = product.editedPhotos?.map((photo) => photo.filePath) || [];

  const description = await convertToAllegroDescription(
    product.description as Description,
    photos,
    descriptionVariableValues
  );

  const allegroOffer: AllegroOffer = {
    ...allegroOfferData,
    description,
    productSet,
    stock: {
      available: offer.availability[insoleLength.size].value,
    },
  };

  const resp = await axios.post(url, allegroOffer, {
    headers: allegroHeaders,
  });

  if (resp.status !== 201 && resp.status !== 202) {
    throw new Error(
      `Błąd podczas tworzenia oferty na Allegro: ${resp.status} - ${resp.statusText}`
    );
  }

  return resp.data.id;
}

export const formatAllegroProductParameters = (
  productParameters: ProductParameters
): AllegroOfferParameters => {
  const entries: [string, Primitive][] = [
    ...Object.entries(productParameters.required),
    ...Object.entries(productParameters.optional),
  ];

  return entries.map(([name, value]) => {
    let valuesArray: [Primitive, ...Primitive[]];

    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new Error(`Parameter "${name}" has an empty array of values.`);
      }
      valuesArray = [value[0], ...value.slice(1)];
    } else {
      valuesArray = [value];
    }

    return { name, values: valuesArray };
  });
};

function replaceDescriptionVariables(
  text: string,
  values: Record<DescriptionVariable, string>
): string {
  return DescriptionVariables.reduce((result, variable) => {
    const regex = new RegExp(`{${variable}}`, "g");
    return result.replace(regex, values[variable] ?? "");
  }, text);
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
  editedPhotos: string[],
  variableValues: Record<DescriptionVariable, string>
) {
  const sections = await Promise.all(
    description.map(async (row) => {
      const items = await Promise.all(
        row.elementsTypes.map(async (type, idx) => {
          const element = row.elements[idx];

          if (type === "text") {
            const content = element.content
              ? replaceDescriptionVariables(element.content, variableValues)
              : undefined;
            return { type: "text", content };
          }

          if (type === "image") {
            const key = element.image!;
            let url: string;

            if (key === "rozmiarówka") {
              url = (await getImageUrl(choosingSizeImageFilePath)) as string;
            } else {
              const index = parseInt(key, 10);
              url = (await getImageUrl(editedPhotos[index])) as string;
            }

            return { type: "image", url };
          }

          return { type, content: undefined };
        })
      );

      return AllegroOfferDescriptionSectionSchema.parse({ items });
    })
  );

  return sections;
}
