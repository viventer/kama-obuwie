import { NextRequest } from "next/server";
import { getDocumentFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { updateCategory } from "@/server-actions/products/categories";

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocumentFromAdminDB(id, "categories");
  if (!data) {
    return apiResponse("Kategoria nie istnieje.", 404);
  }
  return apiResponse("Pobrano kategorię.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData = body;
  try {
    await updateCategory(id, updateData);
  } catch (err) {
    return apiResponse(`Błąd aktualizacji kategorii: ${err}`, 400);
  }

  return apiResponse("Kategoria została zaktualizowana.", 200);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, ref } = await getDocumentFromAdminDB("categories", id);
  if (!data) {
    return apiResponse("Kategoria nie istnieje.", 404);
  }

  await ref.delete();
  return apiResponse("Kategoria została usunięta.", 200);
}
