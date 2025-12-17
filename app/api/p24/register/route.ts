import { RegisterTransactionData } from "@/firebase/schemas/p24Schemas";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { updateOrder } from "@/server-actions/orders/orders";
import { registerTransaction } from "@/server-actions/p24";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const {
    transactionData,
    orderId,
  }: {
    transactionData: Pick<
      RegisterTransactionData,
      "amount" | "email" | "channel" | "regulationAccept"
    >;
    orderId: string;
  } = await request.json();

  let p24Response: {
    sessionId: string;
    token: string;
  } | null = null;
  try {
    p24Response = await registerTransaction(transactionData);
  } catch (err: any) {
    console.log("P24 Registration Error:", err);
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
    await updateOrder(orderId, {
      P24Transaction: {
        sessionId: p24Response.sessionId,
        amount: transactionData.amount,
        status: "INITIATED",
      },
    });
  } catch (err) {
    console.log("Order Update Error:", err);
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
