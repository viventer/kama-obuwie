import { Category } from "@/firebase/schemas/products";
import { getDocumentsFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { createCategory } from "@/server-actions/products/categories";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, allegroCategoryId, variantParameters, rootCategory } = body;

  const newCategory: Category = {
    name,
    allegroCategoryId,
    variantParameters,
    rootCategory,
  };

  try {
    const id = await createCategory(newCategory);
    return apiResponse("Kategoria została dodana.", 201, { id });
  } catch (err) {
    return apiResponse(`Błąd dodawania kategorii: ${err}`, 400);
  }
}

export async function GET() {
  const data = await getDocumentsFromAdminDB("categories");
  if (!data) {
    return apiResponse("Nie znaleziono kategorii.", 204);
  }

  return apiResponse("Kategorie zostały pobrane.", 200, data);
}
