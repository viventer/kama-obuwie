import {
  CreateShipmentData,
  ShipmentCreationCommandStatus,
} from "@/firebase/schemas/shipmentsSchemas";
import {
  createAllegroShipment,
  getShipmentLabel,
  getShipmentStatus,
} from "@/server-actions/allegro/shipmentManagement";
import { apiResponse } from "@/server-actions/helpers";
import { adminStorage } from "@/firebase/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body: { data: CreateShipmentData; account: "AL1" | "AL2" } =
    await request.json();

  let commandId: string | undefined;
  try {
    commandId = await createAllegroShipment(body.data, body.account);
    console.log("Command ID:", commandId);
    if (!commandId) {
      throw new Error();
    }
  } catch (err) {
    return apiResponse("Nie udało się utworzyć etykiety.", 400);
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
    } catch (err) {
      if (attempt === maxRetries) {
        return apiResponse(
          "Nie udało się pobrać statusu przesyłki po wszystkich próbach.",
          400
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
    return apiResponse("Nie udało się pobrać statusu przesyłki.", 400);
  }

  if (shipmentStatusData.status === "ERROR") {
    return apiResponse(
      `Wystąpił błąd podczas tworzenia przesyłki: ${shipmentStatusData.errors[0].userMessage}`,
      400
    );
  }

  let label: Buffer | undefined;
  try {
    label = await getShipmentLabel(shipmentStatusData.shipmentId, body.account);
    console.log("Label buffer length:", label?.length); // Debug log
    if (!label || label.length === 0) {
      throw new Error("Pusta etykieta");
    }
  } catch (err) {
    console.error("Błąd pobierania etykiety:", err);
    return apiResponse("Nie udało się pobrać etykiety przesyłki.", 400);
  }

  // Zapisz w Firebase Storage i zwróć plik bezpośrednio
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

    // Zwróć plik bezpośrednio jako download
    const headers = new Headers({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="etykieta_${body.data.referenceNumber}.pdf"`,
      "Content-Length": label.length.toString(),
    });

    return new NextResponse(label, { headers });
  } catch (err) {
    console.error("Błąd podczas zapisywania etykiety:", err);
    return apiResponse("Nie udało się zapisać etykiety.", 500);
  }
}
