import { NextRequest } from "next/server";
import {
  SizingTable,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { updateSizingTable } from "@/server-actions/products/sizingTables";
import { apiResponse } from "@/server-actions/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getDocumentFromAdminDB<SizingTableWithId>(
    "sizingTables",
    id
  );
  const { data } = result;
  if (!data) {
    return apiResponse("Tabela rozmiarów nie istnieje.", 404);
  }
  return apiResponse("Pobrano tabelę rozmiarów.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: Partial<SizingTable> = await request.json();

  await updateSizingTable(id, body);

  return apiResponse("Tabela rozmiarów została zaktualizowana.", 200);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, ref } = await getDocumentFromAdminDB("sizingTables", id);
  if (!data) {
    return apiResponse("Tabela rozmiarów nie istnieje.", 404);
  }

  await ref.delete();
  return apiResponse("Tabela rozmiarów została usunięta.", 200);
}
