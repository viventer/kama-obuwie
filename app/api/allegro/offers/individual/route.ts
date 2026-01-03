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
import {
  formatAllegroProductParameters,
  postIndividualAllegroOffer,
  postIndividualAllegroOfferFromLegacy,
} from "@/server-actions/allegro/offers";
import { updateOffer } from "@/server-actions/offers/offers";
import { parseSignature } from "@/helpers/signature";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";

export type PostIndividualAllegroOfferBody = {
  offerId: string;
  size: string;
  salesChannel: "AL1" | "AL2";
};

async function tryFindProductIdForOffer(
  offer: OfferWithId
): Promise<string | null> {
  if (!offer.signature) return null;

  const parsed = parseSignature(offer.signature);
  const manufacturerCode = parsed.manufacturerCode;
  const colorVariantName = parsed.colorVariantName;
  if (!manufacturerCode || !colorVariantName) return null;

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

    // Dla ofert zsynchronizowanych z Allegro może nie istnieć productId.
    // Wtedy próbujemy automatycznie dopasować produkt po signature.
    let effectiveProductId = offer.productId;
    if (!effectiveProductId) {
      effectiveProductId = await tryFindProductIdForOffer(offer);

      if (effectiveProductId) {
        await updateOffer(offerId, { productId: effectiveProductId });
      } else {
        // Fallback dla legacy: odtwórz ofertę bez rekordu produktu,
        // korzystając z legacy.allegroDescription + legacy.responsibleProducer.
        if (!offer.legacyProductId) {
          return apiErrorResponse(
            "Oferta nie ma przypisanego produktu i nie udało się go automatycznie dopasować po signature. Brak legacyProductId, aby odtworzyć ofertę z danych legacy.",
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const { data: legacy } =
          await getDocumentFromAdminDB<LegacyProductWithId>(
            "legacyProducts",
            offer.legacyProductId
          );

        if (!legacy) {
          return apiErrorResponse(
            "Nie znaleziono legacyProduct dla oferty.",
            404,
            null,
            { step: "offer_creation" }
          );
        }

        if (!legacy.categoryId) {
          return apiErrorResponse(
            "LegacyProduct nie ma categoryId.",
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const { data: legacyCategory } =
          await getDocumentFromAdminDB<CategoryWithId>(
            "categories",
            legacy.categoryId
          );
        const allegroCategoryId = legacyCategory?.allegroCategoryId;
        if (!allegroCategoryId) {
          return apiErrorResponse(
            "Brak allegroCategoryId dla kategorii legacyProduct.",
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const parsed = parseSignature(offer.signature);
        const colorVariantName =
          offer.colorVariantName || parsed.colorVariantName;
        if (!colorVariantName) {
          return apiErrorResponse(
            "Brak colorVariantName w ofercie (nie można dobrać zdjęć legacy).",
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const legacyImages = legacy.imagesUrls?.[colorVariantName] || [];
        const images =
          legacyImages.length > 0
            ? legacyImages
            : offer.thumbnail
              ? [offer.thumbnail]
              : [];

        if (images.length === 0) {
          return apiErrorResponse(
            "Brak zdjęć do odtworzenia oferty legacy (legacy.imagesUrls ani offer.thumbnail).",
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const legacyProductParameters = legacy.parameters || {
          required: {},
          optional: {},
        };
        const productParameters = await formatAllegroProductParameters(
          legacyProductParameters as any,
          allegroCategoryId,
          legacy.brand
        );

        if (!legacy.sizingTableId) {
          return apiErrorResponse(
            "LegacyProduct nie ma sizingTableId (nie można uzupełnić długości wkładki w opisie).",
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const { data: legacySizingTable } =
          await getDocumentFromAdminDB<SizingTableWithId>(
            "sizingTables",
            legacy.sizingTableId
          );

        if (!legacySizingTable) {
          return apiErrorResponse(
            "Nie znaleziono tabeli rozmiarów legacyProduct.",
            404,
            null,
            { step: "offer_creation" }
          );
        }

        const legacyInsoleLength = legacySizingTable.insoleLengths.find(
          (item) => item.size.toString() === size.toString()
        );

        if (!legacyInsoleLength) {
          return apiErrorResponse(
            `Rozmiar ${size} nie istnieje w tabeli rozmiarów legacyProduct (nie można uzupełnić opisu).`,
            409,
            null,
            { step: "offer_creation" }
          );
        }

        const insoleLengthText =
          legacyInsoleLength.insoleLength.toString().replace(".", ",") + " cm";

        const insoleLengthValue = legacyInsoleLength.insoleLength;

        let sizeTableAllegroId: string | undefined;
        if (salesChannel === "AL1") {
          sizeTableAllegroId = legacySizingTable.allegroId;
        }

        const url = `${process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL}/sale/product-offers`;
        const allegroHeaders = (
          await import("@/server-actions/allegro/global")
        ).getSingleAllegroHeaders(
          await (
            await import("@/server-actions/allegro/auth")
          ).getAllegroUserAccessToken(salesChannel)
        ) as any;

        const allegroOfferId = await postIndividualAllegroOfferFromLegacy({
          offer,
          legacy,
          size,
          insoleLengthText,
          insoleLengthValue,
          channel: salesChannel,
          allegroHeaders,
          url,
          allegroCategoryId,
          images,
          productParameters,
          sizeTableAllegroId,
        });

        const nextAllegroOffersIds = {
          ...(offer.allegroOffersIds || {}),
          [salesChannel]: {
            ...((offer.allegroOffersIds as any)?.[salesChannel] || {}),
            [size]: allegroOfferId,
          },
        };

        await updateOffer(offerId, {
          allegroOffersIds: nextAllegroOffersIds as any,
        });

        return apiResponse("Oferta utworzona.", 201, { allegroOfferId });
      }
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
