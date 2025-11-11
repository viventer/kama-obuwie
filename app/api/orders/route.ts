import {
  FrontendOrder,
  FrontendOrderSchema,
  Order,
} from "@/firebase/schemas/ordersSchemas";
import { apiResponse } from "@/server-actions/errorHandlers";
import {
  createOrder,
  transformFrontendOrderToOrder,
} from "@/server-actions/orders/orders";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body: FrontendOrder = await request.json();
  try {
    FrontendOrderSchema.parse(body);
  } catch (error) {
    return apiResponse("Nieprawidłowe dane zamówienia.", 400);
  }

  try {
    const order: Order = await transformFrontendOrderToOrder(body);
    const id = await createOrder(order);
    return apiResponse("Zamówienie zostało utworzone.", 201, { id });
  } catch (error) {
    return apiResponse("Błąd podczas przetwarzania zamówienia.", 500);
  }
}
