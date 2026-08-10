"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Product,
  ProductPartialSchema,
  ProductSchema,
  ProductWithId,
  ProductListingData,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { verifyUser } from "../auth/auth";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import {
  chunkArray,
  toUniqueNonEmptyStrings,
  getOffersByDocumentIds,
  buildProductsByCategoryId,
  collectOfferIdsFromProducts,
  transformProductToProductListingData,
  getLegacyProductsByCategoryIds,
  getLegacyOffersByLegacyProductIds,
  groupLegacyOffersByCategoryId,
  transformLegacyOfferToListingData,
} from "@/lib/products/listingJoins";
import { invalidateSearchIndexCache } from "@/lib/search/indexCache";

/** Firestore `in` supports at most 30 values. */
const FIRESTORE_IN_LIMIT = 30;

const normalizeLimit = (value: number | undefined): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const normalized = Math.floor(value);
  if (normalized <= 0) return 0;
  return normalized;
};

const getProductsByCategoryIds = async (
  categoryIds: string[],
  productsLimit?: number,
): Promise<ProductWithId[]> => {
  const limit = normalizeLimit(productsLimit);

  // Bez limitu: chunkowane zapytania "in" (max 30 wartości).
  if (limit === undefined) {
    const chunks = chunkArray(categoryIds, FIRESTORE_IN_LIMIT);
    const batches = await Promise.all(
      chunks.map(
        (chunk) =>
          getDocumentsFromAdminDB<ProductWithId>("products", (ref) =>
            ref.where("categoryId", "in", chunk),
          ) ?? [],
      ),
    );
    return batches.flat().filter(Boolean) as ProductWithId[];
  }

  // Limit = 0: nie pobieramy nic.
  if (limit === 0) {
    return [];
  }

  // Z limitem: osobne zapytanie per kategoria, żeby limit działał "per category".
  const snapshots = await Promise.all(
    categoryIds.map((categoryId) =>
      adminDB
        .collection("products")
        .where("categoryId", "==", categoryId)
        .limit(limit)
        .get(),
    ),
  );

  return snapshots.flatMap((snap) =>
    snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...(doc.data() as Omit<ProductWithId, "id">),
        }) as ProductWithId,
    ),
  );
};

export const createProduct = async function (newProduct: Product) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  ProductSchema.partial().parse(newProduct);

  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);
  await invalidateSearchIndexCache();

  return productRef.id;
};

export const updateProduct = async function (
  id: string,
  updateData: Partial<Product>,
  legacy: boolean = false,
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  let productRef;
  let productDoc;
  if (legacy) {
    productRef = adminDB.collection("legacyProducts").doc(id);
    productDoc = await productRef.get();

    await productRef.update(updateData);
  } else {
    ProductPartialSchema.parse(updateData);
    productRef = adminDB.collection("products").doc(id);
    productDoc = await productRef.get();
  }

  if (!productDoc.exists) {
    throw new Error("Produkt nie istnieje.");
  }

  await productRef.update(updateData);
  await invalidateSearchIndexCache();
};

export const getProductsListingData = async function (
  categoryIds: string[],
  productsLimit?: number,
): Promise<Record<string, ProductListingData[]>> {
  const uniqueCategoryIds = toUniqueNonEmptyStrings(categoryIds);

  if (uniqueCategoryIds.length === 0) {
    return {};
  }

  const productsArray = await getProductsByCategoryIds(
    uniqueCategoryIds,
    productsLimit,
  );

  const productsByCategoryId = buildProductsByCategoryId(productsArray);
  const neededOfferIds = collectOfferIdsFromProducts(productsArray);
  const offers = await getOffersByDocumentIds(neededOfferIds);
  const offerById = new Map<string, OfferWithId>(offers.map((o) => [o.id, o]));

  const products: Record<string, ProductListingData[]> = {};

  const legacyProductsAll =
    await getLegacyProductsByCategoryIds(uniqueCategoryIds);
  const legacyById = new Map<string, LegacyProductWithId>(
    legacyProductsAll.map((legacy) => [legacy.id, legacy]),
  );

  const legacyOffersAll = await getLegacyOffersByLegacyProductIds(
    Array.from(legacyById.keys()),
  );
  const legacyOffers = legacyOffersAll.filter(
    (offer) => !offer.productId && offer.legacyProductId,
  );
  const legacyOffersByCategoryId = groupLegacyOffersByCategoryId(
    legacyOffers,
    legacyById,
  );

  for (const categoryId of uniqueCategoryIds) {
    const categoryProducts = productsByCategoryId[categoryId] || [];

    const productsListingData: ProductListingData[] = [];
    for (const product of categoryProducts) {
      const productListingDataArray =
        await transformProductToProductListingData(product, offerById);
      // Dodajemy wszystkie warianty kolorystyczne do listy
      productsListingData.push(...productListingDataArray);
    }

    // Legacy: oferty bez produktu, ale z legacyProductId (żeby były widoczne w sklepie)
    const legacyOffersListingData: ProductListingData[] = [];

    const legacyOffersForCategory = legacyOffersByCategoryId[categoryId] || [];
    for (const offer of legacyOffersForCategory) {
      const legacyProductId = offer.legacyProductId;
      if (!legacyProductId) continue;

      const legacy = legacyById.get(legacyProductId) || null;
      const listing = transformLegacyOfferToListingData(offer, legacy);
      if (!listing) continue;
      legacyOffersListingData.push(listing);
    }

    productsListingData.push(...legacyOffersListingData);

    if (productsListingData.length === 0) {
      continue;
    }

    products[categoryId] = productsListingData;
  }

  return products;
};
