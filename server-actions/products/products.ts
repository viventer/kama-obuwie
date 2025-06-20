"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Product,
  ProductPartialSchema,
  ProductSchema,
} from "@/firebase/schemas/productsSchemas";
import { withAuth } from "../auth/auth";

export const createProduct = withAuth(async function (newProduct: Product) {
  ProductSchema.parse(newProduct);

  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);

  return productRef.id;
});

export const updateProduct = withAuth(async function (
  id: string,
  updateData: Partial<Product>
) {
  ProductPartialSchema.parse(updateData);
  const productRef = adminDB.collection("products").doc(id);
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error("Produkt nie istnieje.");
  }

  await productRef.update(updateData);
});
