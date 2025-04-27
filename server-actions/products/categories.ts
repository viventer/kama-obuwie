import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Category,
  CategorySchema,
  CategoryUpdateDataSchema,
} from "@/firebase/schemas/products";

export async function createCategory(newCategory: Category) {
  CategorySchema.parse(newCategory);
  const categoryRef = adminDB.collection("categories").doc();

  await categoryRef.set(newCategory);
}

export async function updateCategory(
  id: string,
  updateData: Partial<Category>
) {
  CategoryUpdateDataSchema.parse(updateData);
  const categoryRef = adminDB.collection("categories").doc(id);
  const categoryDoc = await categoryRef.get();
  if (!categoryDoc.exists) {
    throw new Error("Kategoria nie istnieje.");
  }

  await categoryRef.update(updateData);
}
