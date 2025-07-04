import { AllegroSizingTable } from "@/firebase/schemas/productsSchemas";
import {
  createAllegroSizingTable,
  getAllegroSizingTables,
} from "@/server-actions/allegro/sizingTables";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function GET() {
  const data = await getAllegroSizingTables();
  if (!data) {
    return apiResponse("Nie znaleziono cenników dostaw.", 204);
  }

  return apiResponse("Cenniki dostaw zostały pobrane.", 200, data);
}

export async function POST(request: NextRequest) {
  const allegroSizingTable: AllegroSizingTable = await request.json();

  const id = await createAllegroSizingTable(allegroSizingTable);
  return apiResponse("Tabela rozmiarów została dodana.", 201, { id });
}
