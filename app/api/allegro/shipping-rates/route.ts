import { getAllegroShippingRates } from "@/server-actions/allegro/shippingRates";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const data = await getAllegroShippingRates();
  if (!data) {
    return apiResponse("Nie znaleziono kategorii.", 204);
  }

  return apiResponse("Kategorie zostały pobrane.", 200, data);
}
