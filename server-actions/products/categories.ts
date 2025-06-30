"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Category,
  CategorySchema,
  CategoryUpdateDataSchema,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";
import { revalidatePath } from "next/cache";

export const createCategory = async function (newCategory: Category) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  CategorySchema.parse(newCategory);
  const categoryRef = adminDB.collection("categories").doc();

  await categoryRef.set(newCategory);

  revalidatePath("/admin-panel/categories");
  return categoryRef.id;
};

export const updateCategory = async function (
  id: string,
  updateData: Partial<Category>
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  CategoryUpdateDataSchema.parse(updateData);
  const categoryRef = adminDB.collection("categories").doc(id);
  const categoryDoc = await categoryRef.get();
  if (!categoryDoc.exists) {
    throw new Error("Kategoria nie istnieje.");
  }

  await categoryRef.update(updateData);
  revalidatePath("/admin-panel/categories");
};
