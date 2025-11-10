import { Offer } from "@/firebase/schemas/offersSchemas";
import {
  ColorVariant,
  Product,
  SizingTable,
} from "@/firebase/schemas/productsSchemas";
import { postAllegroOffer } from "@/server-actions/allegro/offers";
import { apiResponse, apiErrorResponse } from "@/server-actions/errorHandlers";
import { NextRequest } from "next/server";

export type PostOfferBody = {
  offer: Offer;
  product: Product;
  images: string[];
  allegroCategoryId: string;
  sizingTable: SizingTable;
  colorVariant: ColorVariant;
  SKU: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: PostOfferBody = await request.json();
    const allegroIds = await postAllegroOffer(body);

    return apiResponse("Oferta została utworzona.", 201, { allegroIds });
  } catch (err: any) {
    console.error("Błąd podczas tworzenia oferty:", err);

    if (err.allegroErrors && err.status) {
      return apiErrorResponse(
        "Nie udało się utworzyć oferty na Allegro",
        err.status,
        err.allegroErrors,
        {
          step: "offer_creation",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse("Nie udało się utworzyć oferty", 500, null, {
      step: "offer_creation",
      originalMessage: err.message,
    });
  }
}
