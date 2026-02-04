"use server";

import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { MerchantCenterFootwearProduct } from "@/firebase/schemas/merchantCenterSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
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

import type { merchantapi_products_v1 } from "googleapis";
import { getImagesUrls, getImageUrl } from "../files/files";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { parseProductDescription } from "@/helpers/productInfo";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { verifyUser } from "../auth/auth";
import { updateOffer } from "../offers/offers";
import { getRequiredEnv } from "@/helpers/env";
import { mapWithConcurrency } from "@/helpers/other";

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
  const responses = await mapWithConcurrency(products, 10, async (product) =>
    insertGoogleMerchantProduct(product),
  );
  return responses;
}

export async function convertOfferToMerchantCenterProducts(
  offer: OfferWithId,
): Promise<MerchantCenterFootwearProduct[] | null> {
  let product = null;
  let legacyProduct = null;
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
  }

  if (!product) return null;
  if (!offer.colorVariantName) return null;

  let categoryId = null;

  const colorVariant = product.colorVariants?.find(
    (variant) => getColorVariantName(variant) === offer.colorVariantName,
  );
  if (!colorVariant) return null;

  const productData = {
    id: product.id,
    brand: product.brand,
    manufacturerCode: product.manufacturerCode,
    parameters: product.parameters,
    colorVariant,
    imagesUrls: [] as string[],
    description: "",
  };
  if (legacyProduct) {
    if (!legacyProduct.imagesUrls) return null;
    productData.imagesUrls = legacyProduct.imagesUrls[offer.colorVariantName];

    const { salesDescription } = parseProductDescription(
      legacyProduct.allegroDescription,
    );
    if (salesDescription) {
      productData.description = salesDescription;
    }

    categoryId = legacyProduct.categoryId;
  } else {
    const imagesUrls = await getImagesUrls(
      product.editedPhotos?.map((photo) => photo.filePath) || [],
    );
    if (!imagesUrls || imagesUrls.length === 0) return null;
    productData.imagesUrls = imagesUrls;
    const { salesDescription } = parseProductDescription(product.description);
    if (salesDescription) {
      productData.description = salesDescription;
    }

    categoryId = product.categoryId;
  }

  if (!categoryId) return null;
  if (!offer.thumbnail) return null;

  const { data: category } = await getDocumentFromAdminDB<CategoryWithId>(
    "categories",
    categoryId,
  );
  if (!category) return null;

  const thumbnailUrl = isValidUrl(offer.thumbnail)
    ? offer.thumbnail
    : await getImageUrl(offer.thumbnail);
  if (!thumbnailUrl) return null;

  const data: Omit<GetFootwearProductPayload, "size"> = {
    offerData: {
      SKU: offer.SKU,
      title: offer.title,
      availability: offer.availability,
      sellingPrices: offer.sellingPrices,
      id: offer.id,
      colorVariantName: offer.colorVariantName,
    },
    productData,
    category,
    thumbnailUrl,
  };

  const products: MerchantCenterFootwearProduct[] = Object.keys(
    data.offerData.availability,
  ).map((size) =>
    getMerchantCenterFootwearProduct({
      ...data,
      size,
    }),
  );

  return products;
}

export async function syncOffersWithGoogleMerchantCenter() {
  await verifyUser(["ADMIN"]);

  const offers = await getDocumentsFromAdminDB<OfferWithId>("offers", (ref) =>
    ref.where("SKU", "==", "3VGG"),
  );

  if (!offers || offers.length === 0) {
    return { inserted: 0, updatedOffers: 0 };
  }

  const productsToInsert = await Promise.all(
    offers.map(async (offer) => {
      if (offer?.isAddedToMerchantCenter) {
        return;
      }
      const products = await convertOfferToMerchantCenterProducts(offer);
      if (products && products.length > 0) return products;
    }),
  );

  if (!productsToInsert || productsToInsert.length === 0) {
    return { inserted: 0, updatedOffers: 0 };
  }

  const products = productsToInsert
    .flat()
    .filter((product) => product !== undefined);

  await insertProductsToGoogleMerchantCenter(products);

  await Promise.all(
    offers.map(async (offer) => {
      await updateOffer(offer.id, { isAddedToMerchantCenter: true });
    }),
  );

  return { inserted: products.length, updatedOffers: offers.length };
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

  const products = await convertOfferToMerchantCenterProducts(offer);
  if (!products || products.length === 0) return null;

  const insertResponse = await insertProductsToGoogleMerchantCenter(products);

  await updateOffer(offer.id, { isAddedToMerchantCenter: true });

  return insertResponse;
}
