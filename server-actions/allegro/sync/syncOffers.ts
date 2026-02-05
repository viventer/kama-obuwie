"use server";

import { extractSizeFromTitle, removeSizeFromTitle } from "@/helpers/titles";
import { addPercentToPrice } from "@/helpers/prices";
import { createSizingTable } from "../../products/sizingTables";
import {
  AllegroOfferFromListing,
  AllegroOffer,
  Offer,
} from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../../auth/auth";
import {
  getAllegroUserAccessToken,
  getAllegroAccessTokensForBackgroundJob,
} from "../auth";
import { getSingleAllegroHeaders } from "../global";
import axios from "axios";
import { editAllegroOffer, getAllegroOffer } from "../offers";
import { getAllegroSizingTable } from "../sizingTables";
import { getAllegroResponsibleProducer } from "../responsibleProducers";
import { adminDB } from "@/firebase/firebaseAdmin";
import { createOffer, updateOffer } from "../../offers/offers";
import {
  buildExternalId,
  cleanOldExternalId,
  parseExternalId,
} from "@/helpers/externalId";
import { updateProduct } from "../../products/products";
import {
  type ProductParameters,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { redis } from "@/upstash/redis";
import {
  legacyProductIdFromSignature,
  parseSignature,
} from "@/helpers/signature";
import type { LegacyProduct } from "@/firebase/schemas/legacyProductsSchemas";
import {
  fillAvailabilityFromSizingTableIfNeeded,
  transformAllegroSizingTableToSizingTable,
} from "./sizingTableSyncHelpers";
import {
  allegroProductParametersToProductParameters,
  delay,
  getCategoryByAllegroCategoryId,
  getOfferFromDBBySignature,
  getProductsBySignature,
  groupAl1OffersBySignature,
  normalizeLegacyAllegroDescription,
  resolveSkuForOffer,
  removeDynamicSizeAndInsoleFromProductParameters,
  updateOfferInDB,
  updateProductOffersIds,
} from "./syncOffersHelpers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export const getAllAllegroOffers = async (
  channel: "AL1" | "AL2",
  userId?: string, // Opcjonalny userId dla zadań w tle
): Promise<AllegroOfferFromListing[]> => {
  if (!userId) {
    await verifyUser(["ADMIN", "VERIFIED"]);
  }

  console.log(`🔄 Fetching all offers for ${channel}...`);

  let accessToken: string;
  if (userId) {
    const tokens = await getAllegroAccessTokensForBackgroundJob();
    accessToken = tokens[channel];
  } else {
    accessToken = await getAllegroUserAccessToken(channel);
  }

  const headers = getSingleAllegroHeaders(accessToken);

  let allOffers: AllegroOfferFromListing[] = [];
  let offset = 0;
  const limit = 100; // Maksymalna liczba ofert na żądanie
  let hasMore = true;

  while (hasMore) {
    try {
      console.log(
        `📥 Fetching offers ${offset}-${offset + limit} for ${channel}`,
      );

      const response = await axios.get(`${ALLEGRO_API_BASE_URL}/sale/offers`, {
        params: {
          limit: limit,
          offset: offset,
        },
        headers,
      });

      const offers = response.data.offers;

      if (!offers || offers.length === 0) {
        console.log(
          `✅ No more offers found for ${channel} at offset ${offset}`,
        );
        hasMore = false;
      } else {
        console.log(
          `📦 Found ${offers.length} offers for ${channel} at offset ${offset}`,
        );
        allOffers = [...allOffers, ...offers];
        offset += offers.length;

        if (offers.length < limit) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error(
        `❌ Error fetching offers for ${channel} at offset ${offset}:`,
        error,
      );
      hasMore = false;
    }
  }

  console.log(`🎉 Total offers fetched for ${channel}: ${allOffers.length}`);

  if (allOffers.length === 0) {
    console.warn(
      `⚠️  No offers found for ${channel} in the specified price range`,
    );
  }

  return allOffers;
};

export const transformAllegroAL1OfferToOffer = async (
  offer: AllegroOfferFromListing,
  SKU: string,
  productId?: string,
): Promise<Offer> => {
  const size = extractSizeFromTitle(offer.name) as string;
  const cleanedTitle = removeSizeFromTitle(offer.name);

  const externalId = offer.external?.id || "";
  const cleanedExternalId = cleanOldExternalId(externalId);
  const { signature } = parseExternalId(cleanedExternalId);

  const finalSignature = signature.trim() || "";
  console.log("Offer primary image URL:", offer.primaryImage.url);

  const parsedSignature = parseSignature(finalSignature);
  const parsedColorVariantName = parsedSignature.colorVariantName;

  const al1Amount = offer.sellingMode.price.amount;
  const al2Amount = addPercentToPrice(al1Amount, 10);

  const transformedOffer: Offer = {
    title: cleanedTitle,
    productId: productId || null,
    thumbnail: offer.primaryImage.url,
    signature: finalSignature,
    colorVariantName: parsedColorVariantName,
    sellingPrices: {
      AL1: al1Amount,
      DTC: al1Amount,
      POS: al1Amount,
      AL2: al2Amount,
    },
    initialSellingPrices: {
      AL1: al1Amount,
      DTC: al1Amount,
      POS: al1Amount,
      AL2: al2Amount,
    },
    createdAt: offer.publication?.startedAt || new Date().toISOString(),
    shippingRates: {
      AL1: {
        allegroId: offer.delivery.shippingRates.id,
      },
    },
    returnPolicy: {
      AL1: offer.afterSalesServices.returnPolicy.id,
    },
    impliedWarranty: {
      AL1: offer.afterSalesServices.impliedWarranty.id,
    },
    availability: {
      [size]: {
        value: offer.stock.available.toString(),
      },
    },
    allegroOffersIds: {
      AL1: {
        [size]: offer.id,
      },
    },
    SKU,
  };

  if (offer.afterSalesServices?.warranty?.id) {
    transformedOffer.warranty = {
      AL1: offer.afterSalesServices.warranty.id,
    };
  }

  return transformedOffer;
};

const shouldForceZeroAvailabilityForListingOffer = (
  offer: AllegroOfferFromListing,
): boolean => {
  return (
    (offer.publication?.status === "ENDED" ||
      offer.publication?.status === "INACTIVE") &&
    offer.stock.available > 0
  );
};

const syncAl1SizesForSignature = async (params: {
  signature: string;
  groupedOffers: AllegroOfferFromListing[];
  SKU: string;
  userId?: string;
  existingOffer: Offer | null;
}): Promise<Offer | null> => {
  const { signature, groupedOffers, SKU, userId } = params;
  let { existingOffer } = params;

  const processedSizes = new Set<string>();

  for (const offer of groupedOffers) {
    const size = extractSizeFromTitle(offer.name) as string;
    if (processedSizes.has(size)) {
      console.log(`⚠️  AL1: Skipping duplicate size ${size} for ${signature}`);
      continue;
    }
    processedSizes.add(size);

    console.log(`📦 Processing size ${size} for ${signature}`);

    const forceZeroAvailability =
      shouldForceZeroAvailabilityForListingOffer(offer);
    const availabilityForDb = forceZeroAvailability
      ? "0"
      : offer.stock.available.toString();

    try {
      if (forceZeroAvailability) {
        console.log(
          `⚠️  AL1: Offer is ENDED but has stock.available=${offer.stock.available} (id=${offer.id}). Forcing stock to 0 on Allegro + DB.`,
        );

        try {
          const allegroOfferDetails = await getAllegroOffer(offer.id, "AL1", {
            userId,
          });

          await editAllegroOffer(
            offer.id,
            "AL1",
            {
              stock: {
                available: 0,
                unit: allegroOfferDetails.stock.unit,
              },
            },
            { userId },
          );
        } catch (e) {
          console.warn(
            `⚠️  AL1: Failed to force stock.available=0 on Allegro for offerId=${offer.id}. Will still store availability=0 in DB.`,
            e,
          );
        }
      }

      await editAllegroOffer(
        offer.id,
        "AL1",
        {
          external: {
            id: buildExternalId({ signature, SKU, size }),
          },
        },
        { userId },
      );

      if (existingOffer?.id) {
        await updateOfferInDB(
          existingOffer,
          {
            size,
            allegroId: offer.id,
            availability: availabilityForDb,
            SKU,
          },
          "AL1",
        );

        existingOffer = await getOfferFromDBBySignature(signature);
      } else {
        const transformedOffer = await transformAllegroAL1OfferToOffer(
          offer,
          SKU,
          existingOffer?.productId || undefined,
        );

        if (forceZeroAvailability) {
          transformedOffer.availability[size] = { value: "0" };
        }

        const createdOfferId = await createOffer(transformedOffer);
        console.log(`✨ Created new offer with ID: ${createdOfferId}`);

        existingOffer = await getOfferFromDBBySignature(signature);
      }

      console.log(`✅ AL1: Successfully processed size ${size}`);
    } catch (sizeError: unknown) {
      const message =
        sizeError instanceof Error ? sizeError.message : String(sizeError);
      console.error(
        `❌ AL1: Error processing size ${size} for signature "${signature}":`,
        message,
      );
    }
  }

  return existingOffer;
};

const maybeEnrichLegacyForAl1Signature = async (params: {
  signature: string;
  groupedOffers: AllegroOfferFromListing[];
  representativeOffer: AllegroOfferFromListing;
  representativeSize: string;
  userId?: string;
  existingOffer: Offer;
  parsed: ReturnType<typeof parseSignature>;
}): Promise<{ existingOffer: Offer | null; legacySizingTableId?: string }> => {
  const {
    signature,
    groupedOffers,
    representativeOffer,
    representativeSize,
    userId,
    existingOffer,
    parsed,
  } = params;

  try {
    const categoryFromDb = await getCategoryByAllegroCategoryId(
      representativeOffer.category.id,
    );

    if (!categoryFromDb) {
      throw new Error(
        `Nie znaleziono kategorii dla allegroCategoryId: "${representativeOffer.category.id} (najpewniej akcesoria), pomijam wzbogacanie legacyProduct."`,
      );
    }

    const colorVariantName =
      existingOffer.colorVariantName || parsed.colorVariantName;

    const derivedLegacyProductId = legacyProductIdFromSignature(signature);
    if (!derivedLegacyProductId) {
      throw new Error(
        `Brak signature do wyliczenia legacyProductId (AL1): "${signature}"`,
      );
    }

    const legacyProductId =
      existingOffer.legacyProductId || derivedLegacyProductId;

    const legacyRef = adminDB.collection("legacyProducts").doc(legacyProductId);
    const legacyDoc = await legacyRef.get();
    const existingLegacy = (
      legacyDoc.exists ? legacyDoc.data() : null
    ) as LegacyProduct | null;

    let allegroOfferDetails: AllegroOffer | undefined;
    try {
      allegroOfferDetails = await getAllegroOffer(
        representativeOffer.id,
        "AL1",
        {
          userId,
        },
      );
    } catch (e) {
      console.warn(
        `⚠️  Failed to fetch AL1 template for legacy offer: ${representativeOffer.id}`,
        e,
      );
    }

    let sizingTableId = existingLegacy?.sizingTableId;
    if (!sizingTableId) {
      const allegroSizingTableId = allegroOfferDetails?.sizeTable?.id;
      if (allegroSizingTableId) {
        try {
          const allegroTable = await getAllegroSizingTable(
            allegroSizingTableId,
            "AL1",
            userId ? { userId } : undefined,
          );

          if (allegroTable) {
            const existingSizingTable = await adminDB
              .collection("sizingTables")
              .where("allegroId", "==", allegroSizingTableId)
              .limit(1)
              .get();

            if (!existingSizingTable.empty) {
              // usunięcie starej (niepoprawnej) tabeli jeśli istnieje
              sizingTableId = existingSizingTable.docs[0].id;
            } else {
              const sizingTable = transformAllegroSizingTableToSizingTable({
                ...allegroTable,
                id: allegroSizingTableId,
              });

              sizingTableId = await createSizingTable(
                sizingTable,
                userId ? { userId } : undefined,
              );
            }
          }
        } catch (e) {
          console.warn(
            `⚠️  Failed to fetch/save sizing table for legacy offer (sizeTable.id=${allegroSizingTableId})`,
            e,
          );
        }
      }
    }

    const legacySizingTableId = sizingTableId || existingLegacy?.sizingTableId;

    const offerImages: string[] = Array.isArray(allegroOfferDetails?.images)
      ? allegroOfferDetails!.images
      : [];
    const productSetImages: string[] = Array.isArray(
      allegroOfferDetails?.productSet?.[0]?.product?.images,
    )
      ? allegroOfferDetails!.productSet[0]!.product.images
      : [];

    const imagesFromAllegro =
      offerImages.length > 0 ? offerImages : productSetImages;

    const derivedAllegroDescription = normalizeLegacyAllegroDescription(
      allegroOfferDetails?.description,
    );

    const responsibleProducerRef = (allegroOfferDetails as any)?.productSet?.[0]
      ?.responsibleProducer;
    const responsibleProducerIdFromAllegro =
      typeof responsibleProducerRef?.id === "string"
        ? responsibleProducerRef.id
        : undefined;
    const responsibleProducerNameFromAllegro =
      typeof responsibleProducerRef?.name === "string"
        ? responsibleProducerRef.name
        : undefined;

    let derivedResponsibleProducerName: string | undefined =
      responsibleProducerNameFromAllegro;

    if (!derivedResponsibleProducerName && responsibleProducerIdFromAllegro) {
      try {
        const producer = await getAllegroResponsibleProducer(
          responsibleProducerIdFromAllegro,
          "AL1",
          userId ? { userId } : undefined,
        );
        if (producer?.name) {
          derivedResponsibleProducerName = producer.name;
        }
      } catch (e) {
        console.warn(
          `⚠️  Failed to resolve responsibleProducer name (id=${responsibleProducerIdFromAllegro})`,
          e,
        );
      }
    }

    const derivedParameters = allegroProductParametersToProductParameters(
      allegroOfferDetails?.productSet?.[0]?.product?.parameters,
    );

    const mergedLegacyParameters: ProductParameters | undefined =
      derivedParameters || existingLegacy?.parameters
        ? ({
            required: existingLegacy?.parameters?.required || {},
            optional: {
              ...(derivedParameters?.optional || {}),
              ...(existingLegacy?.parameters?.optional || {}),
            },
          } as ProductParameters)
        : undefined;

    const sanitizedLegacyParameters =
      removeDynamicSizeAndInsoleFromProductParameters(mergedLegacyParameters);

    const nextImagesUrls = {
      ...(existingLegacy?.imagesUrls || {}),
      ...(colorVariantName
        ? {
            [colorVariantName]: Array.from(
              new Set(
                [
                  ...(existingLegacy?.imagesUrls?.[colorVariantName] || []),
                  representativeOffer.primaryImage.url,
                  ...imagesFromAllegro,
                ].filter(
                  (x): x is string => typeof x === "string" && x.length > 0,
                ),
              ),
            ),
          }
        : {}),
    };

    const nowIso = new Date().toISOString();

    const nextLegacyProduct: LegacyProduct = {
      ...(existingLegacy || {}),
      signature: existingLegacy?.signature || signature,
      rootCategory:
        existingLegacy?.rootCategory || categoryFromDb?.rootCategory,
      sizingTableId: sizingTableId || existingLegacy?.sizingTableId,
      manufacturerCode:
        existingLegacy?.manufacturerCode || parsed.manufacturerCode,
      colorVariantName:
        existingLegacy?.colorVariantName || parsed.colorVariantName,
      colorVariants:
        existingLegacy?.colorVariants && existingLegacy.colorVariants.length > 0
          ? existingLegacy.colorVariants
          : colorVariantName
            ? [{ color: colorVariantName }]
            : [],
      parameters: sanitizedLegacyParameters,
      categoryId: existingLegacy?.categoryId || categoryFromDb?.id,
      imagesUrls: nextImagesUrls,
      allegroDescription:
        existingLegacy?.allegroDescription || derivedAllegroDescription,
      responsibleProducer:
        existingLegacy?.responsibleProducer || derivedResponsibleProducerName,
      createdAt: existingLegacy?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (parsed.brand) {
      nextLegacyProduct.brand = parsed.brand;
    }

    await legacyRef.set(nextLegacyProduct, { merge: true });

    await updateOffer(existingOffer.id as string, {
      colorVariantName,
      legacyProductId,
    });

    const refreshed = await getOfferFromDBBySignature(signature);
    return { existingOffer: refreshed, legacySizingTableId };
  } catch (e) {
    console.warn(
      `⚠️  Failed to enrich legacyProduct for signature: ${signature}`,
      e,
    );
    return { existingOffer, legacySizingTableId: undefined };
  }
};

const updateOffersIdsForMatchingProductsStep = async (params: {
  matchingProducts: ProductWithId[];
  existingOffer: Offer | null;
  colorVariantName?: string;
}): Promise<void> => {
  const { matchingProducts, existingOffer, colorVariantName } = params;

  if (matchingProducts.length === 0) {
    console.log(
      `ℹ️  No matching products found for signature: ${existingOffer?.signature}, skipping offersIds update`,
    );
    return;
  }

  if (!existingOffer?.id) {
    console.log(
      `⚠️  Cannot update offersIds: existingOffer is null or missing ID for signature: ${existingOffer?.signature}`,
    );
    return;
  }

  if (!colorVariantName) {
    return;
  }

  console.log(
    `🔄 Updating offersIds for ${matchingProducts.length} products, variant: ${colorVariantName}, offerId: ${existingOffer.id}`,
  );
  await updateProductOffersIds(
    matchingProducts,
    colorVariantName,
    existingOffer.id as string,
  );
};

const updateSkuForMatchingProductsStep = async (params: {
  matchingProducts: ProductWithId[];
  SKU: string;
  colorVariantName?: string;
}): Promise<void> => {
  const { matchingProducts, SKU, colorVariantName } = params;

  if (matchingProducts.length === 0) {
    return;
  }
  if (!colorVariantName) {
    return;
  }

  for (const product of matchingProducts) {
    try {
      const currentSKU = product.SKU || {};
      const updatedSKU = {
        ...currentSKU,
        [colorVariantName]: SKU,
      };

      console.log(
        `🔄 Updating product ${product.id} SKU from:`,
        currentSKU,
        `to:`,
        updatedSKU,
      );

      await updateProduct(product.id, {
        SKU: updatedSKU,
      });

      console.log(
        `✅ Updated product ${product.id} SKU for variant: ${colorVariantName} = ${SKU}`,
      );
    } catch (error) {
      console.error(`❌ Failed to update product ${product.id} SKU:`, error);
    }
  }
};

const syncAL1Offers = async (
  offers: AllegroOfferFromListing[],
  userId?: string,
) => {
  console.log(`🚀 AL1: Starting synchronization of ${offers.length} offers`);

  const offersBySignature = groupAl1OffersBySignature(offers);

  console.log(`🔍 Found ${offersBySignature.size} unique signatures`);

  let processedSignatures = 0;
  let skippedSignatures = 0;
  let errorCount = 0;
  const totalSignatures = offersBySignature.size;

  // Przetwarzaj każdą grupę signature sekwencyjnie
  for (const [signature, groupedOffers] of offersBySignature) {
    console.log(
      `🔄 AL1: Processing signature ${
        processedSignatures + 1
      }/${totalSignatures}: "${signature}" with ${groupedOffers.length} sizes`,
    );

    let existingOffer = await getOfferFromDBBySignature(signature);
    const matchingProducts = await getProductsBySignature(signature);
    console.log(
      `🎯 Found ${matchingProducts.length} matching products for signature: ${signature}`,
    );

    const SKU = await resolveSkuForOffer(existingOffer);
    const parsed = parseSignature(signature);

    let legacySizingTableId: string | undefined;

    existingOffer = await syncAl1SizesForSignature({
      signature,
      groupedOffers,
      SKU,
      userId,
      existingOffer,
    });

    if (matchingProducts.length === 0 && existingOffer?.id) {
      const representativeOffer = groupedOffers[0];
      const representativeSize = extractSizeFromTitle(
        representativeOffer.name,
      ) as string;

      const result = await maybeEnrichLegacyForAl1Signature({
        signature,
        groupedOffers,
        representativeOffer,
        representativeSize,
        userId,
        existingOffer,
        parsed,
      });

      existingOffer = result.existingOffer;
      legacySizingTableId = result.legacySizingTableId;

      // Uzupełnij availability o rozmiary z tabeli rozmiarów tylko dla legacy.
      // Przykład: tabela ma 25-30, na Allegro są 26 i 27 -> dopisz 25,28,29,30 z value="0".
      if (existingOffer?.id) {
        existingOffer = await fillAvailabilityFromSizingTableIfNeeded({
          signature,
          existingOffer,
          matchingProducts,
          legacySizingTableId,
          getOfferFromDBBySignature,
        });
      }
    }

    await updateOffersIdsForMatchingProductsStep({
      matchingProducts,
      existingOffer,
      colorVariantName: parsed.colorVariantName,
    });

    await updateSkuForMatchingProductsStep({
      matchingProducts,
      SKU,
      colorVariantName: parsed.colorVariantName,
    });

    processedSignatures++;

    // Progress tracking
    const progress = Math.round((processedSignatures / totalSignatures) * 100);
    await redis.set(
      "allegro:sync:progress:AL1",
      JSON.stringify({
        processed: processedSignatures,
        total: totalSignatures,
        percentage: progress,
        lastSignature: signature,
      }),
    );

    // Delay między signature aby uniknąć rate limiting (150ms)
    if (processedSignatures < totalSignatures) {
      await delay(150);
    }
  }

  console.log(`🏁 AL1: Synchronization completed!`);
  console.log(`✅ Processed: ${processedSignatures} signatures`);
  console.log(`⚠️  Skipped: ${skippedSignatures} signatures`);
  console.log(`❌ Errors: ${errorCount}`);
};

const syncAL2Offers = async (
  offers: AllegroOfferFromListing[],
  userId?: string,
) => {
  console.log(`🚀 AL2: Starting synchronization of ${offers.length} offers`);

  // Grupuj oferty po signature
  const offersBySignature = new Map<string, AllegroOfferFromListing[]>();

  for (const offer of offers) {
    // Sprawdź czy oferta ma external.id
    if (!offer.external?.id) {
      console.log(
        `⚠️  AL2: Skipping offer "${offer.name}" - missing external.id`,
      );
      continue;
    }

    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const { signature } = parseExternalId(cleanedExternalId);

    // Sprawdź czy signature nie jest puste
    if (!signature || signature.trim() === "") {
      console.log(`⚠️  AL2: Skipping offer "${offer.name}" - empty signature`);
      continue;
    }

    if (!offersBySignature.has(signature)) {
      offersBySignature.set(signature, []);
    }
    offersBySignature.get(signature)!.push(offer);
  }
  console.log(`🔍 AL2: Found ${offersBySignature.size} unique signatures`);

  let processedSignatures = 0;
  let skippedSignatures = 0;
  let errorCount = 0;

  // Przetwarzaj każdą grupę signature sekwencyjnie
  for (const [signature, groupedOffers] of offersBySignature) {
    try {
      console.log(
        `🔄 AL2: Processing signature ${processedSignatures + 1}/${
          offersBySignature.size
        }: "${signature}" with ${groupedOffers.length} sizes`,
      );

      // Sprawdź czy oferta już istnieje (powinna istnieć po synchronizacji AL1)
      let existingOffer = await getOfferFromDBBySignature(signature);

      if (!existingOffer?.id) {
        console.log(
          `⚠️  AL2: No existing offer found for signature "${signature}" - skipping`,
        );
        skippedSignatures++;
        continue;
      }

      const existingSku = existingOffer.SKU;
      if (!existingSku) {
        console.log(
          `⚠️  AL2: Existing offer for signature "${signature}" has no SKU - skipping`,
        );
        skippedSignatures++;
        continue;
      }

      console.log(
        `✅ AL2: Found existing offer with SKU: ${existingOffer.SKU}`,
      );

      // Przetwarzaj wszystkie rozmiary dla tej signature
      const processedSizes = new Set<string>(); // Deduplikacja rozmiarów

      for (let i = 0; i < groupedOffers.length; i++) {
        const offer = groupedOffers[i];
        const size = extractSizeFromTitle(offer.name) as string;

        const forceZeroAvailability =
          shouldForceZeroAvailabilityForListingOffer(offer);

        // Sprawdź czy ten rozmiar już był przetwarzany
        if (processedSizes.has(size)) {
          console.log(
            `⚠️  AL2: Skipping duplicate size ${size} for ${signature}`,
          );
          continue;
        }
        processedSizes.add(size);

        console.log(
          `📦 AL2: Processing size ${i + 1}/${
            groupedOffers.length
          }: ${size} for ${signature}`,
        );

        try {
          if (forceZeroAvailability) {
            console.log(
              `⚠️  AL2: Offer is ENDED but has stock.available=${offer.stock.available} (id=${offer.id}). Forcing stock to 0 on Allegro + DB.`,
            );

            try {
              const allegroOfferDetails = await getAllegroOffer(
                offer.id,
                "AL2",
                {
                  userId,
                },
              );

              await editAllegroOffer(
                offer.id,
                "AL2",
                {
                  stock: {
                    available: 0,
                    unit: allegroOfferDetails.stock.unit,
                  },
                },
                { userId },
              );
            } catch (e) {
              console.warn(
                `⚠️  AL2: Failed to force stock.available=0 on Allegro for offerId=${offer.id}. Will still store availability=0 in DB.`,
                e,
              );
            }
          }

          // Aktualizuj external.id na Allegro dla AL2
          await editAllegroOffer(
            offer.id,
            "AL2",
            {
              external: {
                id: buildExternalId({
                  signature,
                  SKU: existingSku,
                  size,
                }),
              },
            },
            { userId },
          );

          // Aktualizuj istniejącą ofertę z nowym rozmiarem dla AL2
          await updateOfferInDB(
            existingOffer,
            {
              size,
              allegroId: offer.id,
              allegroOffer: offer,
              ...(forceZeroAvailability ? { availability: "0" } : {}),
            },
            "AL2",
          );

          // Pobierz zaktualizowaną ofertę z bazy danych
          const updatedOffer = await getOfferFromDBBySignature(signature);
          if (updatedOffer) {
            existingOffer = updatedOffer;
          }

          console.log(`✅ AL2: Successfully processed size ${size}`);
        } catch (sizeError) {
          console.error(
            `❌ AL2: Error processing size ${size} for signature "${signature}":`,
            sizeError,
          );
          errorCount++;
          // Kontynuuj z następnym rozmiarem
        }
      }

      processedSignatures++;
      console.log(`🎉 AL2: Completed signature "${signature}"`);

      // Progress tracking
      const progress = Math.round(
        (processedSignatures / offersBySignature.size) * 100,
      );
      await redis.set(
        "allegro:sync:progress:AL2",
        JSON.stringify({
          processed: processedSignatures,
          total: offersBySignature.size,
          percentage: progress,
          lastSignature: signature,
        }),
      );

      // Delay między signature aby uniknąć rate limiting (150ms)
      if (processedSignatures < offersBySignature.size) {
        await delay(150);
      }
    } catch (signatureError) {
      console.error(
        `❌ AL2: Error processing signature "${signature}":`,
        signatureError,
      );
      errorCount++;
      // Kontynuuj z następną signature
    }
  }

  console.log(`🏁 AL2: Synchronization completed!`);
  console.log(`✅ Processed: ${processedSignatures} signatures`);
  console.log(`⚠️  Skipped: ${skippedSignatures} signatures`);
  console.log(`❌ Errors: ${errorCount}`);
};

export const syncAllegroOffers = async (
  userId?: string,
  channel: "AL1" | "AL2" = "AL1",
  batch: number = 0,
) => {
  const BATCH_SIZE = 200; // Liczba ofert na batch (zmniejszona z uwagi na timeout)

  console.log(
    `🚀 Starting Allegro offers synchronization for ${channel}, batch ${batch}...`,
  );
  if (userId) {
    console.log(`👤 Running as background job for user: ${userId}`);
  }

  // Pobierz wszystkie oferty dla danego kanału
  console.log(`📥 Fetching ${channel} offers...`);
  const allOffers = await getAllAllegroOffers(channel, userId);
  console.log(`✅ Found ${allOffers.length} ${channel} offers`);

  // Oblicz zakres dla tego batcha
  const startIndex = batch * BATCH_SIZE;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allOffers.length);
  const batchOffers = allOffers.slice(startIndex, endIndex);

  console.log(
    `📦 Processing batch ${batch}: offers ${startIndex}-${endIndex} (${batchOffers.length} offers)`,
  );

  // Zapisz channel jako string przed zawężeniem typu
  const currentChannel: string = channel;

  // Sprawdź czy są kolejne batche
  const hasMoreInChannel = endIndex < allOffers.length;
  const nextBatch = hasMoreInChannel ? batch + 1 : 0;
  const nextChannel =
    !hasMoreInChannel && currentChannel === "AL1" ? "AL2" : currentChannel;
  const hasMore = hasMoreInChannel || currentChannel === "AL1"; // Jeśli to AL1, zawsze będzie AL2

  try {
    if (channel === "AL1") {
      if (batchOffers.length > 0) {
        console.log(`🔄 Starting AL1 batch ${batch} synchronization...`);
        await syncAL1Offers(batchOffers, userId);
        console.log(`✅ AL1 batch ${batch} synchronization completed`);
      }
    } else {
      if (batchOffers.length > 0) {
        console.log(`🔄 Starting AL2 batch ${batch} synchronization...`);
        await syncAL2Offers(batchOffers, userId);
        console.log(`✅ AL2 batch ${batch} synchronization completed`);
      }
    }

    // Zwróć informacje o tym czy są kolejne batche
    const result: {
      success: true;
      channel: string;
      batch: number;
      processedOffers: number;
      totalOffers: number;
      hasMore: boolean;
      nextBatch: number;
      nextChannel: string;
      AL1?: { success: true; offersCount: number };
      AL2?: { success: true; offersCount: number };
    } = {
      success: true,
      channel: currentChannel,
      batch,
      processedOffers: batchOffers.length,
      totalOffers: allOffers.length,
      hasMore,
      nextBatch,
      nextChannel,
    };

    // Tylko dla ostatniego batcha zwróć pełne wyniki
    if (!hasMore) {
      result.AL1 = {
        success: true,
        offersCount: currentChannel === "AL1" ? allOffers.length : 0,
      };
      result.AL2 = {
        success: true,
        offersCount: currentChannel === "AL2" ? allOffers.length : 0,
      };
    }

    return result;
  } catch (error) {
    console.error(
      `❌ ${channel} batch ${batch} synchronization failed:`,
      error,
    );
    throw error;
  }
};
