import { getAllegroReturnPolicies } from "@/server-actions/allegro/afterSalesServices";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroReturnPolicies();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono warunków zwrotów.", 204);
  }

  return apiResponse("Warunki zwrotów zostały pobrane.", 200, data);
}
