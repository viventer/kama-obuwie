"use server";

import axios from "axios";
import { getAllegroUserAccessToken } from "./auth";
import { getAllegroHeaders } from "./global";
import {
  AllegroSizingTable,
  AllegroSizingTableSchema,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

const url = `${ALLEGRO_API_BASE_URL}/sale/size-tables`;

export async function getAllegroSizingTables() {
  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);

  try {
    const response = await axios.get(url, {
      headers: allegroHeaders,
    });
    return response.data.tables;
  } catch (error) {
    console.error(error);
  }
}

export async function createAllegroSizingTable(
  allegroSizingTable: Omit<AllegroSizingTable, "template">
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);

  AllegroSizingTableSchema.partial().parse(allegroSizingTable);

  try {
    const templatesResp = await axios.get(`${url}-templates`, {
      headers: allegroHeaders,
    });

    const templates: { id: string; name: string; [key: string]: any }[] =
      templatesResp.data.templates;
    if (templates.length === 0) {
      throw new Error("Nie znaleziono szablonów tabel rozmiarów.");
    }

    const shoesTemplate = templates.find(
      (template) => template.name === "Obuwie"
    );

    if (!shoesTemplate) {
      throw new Error("Nie znaleziono szablonu tabeli rozmiarów dla obuwia.");
    }

    const response = await axios.post(
      url,
      { ...allegroSizingTable, template: { id: shoesTemplate.id } },
      {
        headers: allegroHeaders,
      }
    );
    return response.data.id as string;
  } catch (error) {
    console.error(error);
  }
}

export async function updateAllegroSizingTable(
  id: string,
  updateData: Omit<AllegroSizingTable, "template">
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  AllegroSizingTableSchema.partial().parse(updateData);

  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getAllegroHeaders(accessToken);

  try {
    const response = await axios.put(`${url}/${id}`, updateData, {
      headers: allegroHeaders,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
