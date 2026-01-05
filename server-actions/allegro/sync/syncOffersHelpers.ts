import { adminDB } from "@/firebase/firebaseAdmin";
import type {
  AllegroOffer,
  AllegroOfferDescription,
  AllegroOfferFromListing,
  Offer,
} from "@/firebase/schemas/offersSchemas";
import type {
  CategoryWithId,
  ProductParameters,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { cleanOldExternalId, parseExternalId } from "@/helpers/externalId";
import { parseSignature } from "@/helpers/signature";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { generateUniqueSKU } from "../../products/SKU";
import { updateProduct } from "../../products/products";
import { updateOffer } from "../../offers/offers";

const normalizeLegacyAllegroDescriptionText = (text: string): string => {
  let result = text;

  // Rozmiar zawsze po frazie "rozmiar: "
  result = result.replace(
    /(\brozmiar:\s*)((?:<[^>]+>\s*)*)([0-9]+(?:-[0-9]+)?(?:[.,][0-9]+)?)((?:\s*<\/[^>]+>\s*)*)/gi,
    "$1$2{rozmiar}$4"
  );

  // Długość wkładki po frazie zawierającej "długość wkładki" (np. "długość wkładki wew.")
  result = result.replace(
    /(\bdługość wkładki[^:]*:\s*)((?:<[^>]+>\s*)*)([0-9]+(?:[.,][0-9]+)?)(?:\s*cm)?((?:\s*<\/[^>]+>\s*)*)(?:\s*cm)?/gi,
    "$1$2{długość wkładki}$4"
  );

  return result;
};

export const normalizeLegacyAllegroDescription = (
  description: AllegroOfferDescription | undefined
): AllegroOfferDescription | undefined => {
  if (!description) return undefined;

  return {
    sections: description.sections.map((section) => ({
      items: section.items.map((item) => {
        if (item.type !== "TEXT" || typeof item.content !== "string") {
          return item;
        }
        return {
          ...item,
          content: normalizeLegacyAllegroDescriptionText(item.content),
        };
      }),
    })),
  };
};

const normalizeParamName = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łŁ]/g, "l")
    .replace(/[ąĄ]/g, "a")
    .replace(/[ćĆ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[ńŃ]/g, "n")
    .replace(/[óÓ]/g, "o")
    .replace(/[śŚ]/g, "s")
    .replace(/[żŻ]/g, "z")
    .replace(/[źŹ]/g, "z");
};

export const removeDynamicSizeAndInsoleFromProductParameters = (
  parameters: ProductParameters | undefined
): ProductParameters | undefined => {
  if (!parameters) return undefined;

  const nextOptional: NonNullable<ProductParameters["optional"]> = {};
  for (const [key, value] of Object.entries(parameters.optional || {})) {
    const normalized = normalizeParamName(key);
    if (normalized === "rozmiar") continue;
    if (normalized.includes("dlugosc wkladki")) continue;
    nextOptional[key] = value as any;
  }

  return {
    required: parameters.required || {},
    optional: nextOptional,
  } as ProductParameters;
};

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const getCategoryByAllegroCategoryId = async (
  allegroCategoryId: string
): Promise<CategoryWithId | null> => {
  const snapshot = await adminDB
    .collection("categories")
    .where("allegroCategoryId", "==", allegroCategoryId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ...(doc.data() as Omit<CategoryWithId, "id">),
    id: doc.id,
  } as CategoryWithId;
};

export const getOfferFromDBBySignature = async (
  signature: string
): Promise<Offer | null> => {
  const existingOfferQuery = await adminDB
    .collection("offers")
    .where("signature", "==", signature)
    .limit(1)
    .get();

  if (existingOfferQuery.empty) {
    return null;
  }

  const existingOffer = existingOfferQuery.docs[0];
  return { ...existingOffer.data(), id: existingOffer.id } as Offer;
};

