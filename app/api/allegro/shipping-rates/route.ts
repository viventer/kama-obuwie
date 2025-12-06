import { getAllegroShippingRates } from "@/server-actions/allegro/shippingRates";
import { apiResponse } from "@/server-actions/helpers";

export async function GET() {
  const data = await getAllegroShippingRates();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono cenników dostaw.", 204);
  }

  return apiResponse("Cenniki dostaw zostały pobrane.", 200, data);
}
