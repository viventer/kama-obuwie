"use server";

import { extractSizeFromTitle, removeSizeFromTitle } from "@/helpers/titles";
import { generateUniqueSKU } from "../products/SKU";
import {
  AllegroOfferFromListing,
  Offer,
} from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../auth/auth";
import {
  getAllegroUserAccessToken,
  getAllegroAccessTokensForBackgroundJob,
} from "./auth";
import { getSingleAllegroHeaders } from "./global";
import axios from "axios";
import { editAllegroOffer } from "./offers";
import { adminDB } from "@/firebase/firebaseAdmin";
import { createOffer, updateOffer } from "../offers/offers";
import { cleanOldExternalId, parseExternalId } from "@/helpers/externalId";
import { updateProduct } from "../products/products";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { redis } from "@/upstash/redis";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

// Helper do delay między requestami
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllAllegroOffers = async (
  channel: "AL1" | "AL2",
  userId?: string // Opcjonalny userId dla zadań w tle
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
        `📥 Fetching offers ${offset}-${offset + limit} for ${channel}`
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
          `✅ No more offers found for ${channel} at offset ${offset}`
        );
        hasMore = false;
      } else {
        console.log(
          `📦 Found ${offers.length} offers for ${channel} at offset ${offset}`
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
        error
      );
      hasMore = false;
    }
  }

  console.log(`🎉 Total offers fetched for ${channel}: ${allOffers.length}`);

  if (allOffers.length === 0) {
    console.warn(
      `⚠️  No offers found for ${channel} in the specified price range`
    );
  }

  return allOffers;
};

