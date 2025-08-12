"use server";

import { extractSizeFromTitle, removeSizeFromTitle } from "@/helpers/titles";
import { generateUniqueSKU } from "../products/SKU";
import {
  AllegroOfferFromListing,
  Offer,
} from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../auth/auth";
import { getAllegroUserAccessToken } from "./auth";
import { getSingleAllegroHeaders } from "./global";
import axios from "axios";
import { editAllegroOffer } from "./offers";
import { adminDB } from "@/firebase/firebaseAdmin";
import { createOffer, updateOffer } from "../offers/offers";
import { cleanOldExternalId, parseExternalId } from "@/helpers/externalId";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export const getAllAllegroOffers = async (
  channel: "AL1" | "AL2"
): Promise<AllegroOfferFromListing[]> => {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const accessToken = await getAllegroUserAccessToken(channel);
  const headers = getSingleAllegroHeaders(accessToken);

  const generalUrl = `${ALLEGRO_API_BASE_URL}/sale/offers`;
  const url1 = `${generalUrl}?sellingMode.price.amount.lte=50&sellingMode.price.amount.gte=29`;
  const url2 = `${generalUrl}?sellingMode.price.amount.lte=80&sellingMode.price.amount.gte=51`;
  const url3 = `${generalUrl}?sellingMode.price.amount.gte=81`;

  const response1 = await axios.get(url1, { headers });
  const response2 = await axios.get(url2, { headers });
  const response3 = await axios.get(url3, { headers });

  const data1 = response1.data.offers;
  const data2 = response2.data.offers;
  const data3 = response3.data.offers;

  if (!data1 && !data2 && !data3) {
    throw new Error("Nie znaleziono oferty na Allegro.");
  }

  return [...data1, ...data2, ...data3] as AllegroOfferFromListing[];
};

export const transformAllegroAL1OfferToOffer = async (
  offer: AllegroOfferFromListing,
  SKU: string,
  productId?: string
): Promise<Offer> => {
  const size = extractSizeFromTitle(offer.name) as string;
  const cleanedTitle = removeSizeFromTitle(offer.name);
  const cleanedExternalId = cleanOldExternalId(offer.external.id);
  const { signature } = parseExternalId(cleanedExternalId);

  return {
    title: cleanedTitle,
    productId: productId || null,
    thumbnail: offer.primaryImage.url,
    signature,
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
    warranty: {
      AL1: offer.afterSalesServices.warranty.id,
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

const updateOfferInDB = async (
  offerData: Offer,
  updateData: {
    allegroId: string;
    size: string;
    SKU?: string;
    availability?: string;
  },
  salesChannel: "AL1" | "AL2"
) => {
  const { size, allegroId, availability, SKU } = updateData;

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
    updatedOffer = {
      ...offerData,
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

const syncAL1Offers = async (offers: AllegroOfferFromListing[]) => {
  // Grupuj oferty po signature
  const offersBySignature = new Map<string, AllegroOfferFromListing[]>();

  for (const offer of offers) {
    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const { signature } = parseExternalId(cleanedExternalId);

    if (!offersBySignature.has(signature)) {
      offersBySignature.set(signature, []);
    }
    offersBySignature.get(signature)!.push(offer);
  }

  console.log(`🔍 Found ${offersBySignature.size} unique signatures`);

  // Przetwarzaj każdą grupę signature sekwencyjnie
  for (const [signature, groupedOffers] of offersBySignature) {
    console.log(
      `🔄 Processing signature: "${signature}" with ${groupedOffers.length} sizes`
    );

    // Sprawdź czy oferta już istnieje
    let existingOffer = await getOfferFromDBBySignature(signature);
    let SKU: string;

    if (existingOffer?.SKU) {
      SKU = existingOffer.SKU;
      console.log(`✅ Using existing SKU: ${SKU}`);
    } else {
      SKU = await generateUniqueSKU();
      console.log(`🆕 Generated new SKU: ${SKU}`);
    }

    // Przetwarzaj wszystkie rozmiary dla tej signature
    for (const offer of groupedOffers) {
      const size = extractSizeFromTitle(offer.name) as string;

      console.log(`📦 Processing size ${size} for ${signature}`);

      await editAllegroOffer(offer.id, "AL1", {
        external: {
          id: `${signature} [${SKU}r${size}]`,
        },
      });

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
          SKU
        );

        const createdOfferId = await createOffer(transformedOffer);
        console.log(`✨ Created new offer with ID: ${createdOfferId}`);

        // Pobierz świeżo utworzoną ofertę z bazy danych
        existingOffer = await getOfferFromDBBySignature(signature);
      }
    }
  }
};

const syncAL2Offers = async (offers: AllegroOfferFromListing[]) => {
  console.log(`🚀 AL2: Starting synchronization of ${offers.length} offers`);

  // Grupuj oferty po signature
  const offersBySignature = new Map<string, AllegroOfferFromListing[]>();

  for (const offer of offers) {
    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const { signature } = parseExternalId(cleanedExternalId);

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
      for (let i = 0; i < groupedOffers.length; i++) {
        const offer = groupedOffers[i];
        const size = extractSizeFromTitle(offer.name) as string;

        console.log(
          `📦 AL2: Processing size ${i + 1}/${
            groupedOffers.length
          }: ${size} for ${signature}`
        );

        try {
          // Aktualizuj external.id na Allegro dla AL2
          await editAllegroOffer(offer.id, "AL2", {
            external: {
              id: `${signature} [${existingOffer.SKU}r${size}]`,
            },
          });

          // Aktualizuj istniejącą ofertę z nowym rozmiarem dla AL2
          await updateOfferInDB(
            existingOffer,
            {
              size,
              allegroId: offer.id,
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

export const syncAllegroOffers = async () => {
  console.log(`🚀 Starting Allegro offers synchronization...`);

  try {
    console.log(`📥 Fetching AL1 offers...`);
    const AL1Offers = await getAllAllegroOffers("AL1");
    console.log(`✅ Found ${AL1Offers.length} AL1 offers`);

    console.log(`📥 Fetching AL2 offers...`);
    const AL2Offers = await getAllAllegroOffers("AL2");
    console.log(`✅ Found ${AL2Offers.length} AL2 offers`);

    console.log(`🔄 Starting AL1 synchronization...`);
    await syncAL1Offers(AL1Offers);
    console.log(`✅ AL1 synchronization completed`);

    console.log(`🔄 Starting AL2 synchronization...`);
    await syncAL2Offers(AL2Offers);
    console.log(`✅ AL2 synchronization completed`);

    console.log(`🎉 All synchronization completed successfully!`);
  } catch (error) {
    console.error(`❌ Synchronization failed:`, error);
    throw error;
  }
};
