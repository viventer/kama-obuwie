"use server";

import axios from "axios";
import { getAllegroUserAccessToken, getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders, getSingleAllegroHeaders } from "./global";
import { redis } from "@/upstash/redis";
import { AllegroOrder } from "@/firebase/schemas/ordersSchemas";
import { createOrder, updateOrder } from "@/server-actions/orders/orders";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { Offer } from "@/firebase/schemas/offersSchemas";
import { AllegroSalesChannel } from "@/lib/constants";
import { getAllegroOffer } from "./offers";
import { handleAllegroApiError } from "../errorHandlers";
import { parseExternalId } from "@/helpers/externalId";
import { generateOrderNumber } from "../helpers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type lastEventId = {
  AL1?: string;
  AL2?: string;
};

export async function updateAllegroOrderStatus(
  orderId: string,
  status: string,
  account: "AL1" | "AL2"
): Promise<void> {
  const accessToken = await getAllegroUserAccessToken(account);
  const headers = getSingleAllegroHeaders(accessToken);

  const url = `${ALLEGRO_API_BASE_URL}/order/checkout-forms/${orderId}/fulfillment`;

  await axios.put(url, { status }, { headers });
}

export async function getAllegroOrderEvents() {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/order/events?type=READY_FOR_PROCESSING&type=BUYER_CANCELLED&type=AUTO_CANCELLED&limit=500`;
  let urlAL1 = url;
  let urlAL2 = url;
  const lastEventId: lastEventId | null = await redis.hgetall(
    "allegro:lastEventId"
  );
  if (lastEventId?.AL1) {
    urlAL1 += `&from=${lastEventId.AL1}`;
  }
  if (lastEventId?.AL2) {
    urlAL2 += `&from=${lastEventId.AL2}`;
  }

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(urlAL1, { headers: headers.AL1 }),
      axios.get(urlAL2, { headers: headers.AL2 }),
    ]);

    const AL1Events = (AL1Response.data.events || [])
      .map((event: any) => ({
        ...event,
        salesChannel: "AL1",
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
      );

    const AL2Events = (AL2Response.data.events || [])
      .map((event: any) => ({
        ...event,
        salesChannel: "AL2",
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
      );

    // Aktualizuj lastEventId tylko jeśli mamy eventy i są prawidłowe
    if (AL1Events.length > 0 && AL1Events[AL1Events.length - 1].id) {
      await redis.hset("allegro:lastEventId", {
        AL1: AL1Events[AL1Events.length - 1].id,
      });
      console.log(
        `Updated AL1 lastEventId to: ${AL1Events[AL1Events.length - 1].id}`
      );
    }
    if (AL2Events.length > 0 && AL2Events[AL2Events.length - 1].id) {
      await redis.hset("allegro:lastEventId", {
        AL2: AL2Events[AL2Events.length - 1].id,
      });
      console.log(
        `Updated AL2 lastEventId to: ${AL2Events[AL2Events.length - 1].id}`
      );
    }

    return {
      AL1: AL1Events,
      AL2: AL2Events,
    };
  } catch (error) {
    console.error("Error fetching Allegro order events:", error);
    handleAllegroApiError(error, "Błąd podczas pobierania zdarzeń z Allegro");
    // Zwróć pustą strukturę w przypadku błędu, aby nie przerywać synchronizacji
    return {
      AL1: [],
      AL2: [],
    };
  }
}

export async function getAllegroOrderDetails(
  checkoutFormId: string,
  account: "AL1" | "AL2"
): Promise<AllegroOrder | undefined> {
  const accessToken = await getAllegroUserAccessToken(account);
  const headers = getSingleAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/order/checkout-forms/${checkoutFormId}`;

  try {
    const response = await axios.get(url, { headers: headers });
    return response.data;
  } catch (err) {
    handleAllegroApiError(
      err,
      "Błąd podczas pobierania szczegółów zamówienia z Allegro"
    );
  }
}

export async function syncAllegroOrders() {
  try {
    // 1. Pobierz nowe zdarzenia
    const events = await getAllegroOrderEvents();
    if (!events) return;

    const allEvents = [...(events.AL1 || []), ...(events.AL2 || [])];

    // 2. Wyciągnij unikalne checkoutFormId z eventów
    const checkoutFormIds = Array.from(
      new Set(
        allEvents.map((event) => event.order?.checkoutForm?.id).filter(Boolean)
      )
    );

    if (checkoutFormIds.length === 0) return;

    // 3. Sprawdź jednym zapytaniem które zamówienia już istnieją w Firestore
    const existingOrders = await getExistingOrdersByAllegroIds(checkoutFormIds);
    const existingAllegroIds = new Set(
      existingOrders?.map((order) => order.allegroId).filter(Boolean) || []
    );

    // 4. Podziel na nowe i istniejące
    const newEvents = allEvents.filter(
      (event) =>
        event.order?.checkoutForm?.id &&
        !existingAllegroIds.has(event.order.checkoutForm.id)
    );
    const existingEvents = allEvents.filter(
      (event) =>
        event.order?.checkoutForm?.id &&
        existingAllegroIds.has(event.order.checkoutForm.id)
    );

    if (!existingOrders) {
      console.warn(
        "No existing orders found, all events will be processed as new."
      );
      await processNewOrders(newEvents);
      return;
    }

    await Promise.all([
      processNewOrders(newEvents),
      processExistingOrders(existingEvents, existingOrders!),
    ]);

    console.log(
      `Processed ${newEvents.length} new orders and ${existingEvents.length} existing orders`
    );
  } catch (error) {
    console.error("Error syncing Allegro orders:", error);
    throw error;
  }
}

