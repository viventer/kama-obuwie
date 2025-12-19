import { TransactionNotificationData } from "@/firebase/schemas/p24Schemas";
import { NextRequest, NextResponse } from "next/server";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order, OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { verifyTransaction } from "@/server-actions/p24";
import { adminDB } from "@/firebase/firebaseAdmin";

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
        .where("P24Transaction.sessionId", "==", notification.sessionId)
        .limit(1)
    );

    if (!orders || orders.length === 0) {
      return new NextResponse(null, { status: 200 });
    }

    const order = orders[0] as OrderWithId;

    if (order.P24Transaction?.amount !== notification.amount) {
      return new NextResponse(null, { status: 200 });
    }

    try {
      const verificationResult = await verifyTransaction({
        sessionId: notification.sessionId,
        amount: notification.amount,
        orderId: notification.orderId,
      });

      const orderRef = adminDB.collection("orders").doc(order.id);

      if (verificationResult.status === "success") {
        await orderRef.update({
          "P24Transaction.status": "COMPLETED",
          "P24Transaction.orderId": notification.orderId,
          "fulfillment.status": "NEW",
          updatedAt: new Date().toISOString(),
        });
      } else {
        await orderRef.update({
          "P24Transaction.status": "FAILED",
          "P24Transaction.orderId": notification.orderId,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (verificationError) {
      const orderRef = adminDB.collection("orders").doc(order.id);

      await orderRef.update({
        "P24Transaction.status": "FAILED",
        "P24Transaction.orderId": notification.orderId,
        updatedAt: new Date().toISOString(),
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("P24 notification handler error:", error);
    return new NextResponse(null, { status: 200 });
  }
}
