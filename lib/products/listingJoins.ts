import { adminDB } from "@/firebase/firebaseAdmin";
import { FieldPath } from "firebase-admin/firestore";
import {
  ProductWithId,
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { getImageUrl } from "@/server-actions/files/files";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { parseSignature } from "@/helpers/signature";
import {
  getDiscountInfo,
  getLowestPrice30dReference,
} from "@/helpers/prices";
import { extractListingFilterAttributes } from "@/helpers/listingFilters/extractAttributes";

export const toUniqueNonEmptyStrings = (values: string[]): string[] =>
  Array.from(
    new Set(values.filter((id) => typeof id === "string" && id.trim())),
  );

export const chunkArray = <T>(values: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [values];
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize));
  }
  return chunks;
};

export const getOffersByDocumentIds = async (
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

export const buildProductsByCategoryId = (
  products: ProductWithId[],
): Record<string, ProductWithId[]> =>
  products.reduce<Record<string, ProductWithId[]>>((acc, product) => {
    if (!product.categoryId) return acc;
    (acc[product.categoryId] ||= []).push(product);
    return acc;
  }, {});

export const collectOfferIdsFromProducts = (
  products: ProductWithId[],
): string[] => {
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

const resolveThumbnail = async (
  offer: OfferWithId,
  product: ProductWithId,
  colorVariantName: string,
): Promise<{ url: string; isAiCoCreated: boolean }> => {
  const editedPhotosForVariant = (product?.editedPhotos || []).filter(
    (photo) => photo.colorVariantName === colorVariantName,
  );

  if (offer.thumbnail) {
    if (isValidUrl(offer.thumbnail)) {
      for (const photo of editedPhotosForVariant) {
        const url = await getImageUrl(photo.filePath);
        if (url === offer.thumbnail) {
          return {
            url: offer.thumbnail,
            isAiCoCreated: photo.isAiCoCreated === true,
          };
        }
      }
      return { url: offer.thumbnail, isAiCoCreated: false };
    }

    const matchingPhoto = editedPhotosForVariant.find(
      (photo) => photo.filePath === offer.thumbnail,
    );
    return {
      url: (await getImageUrl(offer.thumbnail)) || "",
      isAiCoCreated: matchingPhoto?.isAiCoCreated === true,
    };
  }

  const editedPhotoForVariant = editedPhotosForVariant[0];
  if (editedPhotoForVariant) {
    return {
      url: (await getImageUrl(editedPhotoForVariant.filePath)) || "",
      isAiCoCreated: editedPhotoForVariant.isAiCoCreated === true,
    };
  }

  return { url: "", isAiCoCreated: false };
};

const getListingDiscountFields = (
  offer: OfferWithId,
  currentPrice: string,
): Pick<ProductListingData, "lowestPrice30d" | "discountPercent"> => {
  const reference = getLowestPrice30dReference(offer, "DTC");
  const discount = getDiscountInfo(Number(currentPrice), reference);
  if (!discount) return {};

  return {
    lowestPrice30d: discount.oldPrice.toFixed(2),
    discountPercent: discount.percent,
  };
};

export const transformProductToProductListingData = async (
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

    const { url: thumbnailUrl, isAiCoCreated: isThumbnailAiCoCreated } =
      await resolveThumbnail(offer, product, colorVariantName);

    const price =
      offer.sellingPrices.DTC ||
      offer.sellingPrices.AL1 ||
      offer.sellingPrices.AL2 ||
      "0";

    productListingDataArray.push({
      thumbnailUrl,
      isThumbnailAiCoCreated,
      price,
      ...getListingDiscountFields(offer, price),
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
      filters: extractListingFilterAttributes({
        parameters: product.parameters,
        color: colorVariant.color,
      }),
      categoryId: product.categoryId,
      rootCategory: product.rootCategory as RootCategory | undefined,
    });
  }

  return productListingDataArray;
};

export const getLegacyProductsByCategoryIds = async (
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

export const getLegacyOffersByLegacyProductIds = async (
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

export const groupLegacyOffersByCategoryId = (
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

export const transformLegacyOfferToListingData = (
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
    null;

  if (!price) {
    return null;
  }

  const matchedColorVariant = legacy?.colorVariants?.find(
    (cv) => getColorVariantName(cv) === colorVariantName,
  );

  return {
    thumbnailUrl,
    price,
    ...getListingDiscountFields(offer, price),
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
    filters: extractListingFilterAttributes({
      parameters: legacy?.parameters,
      color: matchedColorVariant?.color,
    }),
    categoryId: legacy?.categoryId,
    rootCategory: legacy?.rootCategory as RootCategory | undefined,
  };
};

/** Extended listing row with offer/product fields needed for search indexing. */
export type ListingJoinContext = {
  listing: ProductListingData;
  title: string;
  parameters?: ProductWithId["parameters"];
  features?: string[];
  colorParts: string[];
  manufacturerCode?: string;
};

export const transformProductToListingJoinContext = async (
  product: ProductWithId,
  offerById: Map<string, OfferWithId>,
): Promise<ListingJoinContext[]> => {
  const listingRows = await transformProductToProductListingData(
    product,
    offerById,
  );
  const contexts: ListingJoinContext[] = [];

  for (const listing of listingRows) {
    const offerId = product.offersIds?.[listing.colorVariantName];
    const offer = offerId ? offerById.get(offerId) : undefined;
    const colorVariant = product.colorVariants?.find(
      (cv) => getColorVariantName(cv) === listing.colorVariantName,
    );
    const colorParts = [
      colorVariant?.shade,
      colorVariant?.color,
      colorVariant?.additionalColor,
    ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

    contexts.push({
      listing,
      title: offer?.title || "",
      parameters: product.parameters,
      features: product.features,
      colorParts,
      manufacturerCode: product.manufacturerCode,
    });
  }

  return contexts;
};

export const transformLegacyOfferToListingJoinContext = (
  offer: OfferWithId,
  legacy: LegacyProductWithId | null,
): ListingJoinContext | null => {
  const listing = transformLegacyOfferToListingData(offer, legacy);
  if (!listing) return null;

  const colorVariant = legacy?.colorVariants?.find(
    (cv) => getColorVariantName(cv) === listing.colorVariantName,
  );
  const colorParts = [
    colorVariant?.shade,
    colorVariant?.color,
    colorVariant?.additionalColor,
    listing.colorVariantName,
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  return {
    listing,
    title: offer.title || "",
    parameters: legacy?.parameters,
    features: undefined,
    colorParts,
    manufacturerCode: legacy?.manufacturerCode,
  };
};
