import { NextRequest } from "next/server";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { apiResponse } from "@/server-actions/errorHandlers";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { updateOrder } from "@/server-actions/orders/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data } = await getDocumentFromAdminDB("orders", id);
  if (!data) {
    return apiResponse("Zamówienie nie istnieje.", 404);
  }
  return apiResponse("Pobrano zamówienie.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: Partial<Order> = await request.json();

  await updateOrder(id, body);

  return apiResponse("Zamówienie zostało zaaktualizowane.", 200);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, ref } = await getDocumentFromAdminDB("orders", id);
  if (!data) {
    return apiResponse("Zamówienie nie istnieje.", 404);
  }

  await ref.delete();
  return apiResponse("Zamówienie zostało usunięte.", 200);
}