async function getExistingOrdersByAllegroIds(
  allegroIds: string[]
): Promise<Order[] | null> {
  // Firestore ma limit 10 elementów w zapytaniu "in", więc dzielimy na batche
  const batches = [];
  for (let i = 0; i < allegroIds.length; i += 10) {
    const batch = allegroIds.slice(i, i + 10);
    batches.push(
      getDocumentsFromAdminDB<Order>("orders", (colRef) => {
        return colRef.where("allegroId", "in", batch);
      })
    );
  }

  const results = await Promise.all(batches);
  const flatResults = results.reduce<Order[]>((acc, batch) => {
    if (batch) {
      acc.push(...batch);
    }
    return acc;
  }, []);

  return flatResults.length > 0 ? flatResults : null;
}

async function processNewOrders(events: any[]) {
  const promises = events.map((event) =>
    createNewOrder(event.order.checkoutForm.id, event.salesChannel)
  );

  // Wykonaj równolegle, ale ogranicz liczbę jednoczesnych requestów do API
  await executeInBatches(promises, 5);
}

async function processExistingOrders(events: any[], existingOrders: Order[]) {
  const orderMap = new Map(
    existingOrders.map((order) => [order.allegroId, order])
  );

  const promises = events
    .map((event) => {
      const checkoutFormId = event.order.checkoutForm.id;
      const existingOrder = orderMap.get(checkoutFormId);
      if (existingOrder?.id) {
        return updateExistingOrder(
          checkoutFormId,
          existingOrder.id,
          event.salesChannel,
          existingOrder
        );
      }
      return Promise.resolve();
    })
    .filter(Boolean);

  await executeInBatches(promises, 5);
}

async function createNewOrder(
  checkoutFormId: string,
  salesChannel: "AL1" | "AL2"
) {
  try {
    const allegroOrderData = await getAllegroOrderDetails(
      checkoutFormId,
      salesChannel
    );
    if (!allegroOrderData) {
      console.warn(`No Allegro order data found for ${checkoutFormId}`);
      return;
    }

    // Przekształć dane z Allegro na format Order
    const orderData = await transformAllegroToOrder(
      allegroOrderData,
      salesChannel
    );

    await createOrder(orderData);
    console.log(`Created new order for checkoutFormId: ${checkoutFormId}`);
  } catch (error) {
    console.error(`Error creating order for ${checkoutFormId}:`, error);
    // Nie przerywaj przetwarzania innych zamówień
  }
}

async function updateExistingOrder(
  checkoutFormId: string,
  orderId: string,
  salesChannel: "AL1" | "AL2",
  existingOrder: Order
) {
  try {
    const allegroOrderData = await getAllegroOrderDetails(
      checkoutFormId,
      salesChannel
    );
    if (!allegroOrderData) return;

    // Przekształć dane z Allegro na format aktualizacji Order
    const updateData = transformAllegroToOrderUpdate(
      allegroOrderData,
      existingOrder
    );

    await updateOrder(orderId, updateData);
    console.log(
      `Updated order ${orderId} for checkoutFormId: ${checkoutFormId}`
    );
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
  }
}

async function executeInBatches<T>(
  promises: Promise<T>[],
  batchSize: number
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  return results;
}

