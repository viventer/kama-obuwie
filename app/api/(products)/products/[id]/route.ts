import { NextRequest } from "next/server";
import { Product } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB, apiResponse } from "@/server-actions/helpers";
import { updateProduct } from "@/server-actions/products/products";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getDocumentFromAdminDB(id, "products");
  if (!data) {
    return apiResponse("Produkt nie istnieje.", 404);
  }
  return apiResponse("Pobrano produkt.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: Partial<Product> = await request.json();

  try {
    await updateProduct(id, body);
  } catch (err) {
    return apiResponse(`Błąd aktualizacji produktu: ${err}`, 400);
  }

  return apiResponse("Produkt został zaktualizowany.", 200);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, ref } = await getDocumentFromAdminDB("products", id);
  if (!data) {
    return apiResponse("Produkt nie istnieje.", 404);
  }

  await ref.delete();
  return apiResponse("Produkt został usunięty.", 200);
}
