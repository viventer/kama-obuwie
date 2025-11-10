import { getAllegroOrderEvents } from "@/server-actions/allegro/orders";
import { apiResponse, apiErrorResponse } from "@/server-actions/errorHandlers";

export async function GET() {
  try {
    const data = await getAllegroOrderEvents();
    if (!data || !data.AL1 || !data.AL2) {
      return apiResponse("Nie znaleziono zdarzeń zamówień.", 204);
    }

    return apiResponse("Zdarzenia zamówień zostały pobrane.", 200, data);
  } catch (err: any) {
    console.error("Błąd podczas pobierania zdarzeń zamówień:", err);

    if (err.allegroErrors && err.status) {
      return apiErrorResponse(
        "Nie udało się pobrać zdarzeń zamówień",
        err.status,
        err.allegroErrors,
        {
          step: "order_events_fetch",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse(
      "Nie udało się pobrać zdarzeń zamówień",
      500,
      null,
      {
        step: "order_events_fetch",
        originalMessage: err.message,
      }
    );
  }
}
