import { getAllegroResponsibleProducers } from "@/server-actions/allegro/responsibleProducers";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroResponsibleProducers();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono producentów odpowiedzialnych.", 204);
  }

  return apiResponse("Producenci odpowiedzialni zostali pobrani.", 200, data);
}
