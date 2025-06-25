"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer, OfferSchema } from "@/firebase/schemas/offersSchemas";
import { verifyUser } from "../auth/auth";
import { PostOfferBody } from "@/app/api/allegro/offers/route";
import { EditOfferFormValues } from "@/components/adminPanel/offers/EditOfferForm";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";

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

export const getPostOfferBody = async ({
  formData,
  productData,
  oldOfferData,
  sizingTable,
}: {
  formData: EditOfferFormValues;
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
      ...formData,
    },
    product: productData,
    allegroCategoryId,
    sizingTable,
  };
};