async function transformAllegroToOrder(
  allegroOrder: AllegroOrder,
  salesChannel: "AL1" | "AL2"
): Promise<Order> {
  // Pobierz wszystkie oferty równolegle
  const lineItemsPromises = allegroOrder.lineItems.map(async (item) => {
    const allegroOffer = await getAllegroOffer(item.offer.id, salesChannel);
    if (
      !allegroOffer ||
      !allegroOffer.images ||
      allegroOffer.images.length === 0
    ) {
      throw new Error(`Offer not found for ID: ${item.offer.id}`);
    }
    const offerThumbnail = allegroOffer?.images[0];
    const { signature, size, SKU } = parseExternalId(
      item.offer.external?.id || ""
    );
    const offerResp = await getDocumentsFromAdminDB<Offer>("offers", (ref) =>
      ref.where("SKU", "==", SKU)
    );
    if (!offerResp) {
      console.log(`Offer not found for SKU: ${SKU}`);
    }
    const offer = offerResp?.[0];

    return {
      id: item.id,
      offer: {
        thumbnail: offerThumbnail,
        id: offer?.id || null,
        signature,
        name: item.offer.name,
        allegroId: item.offer.id,
        SKU: SKU || null,
        size: size || null,
      },
      quantity: item.quantity,
      originalPrice: item.originalPrice,
      price: item.price,
      reconcilation: item.reconcilation || null,
      discount: item.discount || null,
    };
  });

  const lineItems = await Promise.all(lineItemsPromises);

  return {
    allegroId: allegroOrder.id,
    messageToSeller: {
      content: allegroOrder.messageToSeller,
      isRead: false,
    },
    buyer: allegroOrder.buyer,
    allegroPayment: allegroOrder.payment,
    paymentType:
      allegroOrder?.payment?.type === "CASH_ON_DELIVERY"
        ? "COD"
        : "ALLEGRO_ONLINE",
    allegroStatus: allegroOrder.status,
    fulfillment: allegroOrder.fulfillment,
    delivery: allegroOrder.delivery,
    invoice: allegroOrder.invoice?.required
      ? {
          ...allegroOrder.invoice,
          isAdded: false,
          sendingMethod: "inBox",
        }
      : null,
    lineItems: lineItems,
    allegroSurcharges: allegroOrder.surcharges,
    summary: allegroOrder.summary,
    createdAt: allegroOrder.updatedAt || new Date().toISOString(),
    updatedAt: allegroOrder.updatedAt,
    salesChannel: salesChannel,
    number: generateOrderNumber(salesChannel),
  };
}

function transformAllegroToOrderUpdate(
  allegroOrder: AllegroOrder,
  existingOrder: Order
): Partial<Order> {
  return {
    messageToSeller: {
      content: allegroOrder.messageToSeller,
      isRead: existingOrder.messageToSeller?.isRead || false,
    },
    allegroPayment: allegroOrder.payment,
    allegroStatus: allegroOrder.status,
    fulfillment: {
      status:
        allegroOrder.status === "CANCELLED"
          ? "CANCELLED"
          : existingOrder.fulfillment?.status || "NEW",
    },
    delivery: allegroOrder.delivery,
    invoice: allegroOrder.invoice?.required
      ? {
          ...allegroOrder.invoice,
          isAdded: existingOrder.invoice?.isAdded || false,
          sendingMethod: existingOrder.invoice?.sendingMethod || "inBox",
        }
      : null,
    lineItems: allegroOrder.lineItems.map((item) => {
      const existingLineItem = existingOrder.lineItems.find(
        (existingItem) => existingItem.id === item.id
      );
      const { signature } = parseExternalId(item.offer.external?.id || "");

      return {
        id: item.id,
        offer: {
          thumbnail: existingLineItem?.offer?.thumbnail || "", // Zachowaj istniejącą miniaturkę
          id: existingLineItem?.offer?.id || "",
          SKU: existingLineItem?.offer?.SKU || null,
          size: existingLineItem?.offer?.size || null,
          signature,
          name: item.offer.name,
          allegroId: item.offer.id,
        },
        quantity: item.quantity,
        originalPrice: item.originalPrice,
        price: item.price,
        reconcilation: item.reconcilation || null,
        discount: item.discount || null,
      };
    }),
    allegroSurcharges: allegroOrder.surcharges,
    summary: allegroOrder.summary,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Znajduje ID oferty z naszej bazy danych na podstawie ID oferty Allegro
 * @param allegroOfferId - ID oferty w systemie Allegro
 * @param salesChannel - Kanał sprzedaży Allegro (AL1 lub AL2)
 * @returns ID oferty z naszej bazy danych lub null jeśli nie znaleziono
 */
export async function getOfferIdByAllegroId(
  allegroOfferId: string,
  salesChannel: AllegroSalesChannel
): Promise<string | null> {
  try {
    // Pobierz wszystkie oferty z bazy danych
    const offers = await getDocumentsFromAdminDB<Offer>("offers");

    if (!offers) {
      return null;
    }

    // Przeszukaj oferty w poszukiwaniu odpowiedniego allegroOffersIds
    for (const offer of offers) {
      const allegroOffersIds = offer.allegroOffersIds;

      if (allegroOffersIds && allegroOffersIds[salesChannel]) {
        // Sprawdź czy w mapie rozmiarów znajduje się szukane ID oferty Allegro
        const sizeToOfferMap = allegroOffersIds[salesChannel];

        for (const [size, offerId] of Object.entries(sizeToOfferMap)) {
          if (offerId === allegroOfferId) {
            return offer.id;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error(
      `Błąd podczas wyszukiwania oferty dla allegroOfferId: ${allegroOfferId}, salesChannel: ${salesChannel}`,
      error
    );
    return null;
  }
}