export const getProductsBySignature = async (
  signature: string
): Promise<ProductWithId[]> => {
  const parsed = parseSignature(signature);
  const colorVariantName = parsed.colorVariantName;
  const manufacturerCode = parsed.manufacturerCode;
  if (!colorVariantName || !manufacturerCode) {
    return [];
  }

  console.log(
    `🔍 Searching products: manufacturerCode="${manufacturerCode}", colorVariant="${colorVariantName}"`
  );

  const productsQuery = adminDB
    .collection("products")
    .where("manufacturerCode", "==", manufacturerCode);

  const querySnapshot = await productsQuery.get();

  if (querySnapshot.empty) {
    console.log(
      `⚠️  No products found for manufacturerCode: ${manufacturerCode}`
    );
    return [];
  }

  const products: ProductWithId[] = [];

  querySnapshot.forEach((doc) => {
    const productData = { ...doc.data(), id: doc.id } as ProductWithId;

    if (productData.colorVariants) {
      const hasMatchingVariant = productData.colorVariants.some(
        (variant) => getColorVariantName(variant) === colorVariantName
      );

      if (hasMatchingVariant) {
        products.push(productData);
      }
    }
  });

  console.log(
    `✅ Found ${products.length} matching products for signature: ${signature}`
  );
  return products;
};

export const updateProductOffersIds = async (
  products: ProductWithId[],
  colorVariantName: string,
  offerId: string
) => {
  console.log(
    `🏗️  Starting updateProductOffersIds: ${products.length} products, variant: ${colorVariantName}, offerId: ${offerId}`
  );

  const uniqueProducts = products.filter(
    (product, index, self) =>
      self.findIndex((p) => p.id === product.id) === index
  );

  if (uniqueProducts.length === 0) {
    console.log(`⚠️  No unique products found for updateProductOffersIds`);
    return;
  }

  if (uniqueProducts.length > 1) {
    console.log(
      `⚠️  Found ${uniqueProducts.length} duplicate products for colorVariant: ${colorVariantName}, removing duplicates`
    );
  }

  for (const product of uniqueProducts) {
    try {
      let currentOffersIds = product.offersIds || {};

      if (currentOffersIds && typeof currentOffersIds === "object") {
        // Jeśli istnieją klucze AL1 lub AL2, znaczy to że mamy starą strukturę
        if ("AL1" in currentOffersIds || "AL2" in currentOffersIds) {
          console.log(
            `🧹 Cleaning old offersIds structure for product ${product.id}`
          );
          currentOffersIds = {}; // Resetuj do pustego obiektu
        }
      }

      const updatedOffersIds = {
        ...currentOffersIds,
        [colorVariantName]: offerId,
      };

      console.log(
        `🔄 Updating product ${product.id} offersIds from:`,
        currentOffersIds,
        `to:`,
        updatedOffersIds
      );

      await updateProduct(product.id, {
        offersIds: updatedOffersIds,
      });

      console.log(
        `✅ Updated product ${product.id} offersIds for variant: ${colorVariantName} -> ${offerId}`
      );
    } catch (error) {
      console.error(`❌ Failed to update product ${product.id}:`, error);
    }
  }
};

export const updateOfferInDB = async (
  offerData: Offer,
  updateData: {
    allegroId: string;
    size: string;
    SKU?: string;
    availability?: string;
    allegroOffer?: AllegroOfferFromListing;
  },
  salesChannel: "AL1" | "AL2"
) => {
  const { size, allegroId, availability, SKU, allegroOffer } = updateData;

  let updatedOffer;

  if (salesChannel === "AL1") {
    updatedOffer = {
      ...offerData,
      allegroOffersIds: {
        AL1: {
          ...offerData.allegroOffersIds?.AL1,
          [size]: allegroId,
        },
        AL2: {
          ...offerData.allegroOffersIds?.AL2,
        },
      },
      availability: {
        ...offerData.availability,
        [size]: {
          value: availability as string,
        },
      },
      SKU,
    };
  } else {
    const al2Updates: Partial<Offer> = allegroOffer
      ? {
          sellingPrices: {
            ...offerData.sellingPrices,
            AL2: allegroOffer.sellingMode.price.amount,
          },
          initialSellingPrices: {
            ...offerData.initialSellingPrices,
            AL2: allegroOffer.sellingMode.price.amount,
          },
          shippingRates: {
            ...offerData.shippingRates,
            AL2: {
              allegroId: allegroOffer.delivery.shippingRates.id,
            },
          },
          returnPolicy: {
            ...offerData.returnPolicy,
            AL2: allegroOffer.afterSalesServices.returnPolicy.id,
          },
          impliedWarranty: {
            ...offerData.impliedWarranty,
            AL2: allegroOffer.afterSalesServices.impliedWarranty.id,
          },
        }
      : {};

    if (allegroOffer && allegroOffer.afterSalesServices?.warranty?.id) {
      al2Updates.warranty = {
        ...offerData.warranty,
        AL2: allegroOffer.afterSalesServices.warranty.id,
      };
    }

    updatedOffer = {
      ...offerData,
      ...al2Updates,
      allegroOffersIds: {
        AL1: {
          ...offerData.allegroOffersIds?.AL1,
        },
        AL2: {
          ...offerData.allegroOffersIds?.AL2,
          [size]: allegroId,
        },
      },
    };
  }

  await updateOffer(offerData.id as string, updatedOffer);
};

