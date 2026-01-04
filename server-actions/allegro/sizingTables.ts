"use server";

import axios from "axios";
import {
  getAllegroAccessTokensForBackgroundJob,
  getAllegroUserAccessToken,
} from "./auth";
import { getSingleAllegroHeaders } from "./global";
import {
  AllegroSizingTable,
  AllegroSizingTableSchema,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";
import { handleAllegroApiError } from "../errorHandlers";

const ALLEGRO_API_BASE_URL = process.env.NEXT_PUBLIC_ALLEGRO_API_BASE_URL!;

const url = `${ALLEGRO_API_BASE_URL}/sale/size-tables`;

export async function getAllegroSizingTables(account: "AL1" | "AL2" = "AL1") {
  const accessToken = await getAllegroUserAccessToken(account);
  const allegroHeaders = getSingleAllegroHeaders(accessToken);

  try {
    const response = await axios.get(url, {
      headers: allegroHeaders,
    });
    return response.data.tables;
  } catch (error) {
    handleAllegroApiError(
      error,
      "Błąd podczas pobierania tabel rozmiarów z Allegro"
    );
  }
}

export async function getAllegroSizingTable(
  id: string,
  account: "AL1" | "AL2" = "AL1",
  opts?: { userId?: string }
): Promise<AllegroSizingTable | undefined> {
  if (!id || id.trim() === "") {
    throw new Error("Brak id tabeli rozmiarów.");
  }

  let accessToken: string;
  if (opts?.userId) {
    const tokens = await getAllegroAccessTokensForBackgroundJob();
    accessToken = tokens[account];
  } else {
    accessToken = await getAllegroUserAccessToken(account);
  }

  const allegroHeaders = getSingleAllegroHeaders(accessToken);

  try {
    const response = await axios.get(`${url}/${id}`, {
      headers: allegroHeaders,
    });
    return AllegroSizingTableSchema.parse(response.data);
  } catch (error) {
    handleAllegroApiError(
      error,
      "Błąd podczas pobierania tabeli rozmiarów z Allegro"
    );
  }
}

export async function createAllegroSizingTable(
  allegroSizingTable: Omit<AllegroSizingTable, "template">
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getSingleAllegroHeaders(accessToken);

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
    handleAllegroApiError(
      error,
      "Błąd podczas tworzenia tabeli rozmiarów w Allegro"
    );
  }
}

export async function updateAllegroSizingTable(
  id: string,
  updateData: Omit<AllegroSizingTable, "template">
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  AllegroSizingTableSchema.partial().parse(updateData);

  const accessToken = await getAllegroUserAccessToken();
  const allegroHeaders = getSingleAllegroHeaders(accessToken);

  try {
    const response = await axios.put(`${url}/${id}`, updateData, {
      headers: allegroHeaders,
    });
    return response.data;
  } catch (error) {
    handleAllegroApiError(
      error,
      "Błąd podczas aktualizacji tabeli rozmiarów w Allegro"
    );
  }
}
