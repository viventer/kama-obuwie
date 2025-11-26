"use server";

import {
  InpostShipment,
  InpostShipmentSchema,
} from "@/firebase/schemas/inpost/shipmentsSchemas";
import { verifyUser } from "../auth/auth";
import { getInpostHeaders } from "./global";
import axios from "axios";
import { handleInpostApiError } from "../errorHandlers";

const INPOST_API_BASE_URL = process.env.NEXT_PUBLIC_INPOST_API_BASE_URL!;
const INPOST_ORGANIZATION_ID = process.env.NEXT_PUBLIC_INPOST_ORGANIZATION_ID!;

export async function createInPostShipment(
  shipment: InpostShipment
): Promise<InpostShipment> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  InpostShipmentSchema.parse(shipment);

  try {
    const response = await axios.post(
      `${INPOST_API_BASE_URL}/v1/organizations/${INPOST_ORGANIZATION_ID}/shipments`,
      shipment,
      {
        headers: getInpostHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    handleInpostApiError(error, "Błąd podczas tworzenia przesyłki InPost.");
  }
}
