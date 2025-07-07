import { getAllegroWarranties } from "@/server-actions/allegro/afterSalesServices";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroWarranties();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono warunków gwarancji.", 204);
  }

  return apiResponse("Warunki gwarancji zostały pobrane.", 200, data);
}
