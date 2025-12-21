import { TransactionNotificationData } from "@/firebase/schemas/p24Schemas";
import { NextRequest, NextResponse } from "next/server";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order, OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { verifyTransaction } from "@/server-actions/p24";
import { updateOrder } from "@/server-actions/orders/orders";

export async function POST(request: NextRequest) {
  console.log("P24 status GET received");
  try {
    const notification: TransactionNotificationData = await request.json();

    if (
      !notification.sessionId ||
      !notification.amount ||
      !notification.orderId
    ) {
      return new NextResponse(null, { status: 400 });
    }

    const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
      ref
        .where("P24SessionIds", "array-contains", notification.sessionId)
        .limit(1)
    );

    console.log("Found orders for P24 notification:", orders);

    if (!orders || orders.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    const order = orders[0] as OrderWithId;
    const transaction = order.P24Transactions?.find(
      (transaction) => transaction.sessionId === notification.sessionId
    );

    if (!transaction) {
      return new NextResponse(null, { status: 400 });
    }

    if (transaction.status === "COMPLETED" || transaction.status === "FAILED") {
      return new NextResponse(null, { status: 200 });
    }

    if (transaction?.amount !== notification.amount) {
      return new NextResponse(null, { status: 400 });
    }

    const isRedundant = order.P24Transactions?.some(
      (t) => t.status === "COMPLETED"
    );

    try {
      const verificationResult = await verifyTransaction({
        sessionId: notification.sessionId,
        amount: notification.amount,
        orderId: notification.orderId,
      });

      if (verificationResult.status === "success") {
        const updateData: Partial<Order> = {
          P24Transactions: order.P24Transactions!.map((t) =>
            t.sessionId === notification.sessionId
              ? { ...t, status: "COMPLETED", isRedundant }
              : t
          ),
          updatedAt: new Date().toISOString(),
        };

        if (!isRedundant) {
          updateData.fulfillment = {
            status: "NEW",
          };
        }

        await updateOrder(order.id, updateData);
      } else {
        await updateOrder(order.id, {
          P24Transactions: order.P24Transactions!.map((t) =>
            t.sessionId === notification.sessionId
              ? { ...t, status: "FAILED", isRedundant }
              : t
          ),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (verificationError) {
      await updateOrder(order.id, {
        P24Transactions: order.P24Transactions!.map((t) =>
          t.sessionId === notification.sessionId
            ? { ...t, status: "FAILED", isRedundant }
            : t
        ),
        updatedAt: new Date().toISOString(),
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("P24 notification handler error:", error);
    return new NextResponse(null, { status: 200 });
  }
}
