import { EmailOrderData, OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { getShippingInfo } from "./store";

export function transformOrderToEmailOrderData(
  order: OrderWithId
): EmailOrderData {
  return {
    orderDetails: {
      status: order.fulfillment?.status!,
      number: order.number,
      id: order.id,
      createdAt: order.createdAt,
      deliveryDate: getShippingInfo(new Date(order.createdAt), true),
    },
    paymentType: order.paymentType,
    buyer: {
      email: order.buyer.email,
      phoneNumber: order.buyer.phoneNumber as string,
    },
    delivery: {
      method: order.delivery!.method,
      address: order.delivery?.address || null,
      pickupPoint: order.delivery?.pickupPoint || null,
      parcelNumber: order.shipment?.parcelNumbers?.[0] || null,
    },
    orderedItems: order.lineItems,
    totalToPay: order.summary.totalToPay,
    deliveryPrice: {
      amount: order.delivery?.cost?.amount as string,
      currency: order.delivery?.cost?.currency as "PLN",
    },
  };
}