export const groupAl1OffersBySignature = (
  offers: AllegroOfferFromListing[]
): Map<string, AllegroOfferFromListing[]> => {
  const offersBySignature = new Map<string, AllegroOfferFromListing[]>();

  for (const offer of offers) {
    if (!offer.external?.id) {
      console.log(
        `⚠️  AL1: Skipping offer "${offer.name}" - missing external.id`
      );
      continue;
    }

    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const { signature } = parseExternalId(cleanedExternalId);
    if (!signature || signature.trim() === "") {
      console.log(`⚠️  AL1: Skipping offer "${offer.name}" - empty signature`);
      continue;
    }

    if (!offersBySignature.has(signature)) {
      offersBySignature.set(signature, []);
    }
    offersBySignature.get(signature)!.push(offer);
  }

  return offersBySignature;
};

export const resolveSkuForOffer = async (existingOffer: Offer | null) => {
  if (existingOffer?.SKU) {
    const SKU = existingOffer.SKU;
    console.log(`✅ Using existing SKU: ${SKU}`);
    return SKU;
  }

  const SKU = await generateUniqueSKU();
  console.log(`🆕 Generated new SKU: ${SKU}`);
  return SKU;
};

export const allegroProductParametersToProductParameters = (
  allegroParameters:
    | AllegroOffer["productSet"][number]["product"]["parameters"]
    | undefined
): ProductParameters | undefined => {
  if (!Array.isArray(allegroParameters) || allegroParameters.length === 0) {
    return undefined;
  }

  const optional: NonNullable<ProductParameters["optional"]> = {};

  const normalizeParamName = (value: string): string => {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[łŁ]/g, "l")
      .replace(/[ąĄ]/g, "a")
      .replace(/[ćĆ]/g, "c")
      .replace(/[ęĘ]/g, "e")
      .replace(/[ńŃ]/g, "n")
      .replace(/[óÓ]/g, "o")
      .replace(/[śŚ]/g, "s")
      .replace(/[żŻ]/g, "z")
      .replace(/[źŹ]/g, "z");
  };

  const isDynamicSizeOrInsoleParam = (name: string): boolean => {
    const normalized = normalizeParamName(name);
    if (normalized === "rozmiar") return true;
    if (normalized.includes("dlugosc wkladki")) return true;
    return false;
  };

  for (const p of allegroParameters) {
    const name = typeof p?.name === "string" ? p.name.trim() : "";
    if (!name) {
      continue;
    }

    // Te parametry uzupełniamy dopiero podczas wystawiania konkretnej oferty
    // (zależne od rozmiaru), więc nie zapisujemy ich w legacyProduct.parameters.
    if (isDynamicSizeOrInsoleParam(name)) {
      continue;
    }

    const values = Array.isArray(p?.values) ? p.values : [];
    if (values.length === 0) {
      continue;
    }

    const singleOrArray =
      values.length === 1
        ? values[0]
        : (() => {
            const allStrings = values.every((v) => typeof v === "string");
            const allNumbers = values.every((v) => typeof v === "number");
            if (allStrings) return values as string[];
            if (allNumbers) return values as number[];
            // ProductParameters (ParamValueSchema) nie wspiera tablic booleanów ani mieszanek,
            // więc w takich przypadkach zapisujemy jako stringi.
            return values.map((v) => String(v));
          })();

    optional[name] = singleOrArray as any;
  }

  return {
    required: {},
    optional,
  } as ProductParameters;
};
