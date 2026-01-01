import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";
import { verifyUser } from "@/server-actions/auth/auth";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import type { OfferWithId } from "@/firebase/schemas/offersSchemas";
import type {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { getImagesUrls } from "@/server-actions/files/files";
import { postIndividualAllegroOffer } from "@/server-actions/allegro/offers";
import { updateOffer } from "@/server-actions/offers/offers";

export type PostIndividualAllegroOfferBody = {
  offerId: string;
  size: string;
  salesChannel: "AL1" | "AL2";
};

function parseSignatureForProductLookup(signature: string): {
  manufacturerCode: string;
  colorVariantName: string;
} | null {
  const parts = signature.trim().split(" ").filter(Boolean);
  if (parts.length < 2) return null;

  return {
    colorVariantName: parts[parts.length - 1],
    manufacturerCode: parts[parts.length - 2],
  };
}

async function tryFindProductIdForOffer(
  offer: OfferWithId
): Promise<string | null> {
  if (!offer.signature) return null;

  const parsed = parseSignatureForProductLookup(offer.signature);
  if (!parsed) return null;

  const { manufacturerCode, colorVariantName } = parsed;

  const products =
    (await getDocumentsFromAdminDB<ProductWithId>("products", (ref) =>
      ref.where("manufacturerCode", "==", manufacturerCode)
    )) || [];

  const matching = products.filter((p) =>
    (p.colorVariants || []).some(
      (variant) => getColorVariantName(variant) === colorVariantName
    )
  );

  if (matching.length === 1) {
    return matching[0].id;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    await verifyUser(["ADMIN", "VERIFIED"]);

    const body: PostIndividualAllegroOfferBody = await request.json();
    const { offerId, size, salesChannel } = body;

    if (!offerId || !size || !salesChannel) {
      return apiErrorResponse("Brak wymaganych danych.", 400, null, {
        step: "offer_creation",
      });
    }

    const { data: offer } = await getDocumentFromAdminDB<OfferWithId>(
      "offers",
      offerId
    );

    if (!offer) {
      return apiErrorResponse("Nie znaleziono oferty w bazie danych.", 404);
    }

    // Dla ofert zsynchronizowanych z Allegro może nie istnieć productId.
    // Wtedy próbujemy automatycznie dopasować produkt po signature.
    let effectiveProductId = offer.productId;
    if (!effectiveProductId) {
      effectiveProductId = await tryFindProductIdForOffer(offer);

      if (effectiveProductId) {
        await updateOffer(offerId, { productId: effectiveProductId });
      } else {
        return apiErrorResponse(
          "Oferta nie ma przypisanego produktu i nie udało się go automatycznie dopasować po signature. Przypisz produkt ręcznie, aby można było odtworzyć/utworzyć ofertę.",
          409,
          null,
          { step: "offer_creation" }
        );
      }
    }

    if (!offer.availability?.[size]) {
      return apiErrorResponse(
        `Rozmiar ${size} nie istnieje w dostępności oferty.`,
        400,
        null,
        { step: "offer_creation" }
      );
    }

    if (!offer.SKU) {
      return apiErrorResponse("Brak SKU w ofercie.", 400, null, {
        step: "offer_creation",
      });
    }

    const { data: product } = await getDocumentFromAdminDB<ProductWithId>(
      "products",
      effectiveProductId
    );

    if (!product) {
      return apiErrorResponse("Nie znaleziono produktu dla oferty.", 404);
    }

    if (!product.sizingTableId) {
      return apiErrorResponse(
        "Produkt nie ma przypisanej tabeli rozmiarów.",
        400
      );
    }

    const { data: sizingTable } =
      await getDocumentFromAdminDB<SizingTableWithId>(
        "sizingTables",
        product.sizingTableId
      );

    if (!sizingTable) {
      return apiErrorResponse("Nie znaleziono tabeli rozmiarów.", 404);
    }

    const { data: category } = await getDocumentFromAdminDB<CategoryWithId>(
      "categories",
      product.categoryId as string
    );

    const allegroCategoryId = category?.allegroCategoryId;
    if (!allegroCategoryId) {
      return apiErrorResponse(
        "Brak allegroCategoryId dla kategorii produktu.",
        400,
        null,
        { step: "offer_creation" }
      );
    }

    const colorVariantName = offer.colorVariantName;
    if (!colorVariantName) {
      return apiErrorResponse("Brak colorVariantName w ofercie.", 400, null, {
        step: "offer_creation",
      });
    }

    const colorVariant = (product.colorVariants || []).find(
      (v) => getColorVariantName(v) === colorVariantName
    );

    if (!colorVariant) {
      return apiErrorResponse(
        `Nie znaleziono wariantu kolorystycznego '${colorVariantName}' w produkcie.`,
        400,
        null,
        { step: "offer_creation" }
      );
    }

    const imagesOfVariant = (product.editedPhotos || []).filter(
      (image) => image.colorVariantName === colorVariantName
    );

    const imagesPaths = imagesOfVariant.map((image) => image.filePath);
    const imagesUrls = await getImagesUrls(imagesPaths);

    if (!imagesUrls || imagesUrls.length === 0) {
      return apiErrorResponse(
        "Brak zdjęć produktu dla danego wariantu.",
        400,
        null,
        { step: "offer_creation" }
      );
    }

    const insoleLength = sizingTable.insoleLengths.find(
      (item) => item.size.toString() === size.toString()
    );

    if (!insoleLength) {
      return apiErrorResponse(
        `Rozmiar ${size} nie istnieje w tabeli rozmiarów.`,
        400,
        null,
        { step: "offer_creation" }
      );
    }

    // Bazowy payload podobnie jak w postAllegroOffer, ale tylko dla 1 kanału
    const allegroOfferData = {
      sellingMode: {
        price: {
          amount: offer.sellingPrices?.[salesChannel] as string,
          currency: "PLN" as const,
        },
      },
      delivery: {
        handlingTime: "PT24H" as const,
        shippingRates: {
          id: offer.shippingRates?.[salesChannel]?.allegroId as string,
        },
      },
      images: imagesUrls,
      afterSalesServices: {
        returnPolicy: {
          id: offer.returnPolicy?.[salesChannel] as string,
        },
        impliedWarranty: {
          id: offer.impliedWarranty?.[salesChannel] as string,
        },
        ...(offer.warranty?.[salesChannel]
          ? { warranty: { id: offer.warranty[salesChannel] } }
          : {}),
      },
      ...(salesChannel === "AL1" && sizingTable.allegroId
        ? { sizeTable: { id: sizingTable.allegroId } }
        : {}),
    };

    const url = `${process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL}/sale/product-offers`;

    const allegroOfferId = await postIndividualAllegroOffer({
      allegroOfferData: allegroOfferData as any,
      insoleLength,
      insoleLengths: sizingTable.insoleLengths,
      offer,
      product,
      colorVariant,
      allegroHeaders: (
        await import("@/server-actions/allegro/global")
      ).getSingleAllegroHeaders(
        await (
          await import("@/server-actions/allegro/auth")
        ).getAllegroUserAccessToken(salesChannel)
      ) as any,
      url,
      allegroCategoryId,
      images: imagesUrls,
      channel: salesChannel,
      SKU: offer.SKU,
    });

    const newAllegroOffersIds = {
      ...(offer.allegroOffersIds || { AL1: {}, AL2: {} }),
      [salesChannel]: {
        ...(offer.allegroOffersIds?.[salesChannel] || {}),
        [size]: allegroOfferId,
      },
    } as any;

    await updateOffer(offerId, { allegroOffersIds: newAllegroOffersIds });

    return apiResponse("Oferta Allegro została utworzona.", 201, {
      allegroOfferId,
    });
  } catch (err: any) {
    if (err?.allegroErrors && err?.status) {
      return apiErrorResponse(
        "Nie udało się utworzyć oferty na Allegro",
        err.status,
        err.allegroErrors,
        {
          step: "offer_creation",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse("Nie udało się utworzyć oferty", 500, null, {
      step: "offer_creation",
      originalMessage: err?.message,
    });
  }
}
