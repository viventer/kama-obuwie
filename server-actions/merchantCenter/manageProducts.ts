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
  getMerchantCenterFootwearProduct,
} from "@/helpers/merchantCenter";
import { google } from "googleapis";

import type { merchantapi_products_v1 } from "googleapis";
import { getImagesUrls, getImageUrl } from "../files/files";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { parseProductDescription } from "@/helpers/productInfo";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { verifyUser } from "../auth/auth";
import { updateOffer } from "../offers/offers";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function createGoogleMerchantServiceAccountAuth() {
  const clientEmail = getRequiredEnv("GOOGLE_MERCHANT_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_MERCHANT_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
}

export async function registerGcpWithMerchant() {
  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantApi = google.merchantapi("accounts_v1");

  try {
    const res = await merchantApi.accounts.developerRegistration.registerGcp({
      auth,
      name: `accounts/${merchantId}/developerRegistration`,
      requestBody: {
        developerEmail: "studio.codebucket@gmail.com",
      },
    });
    console.log("Project successfully registered:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "Failed to register GCP project:",
      err.response?.data || err.message,
    );
    throw err;
  }
}

export async function getExistingGcpRegistration() {
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantApi = google.merchantapi("accounts_v1");

  const res =
    await merchantApi.accounts.developerRegistration.getAccountForGcpRegistration(
      {
        auth,
      },
    );
  console.log("Existing registration:", res.data);
  return res.data;
}

function getMerchantApiDataSourceName(merchantId: string): string {
  const dataSource = getRequiredEnv("GOOGLE_MERCHANT_DATASOURCE");
  if (dataSource.includes("/")) return dataSource;
  return `accounts/${merchantId}/dataSources/${dataSource}`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (true) {
      const currentIndex = index++;
      if (currentIndex >= items.length) return;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
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
    ref.limit(50),
  );

  if (!offers || offers.length === 0) {
    return;
  }

  const productsToInsert = await Promise.all(
    offers.map(async (offer) => {
      const products = await convertOfferToMerchantCenterProducts(offer);
      if (products && products.length > 0) return products;
    }),
  );

  if (!productsToInsert || productsToInsert.length === 0) {
    return;
  }

  const insertResponse = await insertProductsToGoogleMerchantCenter(
    productsToInsert.flat().filter((product) => product !== undefined),
  );

  await Promise.all(
    offers.map(async (offer) => {
      await updateOffer(offer.id, { isAddedToMerchantCenter: true });
    }),
  );

  return insertResponse;
}
