"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { verifyUser } from "../auth/auth";
import {
  FrontendOrder,
  Order,
  OrderSchema,
} from "@/firebase/schemas/ordersSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { syncOffersAvailability } from "../offers/offers";
import { generateOrderNumber } from "../helpers";

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

export const transformFrontendOrderToOrder = function (
  frontendOrder: FrontendOrder
): Order {
  const checkoutData = frontendOrder.checkoutData;
  const shoppingCartItems = frontendOrder.shoppingCartItems;

  return {
    number: generateOrderNumber("DTC"),
    messageToSeller: null,
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
  };
};
