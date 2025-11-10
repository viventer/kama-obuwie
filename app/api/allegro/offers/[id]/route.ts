import { AllegroOffer } from "@/firebase/schemas/offersSchemas";
import {
  editAllegroOffer,
  getAllegroOffer,
} from "@/server-actions/allegro/offers";
import { apiResponse } from "@/server-actions/errorHandlers";
import { NextRequest } from "next/server";

export type PatchAllegroOfferBody = {
  offerPartial: Partial<AllegroOffer>;
  salesChannel: "AL1" | "AL2";
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { offerPartial, salesChannel }: PatchAllegroOfferBody =
    await request.json();

  const { id } = await params;

  await editAllegroOffer(id, salesChannel, offerPartial);

  return apiResponse("Oferta na Allegro została zaktualizowana.", 200);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const salesChannel = searchParams.get("salesChannel") as "AL1" | "AL2";
  const { id } = await params;

  if (!salesChannel || !["AL1", "AL2"].includes(salesChannel)) {
    return apiResponse(
      "Parametr salesChannel jest wymagany i musi być AL1 lub AL2.",
      400
    );
  }

  const offer = await getAllegroOffer(id, salesChannel);

  return apiResponse("Oferta na Allegro została pobrana.", 200, offer);
}
