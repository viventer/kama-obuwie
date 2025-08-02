"use server";

import axios, { AxiosError } from "axios";
import { getAllegroUserAccessToken, getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders, getSingleAllegroHeaders } from "./global";
import {
  CreateShipmentData,
  DeliveryService,
  ShipmentCreationCommandStatus,
  ShipmentDetails,
  AllegroError,
  AllegroAuthError,
} from "@/firebase/schemas/shipmentsSchemas";
import { handleAxiosError } from "../helpers";

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
    handleAxiosError(error, "Błąd podczas pobierania usług przewoźników");
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
    handleAxiosError(err, "Błąd podczas tworzenia przesyłki Allegro");
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
    handleAxiosError(err, "Błąd podczas pobierania statusu przesyłki Allegro");
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
    handleAxiosError(err, "Błąd podczas pobierania etykiety przesyłki Allegro");
  }
}

export async function getShipmentDetails(
  shipmentId: string,
  salesChannel: "AL1" | "AL2"
): Promise<ShipmentDetails | undefined> {
  const accessToken = await getAllegroUserAccessToken(salesChannel);
  const headers = getSingleAllegroHeaders(accessToken);
  const url = `${ALLEGRO_API_BASE_URL}/shipment-management/shipments/${shipmentId}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (err) {
    handleAxiosError(err, "Błąd podczas pobierania danych przesyłki");
  }
}
