import { SizingTable } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { createSizingTable } from "@/server-actions/products/sizingTables";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, insoleLengths } = body;
  const newSizingTable: SizingTable = {
    name,
    insoleLengths,
    sizingAccuracy: "normalna",
  };

  const id = await createSizingTable(newSizingTable);
  return apiResponse("Tabela rozmiarów została dodana.", 201, {
    id,
  });
}

export async function GET() {
  const sizingTables = await getDocumentsFromAdminDB("sizingTables");
  if (!sizingTables) {
    return apiResponse("Nie znaleziono tabel rozmiarów.", 204);
  }

  return apiResponse("Tabela rozmiarów została pobrana.", 200, sizingTables);
}