export const transformAllegroAL1OfferToOffer = async (
  offer: AllegroOfferFromListing,
  SKU: string,
  productId?: string
): Promise<Offer> => {
  const size = extractSizeFromTitle(offer.name) as string;
  const cleanedTitle = removeSizeFromTitle(offer.name);

  const externalId = offer.external?.id || "";
  const cleanedExternalId = cleanOldExternalId(externalId);
  const { signature } = parseExternalId(cleanedExternalId);

  const finalSignature = signature.trim() || "";
  console.log("Offer primary image URL:", offer.primaryImage.url);

  const transformedOffer: Offer = {
    title: cleanedTitle,
    productId: productId || null,
    thumbnail: offer.primaryImage.url,
    signature: finalSignature,
    sellingPrices: {
      AL1: offer.sellingMode.price.amount,
    },
    initialSellingPrices: {
      AL1: offer.sellingMode.price.amount,
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

const getOfferFromDBBySignature = async (
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

// Nowa funkcja do wyszukiwania produktów na podstawie signature
const getProductsBySignature = async (
  signature: string
): Promise<ProductWithId[]> => {
  // signature ma format: "... manufacturerCode colorVariantName"
  // Parsujemy signature, aby wydobyć manufacturerCode i colorVariantName
  const parts = signature.trim().split(" ");
  if (parts.length < 2) {
    return [];
  }

  // Ostatni element to colorVariantName, przedostatni to manufacturerCode
  const colorVariantName = parts[parts.length - 1];
  const manufacturerCode = parts[parts.length - 2];

  console.log(
    `🔍 Searching products: manufacturerCode="${manufacturerCode}", colorVariant="${colorVariantName}"`
  );

  // Szukamy produktów które pasują do manufacturerCode
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

    // Sprawdzamy czy product ma colorVariant o tej nazwie
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

// Funkcja do aktualizacji pola offersIds w produktach
const updateProductOffersIds = async (
  products: ProductWithId[],
  colorVariantName: string,
  offerId: string
) => {
  console.log(
    `🏗️  Starting updateProductOffersIds: ${products.length} products, variant: ${colorVariantName}, offerId: ${offerId}`
  );

  // Usuwamy duplikaty produktów
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
      // WAŻNE: Czyścimy stare offersIds które mają starą strukturę z AL1/AL2
      // Stara struktura: { AL1: [{value: "offerId", colorVariantName: "color"}] }
      // Nowa struktura: { "colorVariantName": "offerId" }
      let currentOffersIds = product.offersIds || {};

      // Sprawdź czy offersIds ma starą strukturę i wyczyść ją
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

const updateOfferInDB = async (
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
    // Dla AL2 dodajemy też właściwości z oferty Allegro
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

const syncAL1Offers = async (
  offers: AllegroOfferFromListing[],
  userId?: string
) => {
  console.log(`🚀 AL1: Starting synchronization of ${offers.length} offers`);

  // Grupuj oferty po signature
  const offersBySignature = new Map<string, AllegroOfferFromListing[]>();

  for (const offer of offers) {
    // Sprawdź czy oferta ma external.id
    if (!offer.external?.id) {
      console.log(
        `⚠️  AL1: Skipping offer "${offer.name}" - missing external.id`
      );
      continue;
    }

    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const { signature } = parseExternalId(cleanedExternalId);

    // Sprawdź czy signature nie jest puste
    if (!signature || signature.trim() === "") {
      console.log(`⚠️  AL1: Skipping offer "${offer.name}" - empty signature`);
      continue;
    }

    if (!offersBySignature.has(signature)) {
      offersBySignature.set(signature, []);
    }
    offersBySignature.get(signature)!.push(offer);
  }

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
      }/${totalSignatures}: "${signature}" with ${groupedOffers.length} sizes`
    );

    // Sprawdź czy oferta już istnieje
    let existingOffer = await getOfferFromDBBySignature(signature);

    // Znajdź odpowiadające produkty na podstawie signature
    const matchingProducts = await getProductsBySignature(signature);
    console.log(
      `🎯 Found ${matchingProducts.length} matching products for signature: ${signature}`
    );

    let SKU: string;

    if (existingOffer?.SKU) {
      SKU = existingOffer.SKU;
      console.log(`✅ Using existing SKU: ${SKU}`);
    } else {
      SKU = await generateUniqueSKU();
      console.log(`🆕 Generated new SKU: ${SKU}`);
    }

    // Przetwarzaj wszystkie rozmiary dla tej signature
    const processedSizes = new Set<string>(); // Deduplikacja rozmiarów

    for (const offer of groupedOffers) {
      const size = extractSizeFromTitle(offer.name) as string;

      // Sprawdź czy ten rozmiar już był przetwarzany
      if (processedSizes.has(size)) {
        console.log(
          `⚠️  AL1: Skipping duplicate size ${size} for ${signature}`
        );
        continue;
      }
      processedSizes.add(size);

      console.log(`📦 Processing size ${size} for ${signature}`);

      try {
        await editAllegroOffer(
          offer.id,
          "AL1",
          {
            external: {
              id: `${signature} [${SKU}r${size}]`,
            },
          },
          { userId }
        );

        if (existingOffer?.id) {
          // Aktualizuj istniejącą ofertę z nowym rozmiarem
          await updateOfferInDB(
            existingOffer,
            {
              size,
              allegroId: offer.id,
              availability: offer.stock.available.toString(),
              SKU,
            },
            "AL1"
          );

          // WAŻNE: Pobierz zaktualizowaną ofertę z bazy danych
          existingOffer = await getOfferFromDBBySignature(signature);
        } else {
          // Utwórz nową ofertę tylko raz dla pierwszego rozmiaru
          const transformedOffer = await transformAllegroAL1OfferToOffer(
            offer,
            SKU,
            existingOffer?.productId || undefined
          );

          const createdOfferId = await createOffer(transformedOffer);
          console.log(`✨ Created new offer with ID: ${createdOfferId}`);

          // Pobierz świeżo utworzoną ofertę z bazy danych
          existingOffer = await getOfferFromDBBySignature(signature);
        }

        console.log(`✅ AL1: Successfully processed size ${size}`);
      } catch (sizeError: any) {
        console.error(
          `❌ AL1: Error processing size ${size} for signature "${signature}":`,
          sizeError.message || sizeError
        );
        // Kontynuuj z następnym rozmiarem
      }
    }

    // Zaktualizuj offersIds w odpowiadających produktach (po przetworzeniu wszystkich rozmiarów)
    if (matchingProducts.length > 0 && existingOffer?.id) {
      const parts = signature.trim().split(" ");
      const colorVariantName = parts[parts.length - 1];

      console.log(
        `🔄 Updating offersIds for ${matchingProducts.length} products, variant: ${colorVariantName}, offerId: ${existingOffer.id}`
      );
      await updateProductOffersIds(
        matchingProducts,
        colorVariantName,
        existingOffer.id as string
      );
    } else if (matchingProducts.length > 0 && !existingOffer?.id) {
      console.log(
        `⚠️  Cannot update offersIds: existingOffer is null or missing ID for signature: ${signature}`
      );
    } else if (matchingProducts.length === 0) {
      console.log(
        `ℹ️  No matching products found for signature: ${signature}, skipping offersIds update`
      );
    }

    // Zaktualizuj SKU w odpowiadających produktach (jeśli istnieją)
    if (matchingProducts.length > 0) {
      const parts = signature.trim().split(" ");
      const colorVariantName = parts[parts.length - 1];

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
            updatedSKU
          );

          await updateProduct(product.id, {
            SKU: updatedSKU,
          });

          console.log(
            `✅ Updated product ${product.id} SKU for variant: ${colorVariantName} = ${SKU}`
          );
        } catch (error) {
          console.error(
            `❌ Failed to update product ${product.id} SKU:`,
            error
          );
        }
      }
    }

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
      })
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
  userId?: string
) => {
  console.log(`🚀 AL2: Starting synchronization of ${offers.length} offers`);

  // Grupuj oferty po signature
  const offersBySignature = new Map<string, AllegroOfferFromListing[]>();

  for (const offer of offers) {
    // Sprawdź czy oferta ma external.id
    if (!offer.external?.id) {
      console.log(
        `⚠️  AL2: Skipping offer "${offer.name}" - missing external.id`
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
        }: "${signature}" with ${groupedOffers.length} sizes`
      );

      // Sprawdź czy oferta już istnieje (powinna istnieć po synchronizacji AL1)
      let existingOffer = await getOfferFromDBBySignature(signature);

      if (!existingOffer?.id) {
        console.log(
          `⚠️  AL2: No existing offer found for signature "${signature}" - skipping`
        );
        skippedSignatures++;
        continue;
      }

      console.log(
        `✅ AL2: Found existing offer with SKU: ${existingOffer.SKU}`
      );

      // Przetwarzaj wszystkie rozmiary dla tej signature
      const processedSizes = new Set<string>(); // Deduplikacja rozmiarów

      for (let i = 0; i < groupedOffers.length; i++) {
        const offer = groupedOffers[i];
        const size = extractSizeFromTitle(offer.name) as string;

        // Sprawdź czy ten rozmiar już był przetwarzany
        if (processedSizes.has(size)) {
          console.log(
            `⚠️  AL2: Skipping duplicate size ${size} for ${signature}`
          );
          continue;
        }
        processedSizes.add(size);

        console.log(
          `📦 AL2: Processing size ${i + 1}/${
            groupedOffers.length
          }: ${size} for ${signature}`
        );

        try {
          // Aktualizuj external.id na Allegro dla AL2
          await editAllegroOffer(
            offer.id,
            "AL2",
            {
              external: {
                id: `${signature} [${existingOffer.SKU}r${size}]`,
              },
            },
            { userId }
          );

          // Aktualizuj istniejącą ofertę z nowym rozmiarem dla AL2
          await updateOfferInDB(
            existingOffer,
            {
              size,
              allegroId: offer.id,
              allegroOffer: offer,
            },
            "AL2"
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
            sizeError
          );
          errorCount++;
          // Kontynuuj z następnym rozmiarem
        }
      }

      processedSignatures++;
      console.log(`🎉 AL2: Completed signature "${signature}"`);

      // Progress tracking
      const progress = Math.round(
        (processedSignatures / offersBySignature.size) * 100
      );
      await redis.set(
        "allegro:sync:progress:AL2",
        JSON.stringify({
          processed: processedSignatures,
          total: offersBySignature.size,
          percentage: progress,
          lastSignature: signature,
        })
      );

      // Delay między signature aby uniknąć rate limiting (150ms)
      if (processedSignatures < offersBySignature.size) {
        await delay(150);
      }
    } catch (signatureError) {
      console.error(
        `❌ AL2: Error processing signature "${signature}":`,
        signatureError
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
  batch: number = 0
) => {
  const BATCH_SIZE = 200; // Liczba ofert na batch (zmniejszona z uwagi na timeout)

  console.log(
    `🚀 Starting Allegro offers synchronization for ${channel}, batch ${batch}...`
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
    `📦 Processing batch ${batch}: offers ${startIndex}-${endIndex} (${batchOffers.length} offers)`
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
    const result: any = {
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
      error
    );
    throw error;
  }
};
