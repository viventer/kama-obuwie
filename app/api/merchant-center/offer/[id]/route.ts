import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OfferSchema, OfferWithId } from "@/firebase/schemas/offersSchemas";
import { apiErrorResponse, apiResponse } from "@/server-actions/helpers";
import {
  insertNewOfferToMerchantCenter,
  syncMerchantCenterProductAvailability,
} from "@/server-actions/merchantCenter/manageProducts";
import { updateOffer } from "@/server-actions/offers/offers";
import { NextRequest } from "next/server";
import { z } from "zod";

const PostBodySchema = z.object({
  title: OfferSchema.shape.merchantCenterData.unwrap().shape.title,
});

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

  const body = await request.json().catch(() => null);
  const parsedBody = PostBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return apiErrorResponse(
      "Nieprawidłowy tytuł oferty dla Google Merchant Center.",
      400,
      parsedBody.error.issues,
    );
  }

  const merchantCenterData = { title: parsedBody.data.title };

  try {
    await updateOffer(id, { merchantCenterData });
  } catch (err) {
    return apiErrorResponse(
      "Błąd podczas zapisywania tytułu oferty dla Google Merchant Center.",
      400,
    );
  }

  try {
    await insertNewOfferToMerchantCenter({ ...offer, merchantCenterData });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Błąd podczas dodawania oferty do Google Merchant Center (brakujące dane).";
    return apiErrorResponse(message, 400);
  }

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

  if (!offer?.isAddedToMerchantCenter) {
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
