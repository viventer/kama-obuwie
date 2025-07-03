import { getAllegroImpliedWarranties } from "@/server-actions/allegro/afterSalesServices";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroImpliedWarranties();
  if (!data) {
    return apiResponse("Nie znaleziono warunków reklamacji.", 204);
  }

  return apiResponse("Warunki reklamacji zostały pobrane.", 200, data);
}
