import { NextRequest } from "next/server";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { updateCategory } from "@/server-actions/products/categories";
import { apiResponse } from "@/server-actions/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getDocumentFromAdminDB("categories", id);
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
  await updateCategory(id, updateData);

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
