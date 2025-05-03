"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { Product, ProductSchema } from "@/firebase/schemas/products";

export async function createProduct(newProduct: Product) {
  ProductSchema.parse(newProduct);
  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);

  return productRef.id;
}

export async function updateProduct(id: string, updateData: Partial<Product>) {
  ProductSchema.parse(updateData);
  const productRef = adminDB.collection("products").doc(id);
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error("Produkt nie istnieje.");
  }

  await productRef.update(updateData);
}
