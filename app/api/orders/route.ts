import {
  FrontendOrder,
  FrontendOrderSchema,
  Order,
  OrderSchema,
} from "@/firebase/schemas/ordersSchemas";
import { apiResponse } from "@/server-actions/errorHandlers";
import { createOrder } from "@/server-actions/orders/orders";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body: FrontendOrder = await request.json();
  try {
    FrontendOrderSchema.parse(body);
  } catch (error) {
    return apiResponse("Nieprawidłowe dane zamówienia.", 400);
  }

  const order: Order = transformFrontendOrderToOrder(body);

  const id = await createOrder(body);
  return apiResponse("Zamówienie zostało utworzone.", 201, { id });
}
