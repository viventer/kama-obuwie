import { AllegroSizingTable } from "@/firebase/schemas/productsSchemas";
import {
  getAllegroSizingTable,
  updateAllegroSizingTable,
} from "@/server-actions/allegro/sizingTables";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const account = request.nextUrl.searchParams.get("account");
  const parsedAccount = account === "AL2" ? "AL2" : "AL1";

  const data = await getAllegroSizingTable(id, parsedAccount);
  if (!data) {
    return apiResponse("Nie znaleziono tabeli rozmiarów.", 204);
  }

  return apiResponse("Tabela rozmiarów została pobrana.", 200, data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const allegroSizingTable: Omit<AllegroSizingTable, "template"> =
    await request.json();

  const { id } = await params;

  await updateAllegroSizingTable(id, allegroSizingTable);

  return apiResponse("Tabela rozmiarów została zaktualizowana.", 200);
}
