import { NextRequest } from "next/server";
import { SizingTableUpdateDataSchema } from "@/firebase/schemas/products";
import { getDocumentFromAdminDB, apiResponse } from "@/server-actions/helpers";

export async function GET({ params }: { params: { id: string } }) {
  const { id } = params;
  const data = await getDocumentFromAdminDB(id, "sizingTables");
  if (!data) {
    return apiResponse("Tabela rozmiarów nie istnieje.", 404);
  }
  return apiResponse("Pobrano tabelę rozmiarów.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  try {
    SizingTableUpdateDataSchema.parse(body);
  } catch {
    return apiResponse("Niepoprawne dane wejściowe.", 400);
  }

  const updateData = body;
  const { data, ref } = await getDocumentFromAdminDB(id, "sizingTables");
  if (!data) {
    return apiResponse("Tabela rozmiarów nie istnieje.", 404);
  }

  await ref.update(updateData);
  return apiResponse("Tabela rozmiarów została zaktualizowana.", 200);
}

export async function DELETE({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, ref } = await getDocumentFromAdminDB(id, "sizingTables");
  if (!data) {
    return apiResponse("Tabela rozmiarów nie istnieje.", 404);
  }

  await ref.delete();
  return apiResponse("Tabela rozmiarów została usunięta.", 200);
}
