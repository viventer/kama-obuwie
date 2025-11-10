import { getAllegroReturns } from "@/server-actions/allegro/returns";
import { apiResponse } from "@/server-actions/errorHandlers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const allegroOrderId = searchParams.get("allegroOrderId");

  const data = await getAllegroReturns(allegroOrderId);
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono zwrotów.", 204);
  }

  return apiResponse("Zwroty zostały pobrane.", 200, data);
}
