import { adminDB } from "@/firebase/firebaseAdmin";
import { Category, CategorySchema } from "@/firebase/schemas/products";
import { getAllegroCategoryById } from "@/server-actions/allegro/categories";
import { getDocumentsFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { createCategory } from "@/server-actions/products/categories";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    productType,
    allegroCategoryId,
    variantParameters,
    rootCategory,
  } = body;

  const newCategory: Category = {
    name,
    productType,
    allegroCategoryId,
    variantParameters,
    rootCategory,
  };

  try {
    await createCategory(newCategory);
  } catch (err) {
    return apiResponse(`Błąd dodawania kategorii: ${err}`, 400);
  }

  return apiResponse("Kategoria została dodana.", 201);
}

export async function GET() {
  const data = await getDocumentsFromAdminDB("productCategories");
  if (!data) {
    return apiResponse("Nie znaleziono kategorii.", 404);
  }

  return apiResponse("Kategorie zostały pobrane.", 200, data);
}
