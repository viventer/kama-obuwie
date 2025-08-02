"use server";

import axios, { AxiosError } from "axios";
import { getAllegroUserAccessToken, getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders, getSingleAllegroHeaders } from "./global";
import {
  CreateShipmentData,
  DeliveryService,
  ShipmentCreationCommandStatus,
} from "@/firebase/schemas/shipmentsSchemas";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

export type DeliveryServicesReturnType = {
  AL1: DeliveryService[];
  AL2: DeliveryService[];
};

export async function getAllegroDeliveryServices(): Promise<
  DeliveryServicesReturnType | undefined
> {
  const { AL1: AL1AccessToken, AL2: AL2AccessToken } =
    await getAllegroUserAccessTokens();
  const headers = getAllegroHeaders(AL1AccessToken, AL2AccessToken);
  const url = `${ALLEGRO_API_BASE_URL}/shipment-management/delivery-services`;

  try {
    const [AL1Response, AL2Response] = await Promise.all([
      axios.get(url, { headers: headers.AL1 }),
      axios.get(url, { headers: headers.AL2 }),
    ]);

    return {
      AL1: AL1Response.data.services,
      AL2: AL2Response.data.services,
    };
  } catch (error) {
    console.error(error);
  }
}

export async function createAllegroShipment(
  data: CreateShipmentData,
  salesChannel: "AL1" | "AL2"
): Promise<string | undefined> {
  const accessToken = await getAllegroUserAccessToken(salesChannel);
  const headers = getSingleAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/shipment-management/shipments/create-commands`;

  try {
    const response = await axios.post(url, { input: data }, { headers });
    return response.data.commandId;
  } catch (err) {
    const error = err as AxiosError<{
      errors: Array<{
        code: string;
        details: string;
        message: string;
        path: string;
        userMessage: string;
        metadata: Record<string, any>;
      }>;
    }>;

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", JSON.stringify(error.response.data, null, 2));
      error.response.data.errors.forEach((e, idx) => {
        console.error(`Error #${idx + 1}`);
        console.error("  code       :", e.code);
        console.error("  message    :", e.message);
        console.error("  details    :", e.details);
        console.error("  userMessage:", e.userMessage);
        console.error("  path       :", e.path);
        console.error("  metadata   :", JSON.stringify(e.metadata));
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      // Błąd w konfiguracji Axios lub inny
      console.error("Unexpected error:", error.message);
    }
    throw new Error(`Błąd podczas tworzenia przesyłki: ${error.message}`);
  }
}

export async function getShipmentStatus(
  commandId: string,
  salesChannel: "AL1" | "AL2"
): Promise<ShipmentCreationCommandStatus | undefined> {
  const accessToken = await getAllegroUserAccessToken(salesChannel);
  const headers = getSingleAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/shipment-management/shipments/create-commands/${commandId}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (err) {
    console.error("Error fetching shipment status:", err);
    throw new Error(`Błąd podczas pobierania statusu przesyłki: ${err}`);
  }
}

export async function getShipmentLabel(
  shipmentId: string,
  account: "AL1" | "AL2"
): Promise<Buffer | undefined> {
  const accessToken = await getAllegroUserAccessToken(account);
  const headers = getSingleAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/shipment-management/label`;

  const data = {
    shipmentIds: [shipmentId],
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        ...headers,
        Accept: "application/octet-stream",
      },
      responseType: "arraybuffer", // Ważne dla danych binarnych
    });

    const buffer = Buffer.from(response.data);
    console.log("Received label buffer length:", buffer.length); // Debug log

    return buffer;
  } catch (err) {
    const error = err as AxiosError<{
      errors: Array<{
        code: string;
        details: string;
        message: string;
        path: string;
        userMessage: string;
        metadata: Record<string, any>;
      }>;
    }>;

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", JSON.stringify(error.response.data, null, 2));
      error.response.data.errors.forEach((e, idx) => {
        console.error(`Error #${idx + 1}`);
        console.error("  code       :", e.code);
        console.error("  message    :", e.message);
        console.error("  details    :", e.details);
        console.error("  userMessage:", e.userMessage);
        console.error("  path       :", e.path);
        console.error("  metadata   :", JSON.stringify(e.metadata));
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      // Błąd w konfiguracji Axios lub inny
      console.error("Unexpected error:", error.message);
    }
    throw new Error(`Błąd podczas tworzenia przesyłki: ${error.message}`);
  }
}
