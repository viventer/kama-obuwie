"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";
import { withAuth } from "../auth/auth";

export const createOffer = withAuth(
  ["ADMIN", "VERIFIED"],
  async function (newOffer: Partial<Offer>) {
    OfferSchema.partial().parse(newOffer);

    const offerRef = adminDB.collection("offers").doc();

    await offerRef.set({ ...newOffer, id: offerRef.id });

    return offerRef.id;
  }
);

export const updateOffer = withAuth(
  ["ADMIN", "VERIFIED"],
  async function (id: string, updateData: Partial<Offer>) {
    OfferSchema.partial().parse(updateData);
    const offerRef = adminDB.collection("offers").doc(id);
    const productDoc = await offerRef.get();
    if (!productDoc.exists) {
      throw new Error("Oferta nie istnieje.");
    }

    await offerRef.update(updateData);
  }
);
