import { Product } from "@/firebase/schemas/productsSchemas";
import { apiResponse, getDocumentsFromAdminDB } from "@/server-actions/helpers";
import { createProduct } from "@/server-actions/products/products";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: Product = await request.json();
    const id = await createProduct(body);
    return apiResponse("Produkt został dodany.", 201, { id });
  } catch (err) {
    return apiResponse(`Błąd dodawania produktu: ${err}`, 400);
  }
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const queryFn =
    type === "obuwie" || type === "akcesoria"
      ? (ref: FirebaseFirestore.CollectionReference) =>
          ref.where("productType", "==", type)
      : undefined;

  const data = await getDocumentsFromAdminDB("products", queryFn);
  if (!data) {
    return apiResponse("Nie znaleziono produktów.", 204);
  }

  return apiResponse("Produkty zostały pobrane.", 200, data);
}
