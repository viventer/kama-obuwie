"use server";

import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import {
  MerchantCenterFootwearProduct,
  MerchantCenterFootwearProductSchema,
} from "@/firebase/schemas/merchantCenterSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ColorVariant,
  ProductParameters,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import {
  GetFootwearProductPayload,
  getMerchantCenterProductAvaiability,
  getMerchantCenterFootwearProduct,
  getMerchantCenterProductInputResourceName,
  getMerchantApiDataSourceName,
  createGoogleMerchantServiceAccountAuth,
} from "@/helpers/merchantCenter";
import { google } from "googleapis";
import { FieldPath } from "firebase-admin/firestore";

import type { merchantapi_products_v1 } from "googleapis";
import { getImagesUrls, getImageUrl } from "../files/files";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { parseProductDescription } from "@/helpers/productInfo";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { verifyUser } from "../auth/auth";
import { updateOffer } from "../offers/offers";
import { getRequiredEnv } from "@/helpers/env";
import { mapWithConcurrency } from "@/helpers/other";
import { stripEmoji } from "@/helpers/encoding";
import { parseSignature } from "@/helpers/signature";

export type ConvertOfferToMerchantCenterResult =
  | { ok: true; products: MerchantCenterFootwearProduct[] }
  | { ok: false; reason: string };

type NormalizedMerchantCenterSource = {
  storeId: string;
  brand?: string;
  manufacturerCode: string;
  parameters: ProductParameters;
  colorVariant: ColorVariant;
  colorVariantName: string;
  imagesUrls: string[];
  description: string;
  categoryId: string;
};

function failConvert(reason: string): ConvertOfferToMerchantCenterResult {
  console.log(`⚠️ ${reason}`);
  return { ok: false, reason };
}

