import { Offer } from "@/firebase/schemas/offersSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { createOffer } from "@/server-actions/offers/offers";
import { NextRequest } from "next/server";
import { apiResponse } from "@/server-actions/helpers";

export async function POST(request: NextRequest) {
  const body: Partial<Offer> = await request.json();
  const id = await createOffer(body);
  return apiResponse("Oferta została utworzona.", 201, { id });
}

export async function GET(request: NextRequest) {
  const productIdParam = request.nextUrl.searchParams.get("productId");
  const signatureParam = request.nextUrl.searchParams.get("signature");

  const queryFn = (ref: FirebaseFirestore.CollectionReference) => {
    let query: FirebaseFirestore.Query = ref;

    if (productIdParam) {
      query = query.where("productId", "==", productIdParam);
    }

    if (signatureParam) {
      query = query.where("signature", "==", signatureParam);
    }

    return query;
  };

  const data = await getDocumentsFromAdminDB<Offer>("offers", queryFn);
  if (!data) {
    return apiResponse("Nie znaleziono ofert.", 204);
  }

  return apiResponse("Oferty zostały pobrane.", 200, data);
}
