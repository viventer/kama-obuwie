import { SizingTable } from "@/firebase/schemas/products";
import { getDocumentsFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { createSizingTable } from "@/server-actions/products/sizingTables";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, shoeModelId, insoleLenghts } = body;
  const newSizingTable: SizingTable = {
    name,
    shoeModelId,
    insoleLenghts,
  };

  try {
    await createSizingTable(newSizingTable);
  } catch (err) {
    return apiResponse(`Błąd tworzenia tabeli rozmiarów: ${err}`, 400);
  }

  return apiResponse("Tabela rozmiarów została dodana.", 201);
}

export async function GET() {
  const sizingTables = await getDocumentsFromAdminDB("sizingTables");
  if (!sizingTables) {
    return apiResponse("Nie znaleziono tabel rozmiarów.", 404);
  }

  return apiResponse("Tabela rozmiarów została pobrana.", 200, sizingTables);
}
