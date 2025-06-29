import { Product } from "@/firebase/schemas/productsSchemas";
import { apiResponse, getDocumentsFromAdminDB } from "@/server-actions/helpers";
import { createProduct } from "@/server-actions/products/products";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body: Product = await request.json();
  const id = await createProduct(body);
  return apiResponse("Produkt został dodany.", 201, { id });
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const creationStageParam = request.nextUrl.searchParams.get("creationStage");
  const stages = creationStageParam ? creationStageParam.split(",") : null;

  const queryFn = (ref: FirebaseFirestore.CollectionReference) => {
    let query: FirebaseFirestore.Query = ref;

    if (type === "obuwie" || type === "akcesoria") {
      query = query.where("productType", "==", type);
    }

    if (stages && stages.length > 0) {
      query = query.where("creationStage", "in", stages);
    }

    return query;
  };

  const data = await getDocumentsFromAdminDB("products", queryFn);
  if (!data) {
    return apiResponse("Nie znaleziono produktów.", 204);
  }

  return apiResponse("Produkty zostały pobrane.", 200, data);
}
