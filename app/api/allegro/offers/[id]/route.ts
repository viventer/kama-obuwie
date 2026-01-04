import { AllegroOffer } from "@/firebase/schemas/offersSchemas";
import {
  editAllegroOffer,
  getAllegroOffer,
} from "@/server-actions/allegro/offers";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import { NextRequest } from "next/server";

export type PatchAllegroOfferBody = {
  offerPartial: Partial<AllegroOffer>;
  salesChannel: "AL1" | "AL2";
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { offerPartial, salesChannel }: PatchAllegroOfferBody =
      await request.json();

    const { id } = await params;

    await editAllegroOffer(id, salesChannel, offerPartial);

    return apiResponse("Oferta na Allegro została zaktualizowana.", 200);
  } catch (err: any) {
    if (err?.allegroErrors && err?.status) {
      return apiErrorResponse(
        "Nie udało się zaktualizować oferty na Allegro",
        err.status,
        err.allegroErrors,
        {
          step: "offer_update",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse(
      "Nie udało się zaktualizować oferty na Allegro",
      500,
      null,
      {
        step: "offer_update",
        originalMessage: err?.message,
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
  } catch (err: any) {
    if (err?.allegroErrors && err?.status) {
      return apiErrorResponse(
        "Nie udało się pobrać oferty z Allegro",
        err.status,
        err.allegroErrors,
        {
          step: "offer_get",
          originalMessage: err.message,
        }
      );
    }

    return apiErrorResponse(
      "Nie udało się pobrać oferty z Allegro",
      500,
      null,
      {
        step: "offer_get",
        originalMessage: err?.message,
      }
    );
  }
}
