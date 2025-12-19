import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { getAllegroCategories } from "@/server-actions/allegro/categories";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ rootCategoryName: string }>;
  }
) {
  const { rootCategoryName } = await params;
  const categories = await getAllegroCategories(
    rootCategoryName as RootCategory
  );
  return apiResponse("Pobrano kategorie.", 200, categories);
}
