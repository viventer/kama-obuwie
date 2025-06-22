"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Category,
  CategorySchema,
  CategoryUpdateDataSchema,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";

export const createCategory = async function (newCategory: Category) {
  verifyUser(["ADMIN", "VERIFIED"]);
  CategorySchema.parse(newCategory);
  const categoryRef = adminDB.collection("categories").doc();

  await categoryRef.set(newCategory);

  return categoryRef.id;
};

export const updateCategory = async function (
  id: string,
  updateData: Partial<Category>
) {
  verifyUser(["ADMIN", "VERIFIED"]);
  CategoryUpdateDataSchema.parse(updateData);
  const categoryRef = adminDB.collection("categories").doc(id);
  const categoryDoc = await categoryRef.get();
  if (!categoryDoc.exists) {
    throw new Error("Kategoria nie istnieje.");
  }

  await categoryRef.update(updateData);
};
