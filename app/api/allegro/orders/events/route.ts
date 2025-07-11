import {
  getAllegroOrderEvents,
  lastEventId,
} from "@/server-actions/allegro/orders";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lastEventId = searchParams.get("lastEventId") as lastEventId;

  const data = await getAllegroOrderEvents(
    lastEventId ? lastEventId : undefined
  );
  if (!data || !data.AL1 || !data.AL2) {
    return apiResponse("Nie znaleziono zdarzeń zamówień.", 204);
  }

  return apiResponse("Zdarzenia zamówień zostały pobrane.", 200, data);
}
