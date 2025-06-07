"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";

export async function createOffer(newOffer: Offer) {
  OfferSchema.parse(newOffer);

  const offerRef = adminDB.collection("offers").doc();

  await offerRef.set(newOffer);

  return offerRef.id;
}

export async function updateOffer(id: string, updateData: Partial<Offer>) {
  OfferSchema.partial().parse(updateData);
  const offerRef = adminDB.collection("offers").doc(id);
  const productDoc = await offerRef.get();
  if (!productDoc.exists) {
    throw new Error("Oferta nie istnieje.");
  }

  await offerRef.update(updateData);
}
