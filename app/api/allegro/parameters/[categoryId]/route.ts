import { getProductParameters } from "@/server-actions/allegro/products";
import { apiResponse } from "@/server-actions/errorHandlers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ categoryId: string }>;
  }
) {
  const { categoryId } = await params;

  const productParameters = await getProductParameters(categoryId);
  if (!productParameters) {
    return apiResponse("Nie znaleziono parametrów.", 204);
  }
  return apiResponse("Pobrano parametry.", 200, productParameters);
}
