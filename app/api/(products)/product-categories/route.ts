import { ProductCategorySchema } from "@/firebase/schemas/products";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
  apiResponse,
} from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, name, productType, allegroCategoryId, variantParameters } = body;

  try {
    ProductCategorySchema.parse({
      id,
      name,
      productType,
      allegroCategoryId,
      variantParameters,
    });
  } catch (err) {
    return apiResponse("Niepoprawne dane wejściowe.", 400);
  }

  const { data } = await getDocumentFromAdminDB(id, "productCategories");
  if (data) {
    return apiResponse("Kategoria już istnieje.", 409);
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
