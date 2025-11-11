"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { verifyUser } from "../auth/auth";
import {
  FrontendOrder,
  Order,
  OrderSchema,
} from "@/firebase/schemas/ordersSchemas";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { syncOffersAvailability } from "../offers/offers";
import { generateOrderNumber } from "../helpers";
import { Offer } from "@/firebase/schemas/offersSchemas";
import { randomUUID } from "crypto";
import { PickupPointSchema } from "@/firebase/schemas/commonSchemas";

export const createOrder = async function (newOrder: Order) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OrderSchema.parse(newOrder);

  const orderRef = adminDB.collection("orders").doc();

  await orderRef.set(newOrder);

  await syncOffersAvailability(
    newOrder.lineItems,
    newOrder.salesChannel,
    "order"
  );

  return orderRef.id;
};

export const updateOrder = async function (
  id: string,
  updateData: Partial<Order>
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OrderSchema.partial().parse(updateData);
  const orderRef = adminDB.collection("orders").doc(id);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    throw new Error("Zamówienie nie istnieje.");
  }

  await orderRef.update(updateData);
};

export const getOrders = async function (lastOrderId?: string) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  if (lastOrderId) {
    // Pobierz dokument o podanym ID, aby uzyskać jego createdAt
    const lastOrderDoc = await adminDB
      .collection("orders")
      .doc(lastOrderId)
      .get();
    if (!lastOrderDoc.exists) {
      throw new Error("Zamówienie o podanym ID nie istnieje.");
    }
    const lastOrderData = lastOrderDoc.data();

    // Pobierz zamówienia starsze niż to o podanym ID
    return await getDocumentsFromAdminDB<Order>("orders", (colRef) => {
      return colRef
        .orderBy("createdAt", "desc")
        .startAfter(lastOrderData?.createdAt)
        .limit(60);
    });
  }

  // Pobierz 60 najnowszych zamówień
  return await getDocumentsFromAdminDB<Order>("orders", (colRef) => {
    return colRef.orderBy("createdAt", "desc").limit(60);
  });
};

export const getOrderByAllegroId = async function (allegroId: string) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
    ref.where("allegroId", "==", allegroId).limit(1)
  );

  if (!orders) {
    throw new Error("Zamówienie o podanym ID nie istnieje.");
  }

  return orders[0];
};

export const transformFrontendOrderToOrder = async function (
  frontendOrder: FrontendOrder
): Promise<Order> {
  const checkoutData = frontendOrder.checkoutData;
  const shoppingCartItems = frontendOrder.shoppingCartItems;
  const isCOD = checkoutData.paymentMethod === "COD";
  const isCourier = checkoutData.deliveryMethod === "courier";

  let totalPrice = 0;

  const lineItems: Order["lineItems"] = await Promise.all(
    shoppingCartItems.map(async (item) => {
      const { data } = await getDocumentFromAdminDB<Offer>(
        "offers",
        item.offerId
      );
      if (!data) {
        throw new Error("Oferta nie istnieje.");
      }

      if (!data.SKU) {
        throw new Error("Oferta nie ma przypisanego SKU.");
      }

      if (!data.sellingPrices.DTC) {
        throw new Error("Oferta nie ma przypisanej ceny sprzedaży DTC.");
      }

      totalPrice += parseFloat(data.sellingPrices.DTC) * item.quantity;

      const isValidQuantity =
        Number(data.availability[item.size].value) >= item.quantity;

      if (!isValidQuantity) {
        throw new Error(
          `Niewystarczająca ilość produktu ${data.SKU} w rozmiarze ${item.size}.`
        );
      }

      return {
        id: randomUUID(),
        offer: {
          id: item.offerId,
          thumbnail: item.thumbnailUrl,
          allegroId: null,
          name: `${item.categoryName} ${item.brand ? item.brand : ""}`.trim(),
          signature: data.signature,
          size: item.size,
          SKU: data.SKU,
        },
        quantity: item.quantity,
        price: {
          amount: item.price.toFixed(2),
          currency: "PLN",
        },
        reconcilation: null,
        discount: null,
      };
    })
  );

  if (!isCourier) {
    try {
      PickupPointSchema.parse(checkoutData.pickupPoint);
    } catch (error) {
      throw new Error("Nieprawidłowe dane punktu odbioru.");
    }
  }

  const totalToPay =
    totalPrice >= 55
      ? totalPrice.toFixed(2)
      : (Number(totalPrice) + 9.99).toFixed(2);

  const formattedOrder: Order = {
    number: generateOrderNumber("DTC"),
    messageToSeller: null,
    allegroId: null,
    buyer: {
      email: checkoutData.email,
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      phoneNumber: checkoutData.phoneNumber,
      guest: true,
      preferences: {
        language: "PL",
      },
      companyName: null,
    },
    paymentType: isCOD ? "COD" : "P24",
    fulfillment: {
      status: isCOD ? "NEW" : "UNPAID",
    },
    delivery: {
      address: undefined,
      method: null,
      pickupPoint: checkoutData.pickupPoint || null,
      cost: {
        amount: checkoutData.deliveryCost,
        currency: "PLN",
      },
      smart: null,
      calculatedNumberOfPackages: null,
    },
    invoice: null,
    lineItems: lineItems,
    summary: {
      totalToPay: {
        amount: totalToPay,
        currency: "PLN",
      },
    },
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    salesChannel: "DTC",
  };

  if (isCourier) {
    formattedOrder.delivery!.address = {
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      street: checkoutData.address!.street,
      city: checkoutData.address!.city,
      zipCode: checkoutData.address!.postalCode,
      countryCode: "PL",
      companyName: null,
      phoneNumber: checkoutData.phoneNumber,
    };
  }

  return formattedOrder;
};
