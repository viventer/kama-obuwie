"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../auth/auth";

export const createOffer = async function (newOffer: Partial<Offer>) {
  verifyUser(["ADMIN", "VERIFIED"]);
  OfferSchema.partial().parse(newOffer);

  const offerRef = adminDB.collection("offers").doc();

  await offerRef.set({ ...newOffer, id: offerRef.id });

  return offerRef.id;
};

export const updateOffer = async function (
  id: string,
  updateData: Partial<Offer>
) {
  verifyUser(["ADMIN", "VERIFIED"]);
  OfferSchema.partial().parse(updateData);
  const offerRef = adminDB.collection("offers").doc(id);
  const productDoc = await offerRef.get();
  if (!productDoc.exists) {
    throw new Error("Oferta nie istnieje.");
  }

  await offerRef.update(updateData);
};
