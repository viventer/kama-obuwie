import { adminDB } from "@/firebase/firebaseAdmin";
import type {
  AllegroOffer,
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

  for (const p of allegroParameters) {
    const name = typeof p?.name === "string" ? p.name.trim() : "";
    if (!name) {
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
