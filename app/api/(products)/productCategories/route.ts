import { ProductCategorySchema } from "@/firebase/schemas/products";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
  response,
} from "@/lib/utils";
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
    return response("Niepoprawne dane wejściowe.", 400);
  }

  const { data } = await getDocumentFromAdminDB(id, "productCategories");
  if (data) {
    return response("Kategoria już istnieje.", 409);
  }

  return response("Kategoria została dodana.", 201);
}

export async function GET() {
  const data = await getDocumentsFromAdminDB("productCategories");
  if (!data) {
    return response("Nie znaleziono kategorii.", 404);
  }

  return response("Kategorie zostały pobrane.", 200, data);
}
