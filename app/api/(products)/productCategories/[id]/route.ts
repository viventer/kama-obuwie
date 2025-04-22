import { NextRequest } from "next/server";
import { ProductCategoryUpdateDataSchema } from "@/firebase/schemas/products";
import { getDocumentFromAdminDB, response } from "@/lib/utils";

export async function GET({ params }: { params: { id: string } }) {
  const { id } = params;
  const data = await getDocumentFromAdminDB(id, "productCategories");
  if (!data) {
    return response("Kategoria nie istnieje.", 404);
  }
  return response("Pobrano kategorię.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  try {
    ProductCategoryUpdateDataSchema.parse(body);
  } catch {
    return response("Niepoprawne dane wejściowe.", 400);
  }

  const updateData = body;
  const { data, ref } = await getDocumentFromAdminDB(id, "productCategories");
  if (!data) {
    return response("Kategoria nie istnieje.", 404);
  }

  await ref.update(updateData);
  return response("Kategoria została zaktualizowana.", 200);
}

export async function DELETE({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, ref } = await getDocumentFromAdminDB(id, "productCategories");
  if (!data) {
    return response("Kategoria nie istnieje.", 404);
  }

  await ref.delete();
  return response("Kategoria została usunięta.", 200);
}
