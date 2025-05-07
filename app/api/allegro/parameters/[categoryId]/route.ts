import { getProductParameters } from "@/server-actions/allegro/products";
import { apiResponse } from "@/server-actions/helpers";
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

  try {
    const productParameters = await getProductParameters(categoryId);
    return apiResponse("Pobrano parametry.", 200, productParameters);
  } catch (err) {
    return apiResponse("Błąd pobierania parametrów.", 400);
  }
}
