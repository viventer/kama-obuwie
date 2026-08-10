"use server";

import { revalidatePath } from "next/cache";
import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../auth/auth";
import { PostOfferBody } from "@/app/api/allegro/offers/route";
import { PostOfferFormValues } from "@/components/adminPanel/offers/forms/PostOfferForm";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { AllegroSalesChannel, SalesChannel } from "@/lib/constants";
import { editAllegroOffer } from "../allegro/offers";
import { changeIndividualSizeMerchantCenterAvailability } from "../merchantCenter/manageProducts";
import {
  appendPriceHistoryForChangedChannels,
  buildInitialPriceHistory,
} from "@/helpers/prices";
import { invalidateSearchIndexCache } from "@/lib/search/indexCache";

export const createOffer = async function (newOffer: Partial<Offer>) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OfferSchema.partial().parse(newOffer);

  if (newOffer?.SKU) {
    const existingOfferQuery = await adminDB
      .collection("offers")
      .where("SKU", "==", newOffer.SKU)
      .limit(1)
      .get();

    if (!existingOfferQuery.empty) {
      return existingOfferQuery.docs[0].id;
    }
  }

  const offerRef = adminDB.collection("offers").doc();
  const offerToSave: Partial<Offer> = {
    ...newOffer,
    id: offerRef.id,
  };

  if (newOffer.sellingPrices && !newOffer.priceHistory) {
    offerToSave.priceHistory = buildInitialPriceHistory(newOffer.sellingPrices);
  }

  await offerRef.set(offerToSave);
  await invalidateSearchIndexCache();

  return offerRef.id;
};

export const updateOffer = async function (
  id: string,
  updateData: Partial<Offer>,
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OfferSchema.partial().parse(updateData);
  const offerRef = adminDB.collection("offers").doc(id);
  const offerDoc = await offerRef.get();
  if (!offerDoc.exists) {
    throw new Error("Oferta nie istnieje.");
  }

  const currentOffer = offerDoc.data() as Offer | undefined;
  const dataToUpdate: Partial<Offer> = { ...updateData };

  if (currentOffer && updateData.sellingPrices) {
    const nextPriceHistory = appendPriceHistoryForChangedChannels(
      currentOffer,
      updateData.sellingPrices,
    );
    if (nextPriceHistory) {
      dataToUpdate.priceHistory = nextPriceHistory;
    }
  }

  await offerRef.update(dataToUpdate);
  await invalidateSearchIndexCache();

  const productId =
    typeof currentOffer?.productId === "string" && currentOffer.productId.trim()
      ? currentOffer.productId
      : null;

  if (productId) {
    revalidatePath(`/product/${productId}`);
  } else {
    // Legacy: strona produktu jest pod ID oferty
    revalidatePath(`/product/${id}`);
  }
};

export const getPostOfferBody = async ({
  formDataWithoutTitlesAndEAN,
  productData,
  oldOfferData,
  sizingTable,
}: {
  formDataWithoutTitlesAndEAN: Omit<PostOfferFormValues, "title" | "EAN">;
  productData: ProductWithId;
  oldOfferData: OfferWithId;
  sizingTable: SizingTableWithId;
}): Promise<Omit<PostOfferBody, "colorVariant" | "images" | "SKU">> => {
  const { data: category } = await getDocumentFromAdminDB<CategoryWithId>(
    "categories",
    productData.categoryId as string,
  );

  const allegroCategoryId = category?.allegroCategoryId as string;

  return {
    offer: {
      ...oldOfferData,
      ...formDataWithoutTitlesAndEAN,
    },
    product: productData,
    allegroCategoryId,
    sizingTable,
  };
};

