import { Offer } from "@/firebase/schemas/offersSchemas";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export type PostOfferBody = {
  offer: Offer;
  productParameters: ProductParameters;
  images: string[];
  allegroCategoryId: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: PostOfferBody = await request.json();

    return apiResponse("Oferta została utworzona.", 201, { id });
  } catch (err) {
    return apiResponse(`Błąd tworzenia oferty: ${err}`, 400);
  }
}
