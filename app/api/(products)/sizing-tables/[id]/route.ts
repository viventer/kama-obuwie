import { NextRequest } from "next/server";
import { SizingTable } from "@/firebase/schemas/products";
import { getDocumentFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { updateSizingTable } from "@/server-actions/products/sizingTables";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocumentFromAdminDB(id, "sizingTables");
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

  try {
    await updateSizingTable(id, body);
  } catch (err) {
    return apiResponse(`Błąd aktualizacji tabeli rozmiarów: ${err}`, 400);
  }

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
