import {
  Order,
  OrderWithId,
  P24Transaction,
} from "@/firebase/schemas/ordersSchemas";
import { RegisterTransactionData } from "@/firebase/schemas/p24Schemas";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { updateOrder } from "@/server-actions/orders/orders";
import { registerTransaction } from "@/server-actions/p24";
import { NextRequest } from "next/server";
import { getDocumentFromAdminDB } from "@/firebase/getters";

export async function POST(request: NextRequest) {
  const {
    transactionData,
    orderId,
  }: {
    transactionData: Pick<
      RegisterTransactionData,
      "amount" | "email" | "channel"
    >;
    orderId: string;
  } = await request.json();

  let order: OrderWithId | null = null;

  try {
    const { data } = await getDocumentFromAdminDB<OrderWithId>(
      "orders",
      orderId
    );
    order = data;
    if (!order) {
      throw new Error("Zamówienie nie istnieje");
    }
  } catch (err) {
    return apiErrorResponse("Zamówienie o podanym id nie istnieje", 400, null, {
      step: "get_order",
    });
  }

  let p24Response: {
    sessionId: string;
    token: string;
  } | null = null;
  try {
    p24Response = await registerTransaction(
      transactionData,
      orderId,
      order.number
    );
  } catch (err: any) {
    return apiErrorResponse(
      "Nie udało się zarejestrować transakcji",
      500,
      null,
      {
        step: "transaction_registration",
      }
    );
  }

  try {
    const newTransaction: P24Transaction = {
      sessionId: p24Response.sessionId,
      amount: transactionData.amount,
      status: "INITIATED",
    };

    const updatedTransactions = [
      ...(order.P24Transactions || []),
      newTransaction,
    ];

    const updatedSessionIds = [
      ...(order.P24SessionIds || []),
      p24Response.sessionId,
    ];

    await updateOrder(orderId, {
      P24Transactions: updatedTransactions,
      P24SessionIds: updatedSessionIds,
    });
  } catch (err) {
    return apiErrorResponse(
      "Nie udało się zaktualizować zamówienia o dane transakcji",
      500,
      null,
      {
        step: "order_update",
      }
    );
  }

  return apiResponse("Transakcja zarejestrowana pomyślnie.", 200, {
    url: `${process.env.NEXT_PUBLIC_P24_BASE_URL}/trnRequest/${p24Response.token}`,
  });
}
