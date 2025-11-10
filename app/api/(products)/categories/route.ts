import { Category } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { createCategory } from "@/server-actions/products/categories";
import { NextRequest } from "next/server";
import { apiResponse } from "@/server-actions/errorHandlers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, allegroCategoryId, variantParameters, rootCategory } = body;

  const newCategory: Category = {
    name,
    allegroCategoryId,
    variantParameters,
    rootCategory,
  };

  const id = await createCategory(newCategory);
  return apiResponse("Kategoria została dodana.", 201, { id });
}

export async function GET() {
  const data = await getDocumentsFromAdminDB<Category>("categories");
  if (!data) {
    return apiResponse("Nie znaleziono kategorii.", 204);
  }

  return apiResponse("Kategorie zostały pobrane.", 200, data);
}
