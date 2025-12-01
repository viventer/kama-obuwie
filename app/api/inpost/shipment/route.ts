import {
  CreateInpostShipmentData,
  InpostShipment,
} from "@/firebase/schemas/inpost/shipmentsSchemas";
import { apiErrorResponse, apiResponse } from "@/server-actions/errorHandlers";
import {
  createInpostShipment,
  getInpostShipmentData,
} from "@/server-actions/inpost/shipment";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const createShipmentData: CreateInpostShipmentData = await request.json();

  let createShipmentResponse: InpostShipment | null = null;
  try {
    createShipmentResponse = await createInpostShipment(createShipmentData);
  } catch (err: any) {
    return apiErrorResponse("Nie udało się utworzyć przesyłki", 500, null, {
      step: "shipment_creation",
    });
  }

  const shipmentId = createShipmentResponse.id;
  let shipmentData: InpostShipment | null = null;
  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      shipmentData = await getInpostShipmentData(shipmentId);

      if (!shipmentData) {
        throw new Error();
      }

      if (shipmentData.status !== "created") {
        break;
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (err: any) {
      console.error(`Błąd przy próbie ${attempt}:`, err);
      if (attempt === maxRetries) {
        return apiErrorResponse(
          "Nie udało się pobrać danych przesyłkii po wszystkich próbach",
          500,
          null,
          {
            step: "shipment_status_check",
            shipmentId,
          }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!shipmentData) {
    return apiErrorResponse(
      "Nie udało się pobrać statusu przesyłki",
      500,
      null,
      {
        step: "shipment_status_check",
        shipmentId,
      }
    );
  }

  if (shipmentData.status !== "confirmed") {
    return apiErrorResponse("Wystąpił błąd podczas tworzenia przesyłki", 400, {
      step: "shipment_creation_failed",
      shipmentId,
      shipmentStatus: shipmentData.status,
    });
  }

  return apiResponse("Przesyłka została utworzona.", 201, {
    shipmentId,
    parcelNumber: shipmentData.tracking_number,
  });
}
