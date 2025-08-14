"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../auth/auth";
import { PostOfferBody } from "@/app/api/allegro/offers/route";
import { PostOfferFormValues } from "@/components/adminPanel/offers/PostOfferForm";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { AllegroSalesChannel } from "@/lib/constants";
import { editAllegroOffer } from "../allegro/offers";

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

  await offerRef.set({ ...newOffer, id: offerRef.id });

  return offerRef.id;
};

export const updateOffer = async function (
  id: string,
  updateData: Partial<Offer>
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OfferSchema.partial().parse(updateData);
  const offerRef = adminDB.collection("offers").doc(id);
  const productDoc = await offerRef.get();
  if (!productDoc.exists) {
    throw new Error("Oferta nie istnieje.");
  }

  await offerRef.update(updateData);
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
    productData.categoryId as string
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
  salesChannel: AllegroSalesChannel,
  eventType: "order" | "return"
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  // Określ przeciwny kanał Allegro
  const otherChannel: AllegroSalesChannel =
    salesChannel === "AL1" ? "AL2" : "AL1";

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

      // Zaktualizuj dostępność na przeciwnym kanale Allegro
      const otherChannelOfferId =
        offer.allegroOffersIds?.[otherChannel]?.[size];

      if (otherChannelOfferId) {
        try {
          const updateOfferData = {
            stock: {
              available: newAvailability,
              unit: "PAIR" as const,
            },
            publication: {
              status: newAvailability > 0 ? "ACTIVE" : "INACTIVE",
            },
          };

          await editAllegroOffer(
            otherChannelOfferId,
            otherChannel,
            updateOfferData
          );
          if (eventType === "return" && mainChannelOfferId) {
            await editAllegroOffer(
              mainChannelOfferId,
              salesChannel,
              updateOfferData
            );
          }
        } catch (error) {
          console.error(
            `Błąd podczas aktualizacji oferty Allegro ${otherChannelOfferId} na kanale ${otherChannel}:`,
            error
          );
          // Nie przerywamy wykonywania funkcji, tylko logujemy błąd
        }
      } else {
        console.warn(
          `Brak ID oferty Allegro dla SKU: ${SKU}, rozmiar: ${size}, kanał: ${otherChannel}`
        );
      }
    } catch (error) {
      console.error(`Błąd podczas przetwarzania produktu ${SKU}:`, error);
      // Kontynuuj przetwarzanie pozostałych produktów
    }
  }
};
