import { NextRequest } from "next/server";
import {
  requestPickup,
  getCreatePickupStatus,
} from "@/server-actions/allegro/shipmentManagement";
import { PickupCreationCommandStatus } from "@/firebase/schemas/shipmentsSchemas";
import { apiResponse, apiErrorResponse } from "@/server-actions/helpers";

export type PickupRequestBody = {
  shipmentId: string;
  pickupDateProposalId: string;
  salesChannel: "AL1" | "AL2";
  orderId: string;
};

export async function POST(request: NextRequest) {
  const body: PickupRequestBody = await request.json();

  let commandId: string | undefined;
  try {
    commandId = await requestPickup(
      body.shipmentId,
      body.pickupDateProposalId,
      body.salesChannel
    );
    if (!commandId) {
      throw new Error("Nie otrzymano identyfikatora komendy z API Allegro");
    }
  } catch (err: any) {
    console.error("Błąd podczas zamawiania podjazdu:", err);

    // Sprawdź czy to błąd z Allegro z dodatkowymi informacjami
    if (err.allegroErrors && err.status) {
      return apiErrorResponse(
        "Nie udało się zamówić podjazdu kuriera",
        err.status,
        err.allegroErrors,
        {
          step: "pickup_request",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse(
      "Nie udało się zamówić podjazdu kuriera",
      500,
      null,
      {
        step: "pickup_request",
        originalMessage: err.message,
      }
    );
  }

  let pickupStatusData: PickupCreationCommandStatus | undefined;
  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      pickupStatusData = await getCreatePickupStatus(
        commandId,
        body.salesChannel
      );
      console.log(`Pickup Status Data (attempt ${attempt}):`, pickupStatusData);

      if (!pickupStatusData) {
        throw new Error();
      }

      // Jeśli status nie jest IN_PROGRESS, przerywamy pętlę
      if (pickupStatusData.status !== "IN_PROGRESS") {
        break;
      }

      // Jeśli to nie jest ostatnia próba i status to IN_PROGRESS, czekamy 3 sekundy
      if (attempt < maxRetries) {
        console.log(
          `Status IN_PROGRESS, oczekiwanie 3 sekundy przed próbą ${
            attempt + 1
          }...`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (err: any) {
      console.error(`Błąd przy próbie ${attempt}:`, err);
      if (attempt === maxRetries) {
        return apiErrorResponse(
          "Nie udało się pobrać statusu zamówienia podjazdu po wszystkich próbach",
          500,
          null,
          {
            step: "pickup_status_check",
            attempt: attempt,
            commandId: commandId,
            originalMessage: err.message,
          }
        );
      }
      // Jeśli nie jest to ostatnia próba, czekamy i próbujemy ponownie
      console.log(
        `Błąd przy próbie ${attempt}, oczekiwanie przed kolejną próbą...`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  if (!pickupStatusData) {
    return apiErrorResponse(
      "Nie udało się pobrać statusu zamówienia podjazdu",
      500,
      null,
      {
        step: "pickup_status_check",
        commandId: commandId,
      }
    );
  }

  if (pickupStatusData.status === "ERROR") {
    return apiErrorResponse(
      "Wystąpił błąd podczas zamawiania podjazdu kuriera",
      400,
      pickupStatusData.errors,
      {
        step: "pickup_creation_failed",
        commandId: commandId,
        pickupStatus: pickupStatusData.status,
      }
    );
  }

  // Zwróć odpowiedź 200 bez żadnych danych
  return apiResponse("Podjazd kuriera został zamówiony pomyślnie.", 200);
}
