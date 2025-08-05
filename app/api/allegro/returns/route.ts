import { getAllegroReturns } from "@/server-actions/allegro/returns";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroReturns();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono zwrotów.", 204);
  }

  return apiResponse("Zwroty zostały pobrane.", 200, data);
}