function formatZodIssues(issues: { path: (string | number)[]; message: string }[]) {
  return issues
    .map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`)
    .join("; ");
}

export async function insertGoogleMerchantProduct(
  product: MerchantCenterFootwearProduct,
) {
  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantapi = google.merchantapi("products_v1");
  const parent = `accounts/${merchantId}`;
  const dataSource = getMerchantApiDataSourceName(merchantId);

  const requestBody: merchantapi_products_v1.Schema$ProductInput = product;

  return merchantapi.accounts.productInputs.insert({
    auth,
    parent,
    dataSource,
    requestBody,
  });
}

export async function updateGoogleMerchantProductAvailability(
  product: MerchantCenterFootwearProduct,
  availability: MerchantCenterFootwearProduct["productAttributes"]["availability"],
) {
  return insertGoogleMerchantProduct({
    ...product,
    productAttributes: {
      ...product.productAttributes,
      availability,
    },
  });
}

export async function insertProductsToGoogleMerchantCenter(
  products: MerchantCenterFootwearProduct[],
) {
  for (const product of products) {
    const parsed = MerchantCenterFootwearProductSchema.safeParse(product);
    if (!parsed.success) {
      throw new Error(
        `Nieprawidłowy payload produktu Merchant Center (offerId: ${product.offerId}): ${formatZodIssues(parsed.error.issues)}`,
      );
    }
  }

  const responses = await mapWithConcurrency(products, 10, async (product) =>
    insertGoogleMerchantProduct(product),
  );
  return responses;
}

export async function convertOfferToMerchantCenterProducts(
  offer: OfferWithId,
): Promise<ConvertOfferToMerchantCenterResult> {
  if (!offer.SKU) {
    return failConvert(
      `Oferta (ID: ${offer.id}) nie ma ustawionego SKU.`,
    );
  }

  let product: ProductWithId | null = null;
  let legacyProduct: LegacyProductWithId | null = null;

  if (offer.productId) {
    const { data } = await getDocumentFromAdminDB<ProductWithId>(
      "products",
      offer.productId,
    );
    product = data;
  } else if (offer.legacyProductId) {
    const { data } = await getDocumentFromAdminDB<LegacyProductWithId>(
      "legacyProducts",
      offer.legacyProductId,
    );
    legacyProduct = data;
  } else {
    return failConvert(
      `Oferta (ID: ${offer.id}) nie ma powiązanego productId ani legacyProductId.`,
    );
  }

  if (!product && !legacyProduct) {
    return failConvert(
      `Nie można znaleźć produktu powiązanego z ofertą (ID: ${offer.id}).`,
    );
  }

  const parsedSignature = parseSignature(offer.signature || "");
  let source: NormalizedMerchantCenterSource;

  if (legacyProduct) {
    const colorVariantName =
      offer.colorVariantName ||
      legacyProduct.colorVariantName ||
      parsedSignature.colorVariantName;

    if (!colorVariantName) {
      return failConvert(
        `Oferta (ID: ${offer.id}) nie ma colorVariantName (ani w ofercie, ani w legacyProduct, ani w signature).`,
      );
    }

    const legacyColorVariants =
      legacyProduct.colorVariants && legacyProduct.colorVariants.length > 0
        ? legacyProduct.colorVariants
        : ([{ color: colorVariantName }] as ColorVariant[]);

    const colorVariant =
      legacyColorVariants.find(
        (variant) => getColorVariantName(variant) === colorVariantName,
      ) ?? ({ color: colorVariantName } as ColorVariant);

    const imagesUrls = legacyProduct.imagesUrls?.[colorVariantName];
    if (!imagesUrls || imagesUrls.length === 0) {
      return failConvert(
        `Oferta (ID: ${offer.id}) pochodzi z legacyProduct, ale brak zdjęć dla colorVariantName='${colorVariantName}'.`,
      );
    }

    if (!legacyProduct.categoryId) {
      return failConvert(
        `Oferta (ID: ${offer.id}) pochodzi z legacyProduct bez categoryId.`,
      );
    }

    const manufacturerCode =
      legacyProduct.manufacturerCode ||
      parsedSignature.manufacturerCode ||
      "";

    let description = "";
    const { salesDescription } = parseProductDescription(
      legacyProduct.allegroDescription,
    );
    if (salesDescription) {
      description = stripEmoji(salesDescription);
    }

    source = {
      storeId: offer.id,
      brand: legacyProduct.brand || parsedSignature.brand,
      manufacturerCode,
      parameters:
        legacyProduct.parameters ||
        ({ required: {}, optional: {} } as ProductParameters),
      colorVariant,
      colorVariantName,
      imagesUrls,
      description,
      categoryId: legacyProduct.categoryId,
    };
  } else if (product) {
    if (!offer.colorVariantName) {
      return failConvert(
        `Oferta (ID: ${offer.id}) nie ma ustawionego colorVariantName.`,
      );
    }

    const colorVariant = product.colorVariants?.find(
      (variant) => getColorVariantName(variant) === offer.colorVariantName,
    );
    if (!colorVariant) {
      return failConvert(
        `Oferta (ID: ${offer.id}) ma colorVariantName='${offer.colorVariantName}', ale produkt nie zawiera takiej warianty.`,
      );
    }

    const photos = product.editedPhotos?.filter(
      (photo) => photo.colorVariantName === offer.colorVariantName,
    );
    if (!photos || photos.length === 0) {
      return failConvert(
        `Oferta (ID: ${offer.id}) nie ma zdjęć edytowanych dla colorVariantName='${offer.colorVariantName}'.`,
      );
    }

    // Pierwsze zdjęcie w editedPhotos to miniaturka (imageLink) — pomiń w additionalImageLinks
    const additionalPhotos = photos.slice(1);
    const imagesUrls =
      additionalPhotos.length === 0
        ? []
        : await getImagesUrls(
            additionalPhotos.map((photo) => photo.filePath),
          );
    if (imagesUrls === null) {
      return failConvert(
        `Oferta (ID: ${offer.id}) ma zdjęcia, ale nie udało się pobrać adresów URL obrazów.`,
      );
    }

    if (!product.categoryId) {
      return failConvert(
        `Oferta (ID: ${offer.id}) nie ma przypisanej kategorii (categoryId).`,
      );
    }

    let description = "";
    const { salesDescription } = parseProductDescription(product.description);
    if (salesDescription) {
      description = stripEmoji(salesDescription);
    }

    source = {
      storeId: product.id,
      brand: product.brand || parsedSignature.brand,
      manufacturerCode:
        product.manufacturerCode || parsedSignature.manufacturerCode || "",
      parameters: product.parameters,
      colorVariant,
      colorVariantName: offer.colorVariantName,
      imagesUrls,
      description,
      categoryId: product.categoryId,
    };
  } else {
    return failConvert(
      `Nie można znaleźć produktu powiązanego z ofertą (ID: ${offer.id}).`,
    );
  }

  if (!offer.thumbnail) {
    return failConvert(`Oferta (ID: ${offer.id}) nie ma pola thumbnail.`);
  }

  const { data: category } = await getDocumentFromAdminDB<CategoryWithId>(
    "categories",
    source.categoryId,
  );
  if (!category) {
    return failConvert(
      `Oferta (ID: ${offer.id}) ma nieprawidłowy categoryId='${source.categoryId}', brak kategorii w DB.`,
    );
  }

  const thumbnailUrl = isValidUrl(offer.thumbnail)
    ? offer.thumbnail
    : await getImageUrl(offer.thumbnail);
  if (!thumbnailUrl) {
    return failConvert(
      `Oferta (ID: ${offer.id}) ma niepoprawny thumbnail ('${offer.thumbnail}') i nie udało się go pobrać.`,
    );
  }

  const productData: GetFootwearProductPayload["productData"] = {
    id: source.storeId,
    brand: source.brand,
    manufacturerCode: source.manufacturerCode,
    parameters: source.parameters,
    colorVariant: source.colorVariant,
    imagesUrls: source.imagesUrls,
    description: source.description,
  };

  const data: Omit<GetFootwearProductPayload, "size"> = {
    offerData: {
      SKU: offer.SKU,
      title: offer.merchantCenterData?.title ?? offer.title,
      availability: offer.availability,
      sellingPrices: offer.sellingPrices,
      id: offer.id,
      colorVariantName: source.colorVariantName,
    },
    productData,
    category,
    thumbnailUrl,
  };

  try {
    const products: MerchantCenterFootwearProduct[] = Object.keys(
      data.offerData.availability,
    ).map((size) =>
      getMerchantCenterFootwearProduct({
        ...data,
        size,
      }),
    );

    return { ok: true, products };
  } catch (err) {
    return failConvert(
      err instanceof Error
        ? err.message
        : `Nie udało się zbudować produktów Merchant Center dla oferty (ID: ${offer.id}).`,
    );
  }
}

export type SyncOffersWithGoogleMerchantCenterBatch = {
  lastOfferIndex?: number;
  batchSize?: number;
};

export async function syncOffersWithGoogleMerchantCenter(
  batch?: SyncOffersWithGoogleMerchantCenterBatch,
) {
  await verifyUser(["ADMIN"]);

  const batchSize = Math.max(1, batch?.batchSize ?? 50);
  const lastOfferIndex = batch?.lastOfferIndex ?? -1;
  const offset = Math.max(0, lastOfferIndex + 1);

  const offers = await getDocumentsFromAdminDB<OfferWithId>("offers", (ref) =>
    ref.orderBy(FieldPath.documentId()).offset(offset).limit(batchSize),
  );

  if (!offers || offers.length === 0) {
    return { inserted: 0, updatedOffers: 0, scannedOffers: 0 };
  }

  const converted = await Promise.all(
    offers.map(async (offer) => {
      if (offer?.isAddedToMerchantCenter) {
        return null;
      }

      const result = await convertOfferToMerchantCenterProducts(offer);
      if (!result.ok) {
        console.log(
          `Pominięto ofertę (ID: ${offer.id}) podczas sync GMC: ${result.reason}`,
        );
        return null;
      }

      if (result.products.length === 0) {
        return null;
      }

      return { offerId: offer.id, products: result.products };
    }),
  );

  const successful = converted.filter(
    (
      item,
    ): item is {
      offerId: string;
      products: MerchantCenterFootwearProduct[];
    } => item !== null,
  );

  if (successful.length === 0) {
    return { inserted: 0, updatedOffers: 0, scannedOffers: offers.length };
  }

  const products = successful.flatMap((item) => item.products);
  await insertProductsToGoogleMerchantCenter(products);

  await Promise.all(
    successful.map(async ({ offerId }) => {
      await updateOffer(offerId, { isAddedToMerchantCenter: true });
    }),
  );

  return {
    inserted: products.length,
    updatedOffers: successful.length,
    scannedOffers: offers.length,
  };
}

export async function syncAllOffersWithGoogleMerchantCenter(batchSize = 50) {
  await verifyUser(["ADMIN"]);

  let lastOfferIndex = -1;
  let totalInserted = 0;
  let totalUpdatedOffers = 0;

  const maxIterations = 1000;
  for (let i = 0; i < maxIterations; i++) {
    const { inserted, updatedOffers, scannedOffers } =
      await syncOffersWithGoogleMerchantCenter({
        lastOfferIndex,
        batchSize,
      });

    totalInserted += inserted;
    totalUpdatedOffers += updatedOffers;

    if (scannedOffers <= 0) break;
    lastOfferIndex += scannedOffers;
    if (scannedOffers < batchSize) break;
  }

  console.log(
    `Zsynchronizowano oferty z Google Merchant Center. Wstawiono: ${totalInserted}, Zaktualizowano ofert: ${totalUpdatedOffers}`,
  );
  return { inserted: totalInserted, updatedOffers: totalUpdatedOffers };
}

export async function syncMerchantCenterProductAvailability(
  SKU: string,
  availability: OfferWithId["availability"],
) {
  await verifyUser(["ADMIN"]);

  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantapi = google.merchantapi("products_v1");
  const dataSource = getMerchantApiDataSourceName(merchantId);

  const sizes = Object.keys(availability || {});
  if (sizes.length === 0) return [];

  const contentLanguage: MerchantCenterFootwearProduct["contentLanguage"] =
    "pl";
  const feedLabel: MerchantCenterFootwearProduct["feedLabel"] = "PL";

  const responses = await mapWithConcurrency(sizes, 10, async (size) => {
    const sizeAvailability = availability?.[size];
    if (!sizeAvailability) {
      throw new Error(`Brak dostępności dla rozmiaru '${size}' (SKU: ${SKU}).`);
    }

    const offerId: MerchantCenterFootwearProduct["offerId"] = `${SKU}r${size}`;
    const name = getMerchantCenterProductInputResourceName({
      merchantId,
      contentLanguage,
      feedLabel,
      offerId,
    });

    const nextAvailability = getMerchantCenterProductAvaiability(
      availability,
      size,
    );

    const requestBody: merchantapi_products_v1.Schema$ProductInput = {
      name,
      offerId,
      contentLanguage,
      feedLabel,
      productAttributes: {
        availability: nextAvailability as any,
      },
    };

    return merchantapi.accounts.productInputs.patch({
      auth,
      name,
      dataSource,
      updateMask: "productAttributes.availability",
      requestBody,
    });
  });

  return responses;
}

export async function changeIndividualSizeMerchantCenterAvailability(
  SKU: string,
  size: string,
  isAvailable: boolean,
) {
  await verifyUser(["ADMIN"]);

  if (!size) {
    throw new Error(`Brak rozmiaru do zmiany dostępności (SKU: ${SKU}).`);
  }

  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantapi = google.merchantapi("products_v1");
  const dataSource = getMerchantApiDataSourceName(merchantId);

  const contentLanguage: MerchantCenterFootwearProduct["contentLanguage"] =
    "pl";
  const feedLabel: MerchantCenterFootwearProduct["feedLabel"] = "PL";

  const offerId: MerchantCenterFootwearProduct["offerId"] = `${SKU}r${size}`;
  const name = getMerchantCenterProductInputResourceName({
    merchantId,
    contentLanguage,
    feedLabel,
    offerId,
  });

  const nextAvailability: MerchantCenterFootwearProduct["productAttributes"]["availability"] =
    isAvailable ? "in_stock" : "out_of_stock";

  const requestBody: merchantapi_products_v1.Schema$ProductInput = {
    name,
    offerId,
    contentLanguage,
    feedLabel,
    productAttributes: {
      availability: nextAvailability as any,
    },
  };

  return merchantapi.accounts.productInputs.patch({
    auth,
    name,
    dataSource,
    updateMask: "productAttributes.availability",
    requestBody,
  });
}

export async function insertNewOfferToMerchantCenter(offer: OfferWithId) {
  await verifyUser(["ADMIN"]);

  const result = await convertOfferToMerchantCenterProducts(offer);
  if (!result.ok) {
    throw new Error(result.reason);
  }
  if (result.products.length === 0) {
    throw new Error(
      `Oferta (ID: ${offer.id}) nie wygenerowała żadnych produktów Merchant Center.`,
    );
  }

  let insertResponse;
  try {
    insertResponse = await insertProductsToGoogleMerchantCenter(
      result.products,
    );
  } catch (err) {
    console.error(
      `Błąd podczas wstawiania produktów do Google Merchant Center dla oferty (ID: ${offer.id}): ${err}`,
      err,
    );
    throw new Error(
      `Błąd podczas wstawiania produktów do Google Merchant Center: ${
        err instanceof Error ? err.message : "Unknown error"
      }`,
    );
  }

  await updateOffer(offer.id, { isAddedToMerchantCenter: true });

  return insertResponse;
}

export async function resetLegacyOffersMerchantCenterFlags() {
  await verifyUser(["ADMIN"]);

  const offers = await getDocumentsFromAdminDB<OfferWithId>("offers", (ref) =>
    ref.where("legacyProductId", ">", ""),
  );

  const toReset =
    offers?.filter((offer) => offer.isAddedToMerchantCenter === true) ?? [];

  if (toReset.length === 0) {
    return { resetCount: 0 };
  }

  await Promise.all(
    toReset.map(async (offer) => {
      await updateOffer(offer.id, { isAddedToMerchantCenter: false });
    }),
  );

  return { resetCount: toReset.length };
}
