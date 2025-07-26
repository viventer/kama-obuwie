"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";
import { AuthorizationError, verifyUser } from "../auth/auth";
import { PostOfferBody } from "@/app/api/allegro/offers/route";
import { PostOfferFormValues } from "@/components/adminPanel/offers/PostOfferForm";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";

export const createOffer = async function (newOffer: Partial<Offer>) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OfferSchema.partial().parse(newOffer);

  if (newOffer?.signature) {
    const existingOfferQuery = await adminDB
      .collection("offers")
      .where("signature", "==", newOffer.signature)
      .limit(1)
      .get();

    if (!existingOfferQuery.empty) {
      return existingOfferQuery.docs[0].id;
    }
  }

  const offerRef = adminDB.collection("offers").doc();

  await offerRef.set({ ...newOffer, id: offerRef.id });

  return offerRef.id;
};

export const updateOffer = async function (
  id: string,
  updateData: Partial<Offer>
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  OfferSchema.partial().parse(updateData);
  const offerRef = adminDB.collection("offers").doc(id);
  const productDoc = await offerRef.get();
  if (!productDoc.exists) {
    throw new Error("Oferta nie istnieje.");
  }

  await offerRef.update(updateData);
};

export const getPostOfferBody = async ({
  formDataWithoutTitlesAndEAN,
  productData,
  oldOfferData,
  sizingTable,
}: {
  formDataWithoutTitlesAndEAN: Omit<PostOfferFormValues, "title" | "EAN">;
  productData: ProductWithId;
  oldOfferData: OfferWithId;
  sizingTable: SizingTableWithId;
}): Promise<Omit<PostOfferBody, "colorVariant" | "images">> => {
  const { data: category } = await getDocumentFromAdminDB<CategoryWithId>(
    "categories",
    productData.categoryId as string
  );

  const allegroCategoryId = category?.allegroCategoryId as string;

  return {
    offer: {
      ...oldOfferData,
      ...formDataWithoutTitlesAndEAN,
    },
    product: productData,
    allegroCategoryId,
    sizingTable,
  };
};
