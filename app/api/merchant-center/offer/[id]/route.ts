import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import {
  insertNewOfferToMerchantCenter,
  syncMerchantCenterProductAvailability,
} from "@/server-actions/merchantCenter/manageProducts";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data: offer } = await getDocumentFromAdminDB<OfferWithId>(
    "offers",
    id,
  );
  if (!offer) {
    return apiErrorResponse("Oferta nie istnieje.", 404);
  }

  await insertNewOfferToMerchantCenter(offer);

  return apiResponse("Oferta została dodana do Google Merchant Center.", 200);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data: offer } = await getDocumentFromAdminDB<OfferWithId>(
    "offers",
    id,
  );

  if (!offer) {
    return apiErrorResponse("Oferta nie istnieje.", 404);
  }

  if (!offer.SKU) {
    return apiErrorResponse("Oferta nie posiada SKU.", 400);
  }

  if (!offer.isAddedToMerchantCenter) {
    return apiErrorResponse(
      "Oferta nie została jeszcze dodana do Google Merchant Center.",
      400,
    );
  }

  await syncMerchantCenterProductAvailability(offer.SKU, offer.availability);

  return apiResponse(
    "Dostępność oferty w Google Merchant Center została zaktualizowana.",
    200,
  );
}
