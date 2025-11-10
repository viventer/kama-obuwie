import { AllegroRefund } from "@/firebase/schemas/ordersSchemas";
import { createAllegroRefund } from "@/server-actions/allegro/refunds";
import { apiResponse } from "@/server-actions/errorHandlers";
import { NextRequest } from "next/server";

export type AllegroRefundCreateData = {
  refund: AllegroRefund;
  account: "AL1" | "AL2";
};

export async function POST(request: NextRequest) {
  const data: AllegroRefundCreateData = await request.json();

  await createAllegroRefund(data.refund, data.account);
  return apiResponse("Wpłata została zwrócona.", 201);
}
