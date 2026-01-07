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
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { verifyUser } from "../auth/auth";
import { getImageUrl } from "@/server-actions/files/files";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { parseSignature } from "@/helpers/signature";

export const createProduct = async function (newProduct: Product) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  ProductSchema.partial().parse(newProduct);

  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);

  return productRef.id;
};

export const updateProduct = async function (
  id: string,
  updateData: Partial<Product>
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
  categoryIds: string[]
): Promise<Record<string, ProductListingData[]>> {
  const allProducts = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("categoryId", "in", categoryIds)
  );

  const legacyOffersAll =
    (await getDocumentsFromAdminDB<OfferWithId>("offers", (ref) =>
      ref.where("legacyProductId", ">", "")
    )) ?? [];

  const getOffersByIds = async (offerIds: string[]): Promise<OfferWithId[]> => {
    const uniqueIds = Array.from(
      new Set(offerIds.filter((id) => typeof id === "string" && id.trim()))
    );

    if (uniqueIds.length === 0) return [];

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 10) {
      chunks.push(uniqueIds.slice(i, i + 10));
    }

    const snapshots = await Promise.all(
      chunks.map((batch) =>
        adminDB
          .collection("offers")
          .where(FieldPath.documentId(), "in", batch)
          .get()
      )
    );

    return snapshots.flatMap((snap) =>
      snap.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...(doc.data() as Omit<OfferWithId, "id">),
          }) as OfferWithId
      )
    );
  };

  const productsArray = allProducts ?? [];

  const neededOfferIds: string[] = [];
  for (const product of productsArray) {
    if (!product.offersIds) continue;
    for (const offerId of Object.values(product.offersIds)) {
      if (typeof offerId === "string" && offerId.trim()) {
        neededOfferIds.push(offerId);
      }
    }
  }

  const offers = await getOffersByIds(neededOfferIds);
  const offerById = new Map<string, OfferWithId>(offers.map((o) => [o.id, o]));

  const transformProductToProductListingData = async (
    product: ProductWithId
  ): Promise<ProductListingData[]> => {
    const productListingDataArray: ProductListingData[] = [];

    if (!product.offersIds || !product.colorVariants) {
      return productListingDataArray;
    }

    // Iterujemy przez wszystkie warianty kolorystyczne
    for (const colorVariant of product.colorVariants) {
      const colorVariantName = getColorVariantName(colorVariant);
      const offerId = product.offersIds[colorVariantName];

      if (!offerId) continue;

      const offer = offerById.get(offerId);
      if (!offer) continue;

      // Sprawdź, czy z danego koloru jest dostępny choć jeden rozmiar
      const isActive = Object.values(offer.availability).some(
        (availability) =>
          availability.value &&
          availability.value !== "" &&
          availability.value !== "0"
      );

      let thumbnailUrl = "";
      if (offer.thumbnail) {
        if (isValidUrl(offer.thumbnail)) {
          thumbnailUrl = offer.thumbnail;
        } else {
          const imageUrl = await getImageUrl(offer.thumbnail);
          thumbnailUrl = imageUrl || "";
        }
      } else if (product?.editedPhotos) {
        const editedPhotoForVariant = product.editedPhotos.find(
          (photo) => photo.colorVariantName === colorVariantName
        );
        if (editedPhotoForVariant) {
          const imageUrl = await getImageUrl(editedPhotoForVariant.filePath);
          thumbnailUrl = imageUrl || "";
        }
      }

      productListingDataArray.push({
        thumbnailUrl,
        price: offer.sellingPrices.DTC || "0",
        id: product.id,
        brand: product?.brand || undefined,
        colorVariantName,
        isActive,
      });
    }

    return productListingDataArray;
  };

  const products: Record<string, ProductListingData[]> = {};

  const legacyCache = new Map<string, LegacyProductWithId | null>();
  const getLegacyById = async (
    id: string
  ): Promise<LegacyProductWithId | null> => {
    if (legacyCache.has(id)) return legacyCache.get(id)!;
    const { data } = await getDocumentFromAdminDB<LegacyProductWithId>(
      "legacyProducts",
      id
    );
    const legacy = data || null;
    legacyCache.set(id, legacy);
    return legacy;
  };

  for (const categoryId of categoryIds) {
    const categoryProducts =
      allProducts?.filter((product) => product.categoryId === categoryId) || [];

    const productsListingData: ProductListingData[] = [];
    for (const product of categoryProducts) {
      const productListingDataArray =
        await transformProductToProductListingData(product);
      // Dodajemy wszystkie warianty kolorystyczne do listy
      productsListingData.push(...productListingDataArray);
    }

    // Legacy: oferty bez produktu, ale z legacyProductId (żeby były widoczne w sklepie)
    const legacyOffersListingData: ProductListingData[] = [];

    const legacyOffers = legacyOffersAll.filter(
      (offer) => !offer.productId && offer.legacyProductId
    );

    for (const offer of legacyOffers) {
      if (!offer.legacyProductId) continue;

      const legacy = await getLegacyById(offer.legacyProductId);
      const legacyCategoryId = legacy?.categoryId;
      if (!legacyCategoryId || legacyCategoryId !== categoryId) continue;

      const parsed = parseSignature(offer.signature || "");
      const colorVariantName =
        legacy?.colorVariantName ||
        offer.colorVariantName ||
        parsed.colorVariantName ||
        "";

      if (!colorVariantName) continue;

      const isActive = Object.values(offer.availability || {}).some(
        (availability) =>
          availability.value &&
          availability.value !== "" &&
          availability.value !== "0"
      );

      const legacyImages = legacy?.imagesUrls || {};
      const fallbackThumb = legacyImages[colorVariantName]?.[0] || "";
      const thumbnailUrl = offer.thumbnail || fallbackThumb;

      const price =
        offer.sellingPrices?.DTC ||
        offer.sellingPrices?.AL1 ||
        offer.sellingPrices?.AL2 ||
        "0";

      legacyOffersListingData.push({
        thumbnailUrl,
        price,
        id: offer.id,
        brand: legacy?.brand || undefined,
        colorVariantName,
        isActive,
      });
    }

    productsListingData.push(...legacyOffersListingData);

    products[categoryId] = productsListingData;
  }

  return products;
};
