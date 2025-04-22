import { SizingTableSchema } from "@/firebase/schemas/products";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
  response,
} from "@/lib/utils";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, name, shoeModelId, insoleLenghts } = body;

  try {
    SizingTableSchema.parse({ id, name, shoeModelId, insoleLenghts });
  } catch (err) {
    return response("Niepoprawne dane wejściowe.", 400);
  }

  const { data } = await getDocumentFromAdminDB(id, "sizingTables");
  if (data) {
    return response("Tabela rozmiarów już istnieje.", 409);
  }

  return response("Tabela rozmiarów została dodana.", 201);
}

export async function GET() {
  const sizingTables = await getDocumentsFromAdminDB("sizingTables");
  if (!sizingTables) {
    return response("Nie znaleziono tabel rozmiarów.", 404);
  }

  return response("Tabela rozmiarów została pobrana.", 200, sizingTables);
}
