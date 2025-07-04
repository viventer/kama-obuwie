import { NextRequest } from "next/server";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { Offer } from "@/firebase/schemas/offersSchemas";
import { updateOffer } from "@/server-actions/offers/offers";
import { apiResponse } from "@/server-actions/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getDocumentFromAdminDB(id, "offers");
  if (!data) {
    return apiResponse("Oferta nie istnieje.", 404);
  }
  return apiResponse("Pobrano ofertę.", 200, data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: Partial<Offer> = await request.json();

  await updateOffer(id, body);

  return apiResponse("Oferta została zaaktualizowana.", 200);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, ref } = await getDocumentFromAdminDB("offers", id);
  if (!data) {
    return apiResponse("Oferta nie istnieje.", 404);
  }

  await ref.delete();
  return apiResponse("Oferta została usunięta.", 200);
}
