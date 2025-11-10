import { AllegroOrderStatus } from "@/firebase/schemas/ordersSchemas";
import { updateAllegroOrderStatus } from "@/server-actions/allegro/orders";
import { apiResponse } from "@/server-actions/errorHandlers";
import { NextRequest } from "next/server";

export type AllegroStatusUpdateData = {
  status: AllegroOrderStatus;
  account: "AL1" | "AL2";
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const data: AllegroStatusUpdateData = await request.json();

  await updateAllegroOrderStatus(id, data.status, data.account);
  return apiResponse("Status zamówienia został zaaktualizowany.", 201);
}
