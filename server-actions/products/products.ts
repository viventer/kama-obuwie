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

export const getProductBySKU = async function (
  sku: string
): Promise<ProductWithId | null> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  if (!sku || sku.trim() === "") {
    throw new Error("SKU nie może być pusty.");
  }

  const products = await getDocumentsFromAdminDB<Product>("products");

  if (!products) {
    return null;
  }

  for (const product of products) {
    if (product.SKU) {
      const skuValues = Object.values(product.SKU);
      if (skuValues.includes(sku)) {
        return product as ProductWithId;
      }
    }
  }

  return null;
};

export const getProductsListingData = async function (
  categoryIds: string[]
): Promise<Record<string, ProductListingData[]>> {
  const allProducts = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("categoryId", "in", categoryIds)
  );

  const allOffers = await getDocumentsFromAdminDB<OfferWithId>("offers");

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

      const offer = allOffers?.find((offer) => offer.id === offerId);
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
    const legacyOffers =
      allOffers?.filter((offer) => !offer.productId && offer.legacyProductId) ||
      [];

    for (const offer of legacyOffers) {
      if (!offer.legacyProductId) continue;

      const legacy = await getLegacyById(offer.legacyProductId);
      const legacyCategoryId = legacy?.category?.id;
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
