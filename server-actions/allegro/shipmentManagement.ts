"use server";

import axios from "axios";
import { getAllegroUserAccessToken, getAllegroUserAccessTokens } from "./auth";
import { getAllegroHeaders, getSingleAllegroHeaders } from "./global";
import {
  CreateShipmentData,
  DeliveryService,
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
    const response = await axios.post(url, data, { headers });
    return response.data.commandId;
  } catch (error) {
    console.error("Error creating Allegro shipment:", error);
    throw error;
  }
}
