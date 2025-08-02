import {
  CreateShipmentData,
  ShipmentCreationCommandStatus,
  ShipmentDetails,
} from "@/firebase/schemas/shipmentsSchemas";
import {
  createAllegroShipment,
  getShipmentDetails,
  getShipmentLabel,
  getShipmentStatus,
} from "@/server-actions/allegro/shipmentManagement";
import { apiResponse, apiErrorResponse } from "@/server-actions/helpers";
import { adminStorage } from "@/firebase/firebaseAdmin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body: { data: CreateShipmentData; account: "AL1" | "AL2" } =
    await request.json();

  let commandId: string | undefined;
  try {
    commandId = await createAllegroShipment(body.data, body.account);
    console.log("Command ID:", commandId);
    if (!commandId) {
      throw new Error("Nie otrzymano identyfikatora komendy z API Allegro");
    }
  } catch (err: any) {
    console.error("Błąd podczas tworzenia przesyłki:", err);

    // Sprawdź czy to błąd z Allegro z dodatkowymi informacjami
    if (err.allegroErrors && err.status) {
      return apiErrorResponse(
        "Nie udało się utworzyć etykiety",
        err.status,
        err.allegroErrors,
        {
          step: "shipment_creation",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse("Nie udało się utworzyć etykiety", 500, null, {
      step: "shipment_creation",
      originalMessage: err.message,
    });
  }

  let shipmentStatusData: ShipmentCreationCommandStatus | undefined;
  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      shipmentStatusData = await getShipmentStatus(commandId, body.account);
      console.log(
        `Shipment Status Data (attempt ${attempt}):`,
        shipmentStatusData
      );

      if (!shipmentStatusData) {
        throw new Error();
      }

      // Jeśli status nie jest IN_PROGRESS, przerywamy pętlę
      if (shipmentStatusData.status !== "IN_PROGRESS") {
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
          "Nie udało się pobrać statusu przesyłki po wszystkich próbach",
          500,
          null,
          {
            step: "shipment_status_check",
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

  if (!shipmentStatusData) {
    return apiErrorResponse(
      "Nie udało się pobrać statusu przesyłki",
      500,
      null,
      {
        step: "shipment_status_check",
        commandId: commandId,
      }
    );
  }

  if (shipmentStatusData.status === "ERROR") {
    return apiErrorResponse(
      "Wystąpił błąd podczas tworzenia przesyłki",
      400,
      shipmentStatusData.errors,
      {
        step: "shipment_creation_failed",
        commandId: commandId,
        shipmentStatus: shipmentStatusData.status,
      }
    );
  }

  let shipmentDetails: ShipmentDetails | undefined;
  try {
    shipmentDetails = await getShipmentDetails(
      shipmentStatusData.shipmentId,
      body.account
    );
    if (!shipmentDetails) {
      throw new Error("Nie udało się pobrać szczegółów przesyłki.");
    }
  } catch (err: any) {
    console.error("Błąd podczas pobierania szczegółów przesyłki:", err);
    return apiErrorResponse(
      "Nie udało się pobrać szczegółów przesyłki",
      500,
      null,
      {
        step: "shipment_details",
        shipmentId: shipmentStatusData.shipmentId,
        originalMessage: err.message,
      }
    );
  }

  let label: Buffer | undefined;
  try {
    label = await getShipmentLabel(shipmentStatusData.shipmentId, body.account);
    console.log("Label buffer length:", label?.length); // Debug log
    if (!label || label.length === 0) {
      throw new Error("Pusta etykieta");
    }
  } catch (err: any) {
    console.error("Błąd pobierania etykiety:", err);
    return apiErrorResponse(
      "Nie udało się pobrać etykiety przesyłki",
      500,
      null,
      {
        step: "label_download",
        shipmentId: shipmentStatusData.shipmentId,
        originalMessage: err.message,
      }
    );
  }

  // Zapisz w Firebase Storage i zwróć informacje o pliku
  const bucket = adminStorage.bucket();
  const filename = `labels/${body.data.referenceNumber}_${Date.now()}.pdf`;
  const file = bucket.file(filename);

  try {
    // Zapisz plik do Firebase Storage
    await file.save(label, {
      metadata: {
        contentType: "application/pdf",
        metadata: {
          orderNumber: body.data.referenceNumber,
          shipmentId: shipmentStatusData.shipmentId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Wygeneruj signed URL do pobrania
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24, // 24 godziny
    });

    const returnData = {
      downloadUrl: signedUrl,
      storagePath: filename,
      shipmentId: shipmentDetails.id,
      parcelNumber: shipmentDetails.packages[0].waybill,
      isPickupAvailable: shipmentDetails.pickupAvailable,
    };

    // Zwróć informacje o pliku w JSON
    return apiResponse(
      "Etykieta została utworzona i zapisana pomyślnie.",
      200,
      returnData
    );
  } catch (err: any) {
    console.error("Błąd podczas zapisywania etykiety:", err);
    return apiErrorResponse("Nie udało się zapisać etykiety", 500, null, {
      step: "file_storage",
      filename: filename,
      originalMessage: err.message,
    });
  }
}
