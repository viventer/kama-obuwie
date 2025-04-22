import { SizingTableSchema } from "@/firebase/schemas/products";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
  apiResponse,
} from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, name, shoeModelId, insoleLenghts } = body;

  try {
    SizingTableSchema.parse({ id, name, shoeModelId, insoleLenghts });
  } catch (err) {
    return apiResponse("Niepoprawne dane wejściowe.", 400);
  }

  const { data } = await getDocumentFromAdminDB(id, "sizingTables");
  if (data) {
    return apiResponse("Tabela rozmiarów już istnieje.", 409);
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
