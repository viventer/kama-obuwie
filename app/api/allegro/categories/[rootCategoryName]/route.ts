import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { getAllegroCategories } from "@/server-actions/allegro/categories";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ rootCategoryName: RootCategory }>;
  }
) {
  try {
    const { rootCategoryName } = await params;
    const categories = await getAllegroCategories(rootCategoryName);
    return apiResponse("Pobrano kategorie.", 200, categories);
  } catch (err) {
    return apiResponse("Błąd pobierania kategorii.", 400);
  }
}
