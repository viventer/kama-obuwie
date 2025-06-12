"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";

export async function createOffer(newOffer: Partial<Offer>) {
  OfferSchema.partial().parse(newOffer);

  const offerRef = adminDB.collection("offers").doc();

  await offerRef.set({ ...newOffer, id: offerRef.id });

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
