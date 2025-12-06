import { AllegroSizingTable } from "@/firebase/schemas/productsSchemas";
import { updateAllegroSizingTable } from "@/server-actions/allegro/sizingTables";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

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
