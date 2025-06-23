import { Offer } from "@/firebase/schemas/offersSchemas";
import {
  ColorVariant,
  Product,
  SizingTable,
} from "@/firebase/schemas/productsSchemas";
import { postAllegroOffer } from "@/server-actions/allegro/offers";
import { apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export type PostOfferBody = {
  offer: Offer;
  product: Product;
  images: string[];
  allegroCategoryId: string;
  sizingTable: SizingTable;
  colorVariant: ColorVariant;
};

export async function POST(request: NextRequest) {
  try {
    const body: PostOfferBody = await request.json();
    const allegroIds = postAllegroOffer(body);

    return apiResponse("Oferta została utworzona.", 201, { allegroIds });
  } catch (err) {
    return apiResponse(`Błąd tworzenia oferty: ${err}`, 400);
  }
}
