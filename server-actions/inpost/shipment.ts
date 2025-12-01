"use server";

import {
  CreateInpostShipmentData,
  CreateInpostShipmentDataSchema,
  InpostShipment,
  InpostShipmentSchema,
} from "@/firebase/schemas/inpost/shipmentsSchemas";
import { verifyUser } from "../auth/auth";
import { getInpostHeaders } from "./global";
import axios from "axios";
import { handleInpostApiError } from "../errorHandlers";

const INPOST_API_BASE_URL = process.env.NEXT_PUBLIC_INPOST_API_BASE_URL!;
const INPOST_ORGANIZATION_ID = process.env.NEXT_PUBLIC_INPOST_ORGANIZATION_ID!;

export async function createInpostShipment(
  createShipmentData: CreateInpostShipmentData
): Promise<InpostShipment> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  CreateInpostShipmentDataSchema.parse(createShipmentData);

  try {
    const response = await axios.post(
      `${INPOST_API_BASE_URL}/v1/organizations/${INPOST_ORGANIZATION_ID}/shipments`,
      createShipmentData,
      {
        headers: getInpostHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    handleInpostApiError(error, "Błąd podczas tworzenia przesyłki InPost.");
  }
}

export async function getInpostShipmentData(
  shipmentId: number
): Promise<InpostShipment> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const url = `${INPOST_API_BASE_URL}/v1/shipments/${shipmentId}`;

  try {
    const response = await axios.get(url, {
      headers: getInpostHeaders(),
    });

    return response.data;
  } catch (error) {
    handleInpostApiError(
      error,
      "Nie udało się pobrać danych przesyłki InPost."
    );
  }
}

export async function getInpostShipmentLabel(
  shipmentId: number
): Promise<Buffer> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const url = `${INPOST_API_BASE_URL}/v1/shipments/${shipmentId}/label`;

  try {
    const response = await axios.get(url, {
      headers: getInpostHeaders(),
      responseType: "arraybuffer",
    });

    return Buffer.from(response.data);
  } catch (error) {
    handleInpostApiError(error, "Nie udało się pobrać etykiety InPost.");
  }
}
