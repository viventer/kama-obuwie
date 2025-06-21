"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Category,
  CategorySchema,
  CategoryUpdateDataSchema,
} from "@/firebase/schemas/productsSchemas";
import { withAuth } from "../auth/auth";

export const createCategory = withAuth(
  ["ADMIN", "VERIFIED"],
  async function (newCategory: Category) {
    CategorySchema.parse(newCategory);
    const categoryRef = adminDB.collection("categories").doc();

    await categoryRef.set(newCategory);

    return categoryRef.id;
  }
);

export const updateCategory = withAuth(
  ["ADMIN", "VERIFIED"],
  async function (id: string, updateData: Partial<Category>) {
    CategoryUpdateDataSchema.parse(updateData);
    const categoryRef = adminDB.collection("categories").doc(id);
    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      throw new Error("Kategoria nie istnieje.");
    }

    await categoryRef.update(updateData);
  }
);
