"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Product,
  ProductPartialSchema,
  ProductSchema,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";

export const createProduct = async function (newProduct: Product) {
  verifyUser(["ADMIN", "VERIFIED"]);
  ProductSchema.parse(newProduct);

  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);

  return productRef.id;
};

export const updateProduct = async function (
  id: string,
  updateData: Partial<Product>
) {
  verifyUser(["ADMIN", "VERIFIED"]);
  ProductPartialSchema.parse(updateData);
  const productRef = adminDB.collection("products").doc(id);
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error("Produkt nie istnieje.");
  }

  await productRef.update(updateData);
};