export const syncOffersAvailability = async function (
  orderItems: Order["lineItems"],
  salesChannel: SalesChannel,
  eventType: "order" | "return",
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  // Określ przeciwny kanał Allegro
  const otherChannels: AllegroSalesChannel[] =
    salesChannel === "AL1"
      ? ["AL2"]
      : salesChannel === "AL2"
        ? ["AL1"]
        : ["AL1", "AL2"];

  for (const item of orderItems) {
    const { SKU, size, allegroId: mainChannelOfferId } = item.offer;

    if (!SKU || !size) {
      console.warn(`Brak SKU lub rozmiaru dla produktu ${item.offer.id}`);
      continue;
    }

    try {
      // Pobierz ofertę z bazy danych na podstawie SKU
      const offersQuery = await adminDB
        .collection("offers")
        .where("SKU", "==", SKU)
        .limit(1)
        .get();

      if (offersQuery.empty) {
        console.warn(`Nie znaleziono oferty dla SKU: ${SKU}`);
        continue;
      }

      const offerDoc = offersQuery.docs[0];
      const offer = offerDoc.data() as Offer;
      const offerId = offerDoc.id;

      // Sprawdź czy rozmiar istnieje w dostępności
      if (!offer.availability?.[size]) {
        console.warn(`Rozmiar ${size} nie istnieje w ofercie ${SKU}`);
        continue;
      }

      const currentAvailability = parseInt(offer.availability[size].value);
      const newAvailability =
        eventType === "order"
          ? Math.max(0, currentAvailability - Number(item.quantity))
          : currentAvailability + Number(item.quantity);

      // Zaktualizuj dostępność w bazie danych
      await adminDB
        .collection("offers")
        .doc(offerId)
        .update({
          [`availability.${size}.value`]: newAvailability.toString(),
        });

      const productId =
        typeof offer.productId === "string" && offer.productId.trim()
          ? offer.productId
          : null;

      if (productId) {
        revalidatePath(`/product/${productId}`);
      } else {
        revalidatePath(`/product/${offerId}`);
      }

      // Zaktualizuj dostępność w Google Merchant Center
      if (
        offer?.isAddedToMerchantCenter &&
        offer.SKU &&
        process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ) {
        const isAvailable = newAvailability > 0 ? true : false;
        try {
          await changeIndividualSizeMerchantCenterAvailability(
            offer.SKU,
            size,
            isAvailable,
          );
        } catch (err) {
          console.error(
            `Błąd podczas aktualizacji dostępności w Google Merchant Center dla SKU: ${offer.SKU}, rozmiar: ${size}:`,
            err,
          );
        }
      }

      // Zaktualizuj dostępność na wszystkich przeciwnych kanałach Allegro
      const updateOfferData = {
        stock: {
          available: newAvailability,
          unit: "PAIR" as const,
        },
        publication: {
          status: newAvailability > 0 ? "ACTIVE" : "ENDED",
        },
      };

      for (const channel of otherChannels) {
        const channelOfferId = offer.allegroOffersIds?.[channel]?.[size];

        if (channelOfferId) {
          try {
            await editAllegroOffer(channelOfferId, channel, updateOfferData);
          } catch (error) {
            console.error(
              `Błąd podczas aktualizacji oferty Allegro ${channelOfferId} na kanale ${channel}:`,
              error,
            );
            // Nie przerywamy wykonywania funkcji, tylko logujemy błąd
          }
        } else {
          console.warn(
            `Brak ID oferty Allegro dla SKU: ${SKU}, rozmiar: ${size}, kanał: ${channel}`,
          );
        }
      }

      // W przypadku zwrotu, zaktualizuj również główny kanał (tylko jeśli to kanał Allegro)
      if (
        eventType === "return" &&
        mainChannelOfferId &&
        (salesChannel === "AL1" || salesChannel === "AL2")
      ) {
        try {
          await editAllegroOffer(
            mainChannelOfferId,
            salesChannel,
            updateOfferData,
          );
        } catch (error) {
          console.error(
            `Błąd podczas aktualizacji oferty Allegro ${mainChannelOfferId} na głównym kanale ${salesChannel}:`,
            error,
          );
        }
      }
    } catch (error) {
      console.error(`Błąd podczas przetwarzania produktu ${SKU}:`, error);
    }
  }
};
