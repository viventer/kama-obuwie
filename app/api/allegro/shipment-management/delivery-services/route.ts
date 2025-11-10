import { getAllegroDeliveryServices } from "@/server-actions/allegro/shipmentManagement";
import { apiResponse } from "@/server-actions/errorHandlers";

export async function GET() {
  const data = await getAllegroDeliveryServices();
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono usług dostaw.", 204);
  }

  return apiResponse("Usługi dostaw zostały pobrane.", 200, data);
}
