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
import { cleanOldExternalId } from "@/helpers/externalId";

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

  return {
    title: cleanedTitle,
    productId: productId || null,
    thumbnail: offer.primaryImage.url,
    signature: cleanedExternalId || "",
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

const getOfferFromDBByExternalId = async (
  cleanedExternalId: string
): Promise<Offer | null> => {
  const existingOfferQuery = await adminDB
    .collection("offers")
    .where("signature", "==", cleanedExternalId)
    .limit(1)
    .get();

  if (existingOfferQuery.empty) {
    return null;
  }

  const existingOffer = existingOfferQuery.docs[0];
  return existingOffer.data() as Offer;
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
  offers.forEach(async (offer) => {
    const SKU = await generateUniqueSKU();
    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const size = extractSizeFromTitle(offer.name) as string;

    await editAllegroOffer(offer.id, "AL1", {
      external: {
        id: `${cleanedExternalId} [${SKU}r${size}]`,
      },
    });

    const existingOffer = await getOfferFromDBByExternalId(cleanedExternalId);
    if (existingOffer?.id) {
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
    } else {
      const transformedOffer = await transformAllegroAL1OfferToOffer(
        offer,
        SKU
      );

      await createOffer(transformedOffer);
    }
  });
};

const syncAL2Offers = async (offers: AllegroOfferFromListing[]) => {
  offers.forEach(async (offer) => {
    const cleanedExternalId = cleanOldExternalId(offer.external.id);
    const size = extractSizeFromTitle(offer.name) as string;

    const existingOffer = await getOfferFromDBByExternalId(cleanedExternalId);
    if (existingOffer?.id) {
      await updateOfferInDB(
        existingOffer,
        {
          size,
          allegroId: offer.id,
        },
        "AL2"
      );
    }
  });
};

export const syncAllegroOffers = async () => {
  const AL1Offers = await getAllAllegroOffers("AL1");
  const AL2Offers = await getAllAllegroOffers("AL2");

  await syncAL1Offers(AL1Offers);
  await syncAL2Offers(AL2Offers);
};
