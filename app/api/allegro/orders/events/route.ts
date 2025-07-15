import { getAllegroOrderEvents } from "@/server-actions/allegro/orders";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroOrderEvents();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono zdarzeń zamówień.", 204);
  }

  return apiResponse("Zdarzenia zamówień zostały pobrane.", 200, data);
}
