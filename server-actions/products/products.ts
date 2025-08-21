"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  Product,
  ProductPartialSchema,
  ProductSchema,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { verifyUser } from "../auth/auth";

export const createProduct = async function (newProduct: Product) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  ProductSchema.partial().parse(newProduct);

  const productRef = adminDB.collection("products").doc();

  await productRef.set(newProduct);

  return productRef.id;
};

export const updateProduct = async function (
  id: string,
  updateData: Partial<Product>
) {
  await verifyUser(["ADMIN", "VERIFIED"]);

  ProductPartialSchema.parse(updateData);
  const productRef = adminDB.collection("products").doc(id);
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error("Produkt nie istnieje.");
  }

  await productRef.update(updateData);
};

export const getProductBySKU = async function (
  sku: string
): Promise<ProductWithId | null> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  if (!sku || sku.trim() === "") {
    throw new Error("SKU nie może być pusty.");
  }

  const products = await getDocumentsFromAdminDB<Product>("products");

  if (!products) {
    return null;
  }

  for (const product of products) {
    if (product.SKU) {
      const skuValues = Object.values(product.SKU);
      if (skuValues.includes(sku)) {
        return product as ProductWithId;
      }
    }
  }

  return null;
};
