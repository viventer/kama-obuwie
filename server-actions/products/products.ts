"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";
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
import { getImageUrl } from "@/server-actions/files/files";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { parseSignature } from "@/helpers/signature";

const toUniqueNonEmptyStrings = (values: string[]): string[] =>
  Array.from(
    new Set(values.filter((id) => typeof id === "string" && id.trim())),
  );

const chunkArray = <T>(values: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [values];
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize));
  }
  return chunks;
};

const getOffersByDocumentIds = async (
  offerIds: string[],
): Promise<OfferWithId[]> => {
  const uniqueIds = toUniqueNonEmptyStrings(offerIds);
  if (uniqueIds.length === 0) return [];

  const chunks = chunkArray(uniqueIds, 10);

  const snapshots = await Promise.all(
    chunks.map((batch) =>
      adminDB
        .collection("offers")
        .where(FieldPath.documentId(), "in", batch)
        .get(),
    ),
  );

  return snapshots.flatMap((snap) =>
    snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...(doc.data() as Omit<OfferWithId, "id">),
        }) as OfferWithId,
    ),
  );
};

const buildProductsByCategoryId = (
  products: ProductWithId[],
): Record<string, ProductWithId[]> =>
  products.reduce<Record<string, ProductWithId[]>>((acc, product) => {
    if (!product.categoryId) return acc;
    (acc[product.categoryId] ||= []).push(product);
    return acc;
  }, {});

const collectOfferIdsFromProducts = (products: ProductWithId[]): string[] => {
  const ids: string[] = [];
  for (const product of products) {
    if (!product.offersIds) continue;
    for (const offerId of Object.values(product.offersIds)) {
      if (typeof offerId === "string" && offerId.trim()) {
        ids.push(offerId);
      }
    }
  }
  return ids;
};

const resolveThumbnailUrl = async (
  offer: OfferWithId,
  product: ProductWithId,
  colorVariantName: string,
): Promise<string> => {
  if (offer.thumbnail) {
    if (isValidUrl(offer.thumbnail)) return offer.thumbnail;
    return (await getImageUrl(offer.thumbnail)) || "";
  }

  if (product?.editedPhotos) {
    const editedPhotoForVariant = product.editedPhotos.find(
      (photo) => photo.colorVariantName === colorVariantName,
    );
    if (editedPhotoForVariant) {
      return (await getImageUrl(editedPhotoForVariant.filePath)) || "";
    }
  }

  return "";
};

const transformProductToProductListingData = async (
  product: ProductWithId,
  offerById: Map<string, OfferWithId>,
): Promise<ProductListingData[]> => {
  const productListingDataArray: ProductListingData[] = [];

  if (!product.offersIds || !product.colorVariants) {
    return productListingDataArray;
  }

  for (const colorVariant of product.colorVariants) {
    const colorVariantName = getColorVariantName(colorVariant);
    const offerId = product.offersIds[colorVariantName];
    if (!offerId) continue;

    const offer = offerById.get(offerId);
    if (!offer) continue;

    const isActive = Object.values(offer.availability).some(
      (availability) =>
        availability.value &&
        availability.value !== "" &&
        availability.value !== "0",
    );

    const thumbnailUrl = await resolveThumbnailUrl(
      offer,
      product,
      colorVariantName,
    );

    productListingDataArray.push({
      thumbnailUrl,
      price: offer.sellingPrices.DTC || "0",
      id: product.id,
      brand: product?.brand || undefined,
      colorVariantName,
      isActive,
      availability: Object.fromEntries(
        Object.entries(offer.availability).map(([size, avail]) => [
          size,
          parseInt(avail.value || "0"),
        ]),
      ),
    });
  }

  return productListingDataArray;
};

const getLegacyProductsByCategoryIds = async (
  categoryIds: string[],
): Promise<LegacyProductWithId[]> => {
  const chunks = chunkArray(categoryIds, 10);
  const legacyProductsAll = (
    await Promise.all(
      chunks.map((chunk) =>
        getDocumentsFromAdminDB<LegacyProductWithId>("legacyProducts", (ref) =>
          ref.where("categoryId", "in", chunk),
        ),
      ),
    )
  )
    .flat()
    .filter(Boolean) as LegacyProductWithId[];

  return legacyProductsAll;
};

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

  // Bez limitu: jedno zapytanie "in".
  if (limit === undefined) {
    return (
      (await getDocumentsFromAdminDB<ProductWithId>("products", (ref) =>
        ref.where("categoryId", "in", categoryIds),
      )) ?? []
    );
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

const getLegacyOffersByLegacyProductIds = async (
  legacyProductIds: string[],
): Promise<OfferWithId[]> => {
  const uniqueLegacyIds = toUniqueNonEmptyStrings(legacyProductIds);
  if (uniqueLegacyIds.length === 0) return [];

  const chunks = chunkArray(uniqueLegacyIds, 10);
  const snapshots = await Promise.all(
    chunks.map((batch) =>
      adminDB.collection("offers").where("legacyProductId", "in", batch).get(),
    ),
  );

  return snapshots.flatMap((snap) =>
    snap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...(doc.data() as Omit<OfferWithId, "id">),
        }) as OfferWithId,
    ),
  );
};

const groupLegacyOffersByCategoryId = (
  legacyOffers: OfferWithId[],
  legacyById: Map<string, LegacyProductWithId>,
): Record<string, OfferWithId[]> => {
  const grouped: Record<string, OfferWithId[]> = {};

  for (const offer of legacyOffers) {
    const legacyProductId = offer.legacyProductId;
    if (!legacyProductId) continue;
    const legacy = legacyById.get(legacyProductId);
    const categoryId = legacy?.categoryId;
    if (!categoryId) continue;
    (grouped[categoryId] ||= []).push(offer);
  }

  return grouped;
};

const transformLegacyOfferToListingData = (
  offer: OfferWithId,
  legacy: LegacyProductWithId | null,
): ProductListingData | null => {
  const parsed = parseSignature(offer.signature || "");
  const colorVariantName =
    legacy?.colorVariantName ||
    offer.colorVariantName ||
    parsed.colorVariantName ||
    "";

  if (!colorVariantName) return null;

  const isActive = Object.values(offer.availability || {}).some(
    (availability) =>
      availability.value &&
      availability.value !== "" &&
      availability.value !== "0",
  );

  const legacyImages = legacy?.imagesUrls || {};
  const fallbackThumb = legacyImages[colorVariantName]?.[0] || "";
  const thumbnailUrl = offer.thumbnail || fallbackThumb;

  const price =
    offer.sellingPrices?.DTC ||
    offer.sellingPrices?.AL1 ||
    offer.sellingPrices?.AL2 ||
    "0";

  return {
    thumbnailUrl,
    price,
    id: offer.id,
    brand: legacy?.brand || undefined,
    colorVariantName,
    isActive,
    availability: Object.fromEntries(
      Object.entries(offer.availability || {}).map(([size, avail]) => [
        size,
        parseInt(avail.value || "0"),
      ]),
    ),
  };
};

export const createProduct = async function (newProduct: Product) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  ProductSchema.partial().parse(newProduct);

  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);

  return productRef.id;
};

export const updateProduct = async function (
  id: string,
  updateData: Partial<Product>,
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  ProductPartialSchema.parse(updateData);
  const productRef = adminDB.collection("products").doc(id);
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error("Produkt nie istnieje.");
  }

  await productRef.update(updateData);
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

    products[categoryId] = productsListingData;
  }

  return products;
};
