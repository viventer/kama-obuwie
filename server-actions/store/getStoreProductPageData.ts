"use server";

import { getDocumentFromAdminDB } from "@/firebase/getters";
import type {
  CategoryWithId,
  ColorVariant,
  ProductParameters,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import type { OfferWithId } from "@/firebase/schemas/offersSchemas";
import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { getImagesUrls, getImageUrl } from "@/server-actions/files/files";
import { choosingSizeImageFilePath } from "@/lib/constants";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { parseSignature } from "@/helpers/signature";

export type StoreProductDataForStore = {
  id: string;
  brand?: string;
  manufacturerCode: string;
  colorVariants: ColorVariant[];
  parameters: ProductParameters;
  description?:
    | ProductWithId["description"]
    | LegacyProductWithId["allegroDescription"];
  connectedOffers?: connectedOfferData[];
};

export type connectedOfferData = {
  offerId: string;
  thumbnail: string;
  colorVariantName: string;
};

export type StoreProductPageData = {
  imagesUrls: Record<string, string[]>;
  category: CategoryWithId;
  offersData: Record<string, OfferWithId>;
  sizingTable?: SizingTableWithId;
  productData: StoreProductDataForStore;
  choosingSizeImageUrl?: string;
};

async function getChoosingSizeImageUrl(): Promise<string | undefined> {
  try {
    const url = await getImageUrl(choosingSizeImageFilePath);
    return url || undefined;
  } catch (error) {
    console.error("Błąd podczas pobierania obrazka z instrukcją:", error);
    return undefined;
  }
}

export async function getStoreProductPageData(params: {
  id: string;
  colorVariantName?: string;
}): Promise<StoreProductPageData | null> {
  const { id, colorVariantName } = params;

  const productResult = await getDocumentFromAdminDB<ProductWithId>(
    "products",
    id,
  );
  const product = productResult.data;

  const isProduct = Boolean(
    product && product.editedPhotos && product.categoryId,
  );

  const imagesUrls: Record<string, string[]> = {};
  const offersData: Record<string, OfferWithId> = {};

  let category: CategoryWithId | undefined;
  let sizingTable: SizingTableWithId | undefined;
  let productData: StoreProductDataForStore | undefined;

  if (isProduct && product) {
    const editedPhotos = product.editedPhotos || [];

    for (const image of editedPhotos) {
      if (!image.colorVariantName) continue;
      if (!imagesUrls[image.colorVariantName]) {
        imagesUrls[image.colorVariantName] = [];
      }
    }

    for (const variantName of Object.keys(imagesUrls)) {
      const variantImages = editedPhotos.filter(
        (image) => image.colorVariantName === variantName,
      );
      const filePaths = variantImages.map((image) => image.filePath);
      if (filePaths.length === 0) continue;

      const urls = await getImagesUrls(filePaths);
      if (urls) {
        imagesUrls[variantName] = urls;
      }
    }

    const categoryResult = await getDocumentFromAdminDB<CategoryWithId>(
      "categories",
      product.categoryId as string,
    );
    if (!categoryResult.data) return null;
    category = categoryResult.data;

    if (product.offersIds) {
      for (const [variantName, offerId] of Object.entries(product.offersIds)) {
        if (typeof offerId !== "string" || offerId.trim().length === 0) {
          continue;
        }
        const { data: offer } = await getDocumentFromAdminDB<OfferWithId>(
          "offers",
          offerId,
        );
        if (offer) {
          offersData[variantName] = offer;
        }
      }
    }

    if (product.sizingTableId) {
      const { data: sizingTableData } =
        await getDocumentFromAdminDB<SizingTableWithId>(
          "sizingTables",
          product.sizingTableId,
        );
      if (sizingTableData) {
        sizingTable = sizingTableData;
      }
    }

    productData = {
      id,
      brand: product.brand,
      manufacturerCode: product.manufacturerCode,
      colorVariants: product.colorVariants || [],
      parameters: product.parameters,
      description: product.description,
    };
  } else {
    // Fallback: id wskazuje na offerId (legacy)
    const { data: offer } = await getDocumentFromAdminDB<OfferWithId>(
      "offers",
      id,
    );

    if (!offer) {
      return null;
    }

    if (!offer.legacyProductId) {
      return null;
    }

    const { data: legacy } = await getDocumentFromAdminDB<LegacyProductWithId>(
      "legacyProducts",
      offer.legacyProductId,
    );

    if (!legacy) {
      return null;
    }

    const parsed = parseSignature(offer.signature || "");

    const baseColorVariantName =
      typeof colorVariantName === "string"
        ? colorVariantName
        : legacy.colorVariantName ||
          offer.colorVariantName ||
          parsed.colorVariantName;

    if (!baseColorVariantName) {
      return null;
    }

    const legacyCategoryId = legacy.categoryId;
    if (!legacyCategoryId) {
      return null;
    }

    const categoryResult = await getDocumentFromAdminDB<CategoryWithId>(
      "categories",
      legacyCategoryId,
    );
    if (!categoryResult.data) {
      return null;
    }
    category = categoryResult.data;

    if (legacy.sizingTableId) {
      const { data: sizingTableData } =
        await getDocumentFromAdminDB<SizingTableWithId>(
          "sizingTables",
          legacy.sizingTableId,
        );
      if (sizingTableData) {
        sizingTable = sizingTableData;
      }
    }

    const legacyImagesUrls = legacy.imagesUrls || {};
    if (legacyImagesUrls[baseColorVariantName]?.length) {
      imagesUrls[baseColorVariantName] = legacyImagesUrls[baseColorVariantName];
    } else if (offer.thumbnail) {
      imagesUrls[baseColorVariantName] = [offer.thumbnail];
    } else {
      imagesUrls[baseColorVariantName] = [];
    }

    offersData[baseColorVariantName] = offer;

    const legacyColorVariants =
      legacy.colorVariants && legacy.colorVariants.length > 0
        ? legacy.colorVariants
        : ([{ color: baseColorVariantName }] as ColorVariant[]);

    const hasVariant = legacyColorVariants.some(
      (v) => getColorVariantName(v) === baseColorVariantName,
    );

    const finalColorVariants = hasVariant
      ? legacyColorVariants
      : ([{ color: baseColorVariantName }] as ColorVariant[]);

    const connectedOffers = offer.connectedOffers || [];
    const connectedOffersData: connectedOfferData[] = [];
    for (const connectedOfferId of connectedOffers) {
      if (connectedOfferId === offer.id) continue;
      const { data: connectedOffer } =
        await getDocumentFromAdminDB<OfferWithId>("offers", connectedOfferId);
      if (connectedOffer) {
        const connectedColorVariantName =
          connectedOffer.colorVariantName ||
          parseSignature(connectedOffer.signature || "").colorVariantName;
        if (connectedColorVariantName) {
          connectedOffersData.push({
            offerId: connectedOffer.id,
            thumbnail: connectedOffer.thumbnail || "",
            colorVariantName: connectedColorVariantName,
          });
        }
      }
    }

    productData = {
      id,
      brand: legacy.brand,
      manufacturerCode:
        legacy.manufacturerCode || parsed.manufacturerCode || "",
      colorVariants: finalColorVariants,
      parameters:
        legacy.parameters ||
        ({ required: {}, optional: {} } as ProductParameters),
      description: legacy.allegroDescription,
    };

    if (connectedOffersData.length > 0) {
      productData.connectedOffers = connectedOffersData;
    }
  }

  if (!category || !productData) {
    return null;
  }

  const choosingSizeImageUrl = await getChoosingSizeImageUrl();

  return {
    imagesUrls,
    productData,
    category,
    offersData,
    sizingTable,
    choosingSizeImageUrl,
  };
}
