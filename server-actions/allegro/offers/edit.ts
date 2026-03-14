"use server";

import { AllegroOffer, OfferWithId } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "@/server-actions/auth/auth";
import {
  getAllegroAccessTokensForBackgroundJob,
  getAllegroUserAccessToken,
} from "../auth";
import { getSingleAllegroHeaders } from "../global";
import { handleAllegroApiError } from "@/server-actions/errorHandlers";
import axios from "axios";
import {
  Description,
  DescriptionVariable,
  EditedPhotoWithUrl,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getImageUrl } from "@/server-actions/files/files";
import { choosingSizeImageFilePath } from "@/lib/constants";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { getFormattedSizingTable } from "@/lib/utils";
import { convertToAllegroDescription } from "./postLegacy";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

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

export const editAllegroOfferDescription = async (
  newDescription: Description,
  photosWithUrls: EditedPhotoWithUrl[],
  productData: ProductWithId,
) => {
  if (!productData?.SKU) {
    throw new Error(
      "Produkt nie ma przypisanego SKU, nie można edytować ofert Allegro.",
    );
  }

  const offers: OfferWithId[] = [];
  for (const colorVariantName in productData.SKU) {
    const SKU = productData.SKU[colorVariantName];
    try {
      const response = await axios.get(`${BASE_URL}/api/offers?SKU=${SKU}`);
      const offerData = Object.values(response.data)[0] as OfferWithId;
      if (offerData) {
        offers.push(offerData);
      }
    } catch (error) {
      console.warn(`Nie znaleziono oferty dla SKU: ${SKU}`, error);
    }
  }

  if (offers.length === 0) {
    throw new Error("Nie znaleziono ofert dla tego produktu");
  }

  if (!productData.sizingTableId) {
    throw new Error("Brak tabeli rozmiarów dla wystawionego produktu");
  }

  let sizingTable: SizingTableWithId | null = null;
  try {
    const sizingTableResponse = await axios.get(
      `/api/sizing-tables/${productData.sizingTableId}`,
    );
    sizingTable = sizingTableResponse.data;

    if (!sizingTable) {
      throw new Error("Nie udało się pobrać tabeli rozmiarów");
    }
  } catch (error) {
    throw new Error("Błąd podczas pobierania tabeli rozmiarów");
  }

  const choosingSizeImageUrl = await getImageUrl(choosingSizeImageFilePath);

  for (const offer of offers) {
    if (!offer.allegroOffersIds) continue;

    const colorVariant = productData.colorVariants?.find(
      (variant) =>
        getColorVariantName(variant) ===
        Object.keys(productData.SKU!).find(
          (key) => productData.SKU![key] === offer.SKU,
        ),
    );

    if (!colorVariant) continue;

    const colorVariantName = getColorVariantName(colorVariant);
    const variantPhotos = photosWithUrls.filter(
      (photo) => photo.colorVariantName === colorVariantName,
    );

    const imagesUrls = variantPhotos.map((photo) => photo.url || "");
    imagesUrls.push(choosingSizeImageUrl as string);

    const baseVariableValues: Partial<Record<DescriptionVariable, string>> = {
      kolor: colorVariant.color,
      marka: productData.brand || "",
      "kod producenta": productData.manufacturerCode || "",
      "tytuł oferty": offer.title,
    };

    const formattedSizingTable = getFormattedSizingTable(
      sizingTable.insoleLengths,
    );
    baseVariableValues.rozmiarówka = formattedSizingTable;

    const AL1Offers = offer.allegroOffersIds.AL1 || {};
    const AL2Offers = offer.allegroOffersIds.AL2 || {};

    const allSizes = new Set([
      ...Object.keys(AL1Offers),
      ...Object.keys(AL2Offers),
    ]);

    for (const size of allSizes) {
      const insoleLength = sizingTable.insoleLengths.find(
        (insole) => Number(insole.size) === Number(size),
      )?.insoleLength;

      if (!insoleLength) {
        throw new Error(
          `Brak długości wkładki dla rozmiaru ${size} w tabeli rozmiarów`,
        );
      }

      const sizeSpecificVariables: Record<DescriptionVariable, string> = {
        ...baseVariableValues,
        rozmiar: size,
        "długość wkładki": `${insoleLength.toString().replace(".", ",")} cm`,
      } as Record<DescriptionVariable, string>;

      const allegroDescription = await convertToAllegroDescription(
        newDescription,
        imagesUrls,
        sizeSpecificVariables,
      );

      const updateData = {
        description: allegroDescription,
      };

      const editPromises: Promise<any>[] = [];

      if (AL1Offers[size]) {
        editPromises.push(
          axios.patch(`${BASE_URL}/api/allegro/offers/${AL1Offers[size]}`, {
            offerPartial: updateData,
            salesChannel: "AL1",
          }),
        );
      }

      if (AL2Offers[size]) {
        editPromises.push(
          axios.patch(`${BASE_URL}/api/allegro/offers/${AL2Offers[size]}`, {
            offerPartial: updateData,
            salesChannel: "AL2",
          }),
        );
      }

      try {
        await Promise.all(editPromises);
      } catch (error) {
        throw new Error(`Błąd podczas edycji ofert dla rozmiaru ${size}`);
      }
    }
  }
};
