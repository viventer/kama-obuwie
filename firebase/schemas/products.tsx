import { z } from "zod";

const SizeKey = z.string().regex(/^\d+$/, {
  message: "Rozmiar musi być liczbą całkowitą w formie stringa",
});

const CmValue = z.string().regex(/^\d+\s?cm$/, {
  message: "Wartość musi być w formacie '<liczba> cm'",
});

const FirestoreId = z
  .string()
  .regex(/^(?!\.\.?$)(?!__.*__)(?!.*\/)[\s\S]{1,1500}$/, {
    message: "Nieprawidłowy identyfikator dokumentu Firestore",
  });

const NullableFirestoreId = FirestoreId.nullable().default(null);

export const SizingTableSchema = z.object({
  id: FirestoreId,
  name: z.string().min(3).max(32),
  shoeModelId: FirestoreId,
  insoleLenghts: z.record(SizeKey, CmValue),
});

export const ProductCategorySchema = z.object({
  id: FirestoreId,
  name: z.string().min(3).max(32),
  productType: z.enum(["shoe", "accessory"]),
  allegroCategoryId: FirestoreId,
  variantParameters: z.array(z.string()).default([]),
});

export const ProductSchema = z.object({
  id: FirestoreId,
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  productType: z.enum(["shoe", "accessory"]),
  rawPhotosUrl: z.array(z.string().max(256)).max(20).default([]),
  editedPhotosUrl: z.array(z.string().max(256)).max(20).default([]),
  shoeTypes: z.array(z.string().min(3).max(32)).default([]),
  colors: z.array(z.string().min(3).max(32)).default([]),
  warrantyPeriod: z.number().min(0).max(240).default(0),
  parameters: z.record(z.string(), z.string()).default({}),
  purchasePrice: z.number(),
  productCategoryId: NullableFirestoreId,
  sizingTableId: NullableFirestoreId,
  mainCategoryId: NullableFirestoreId,
  accessoriesGroupId: NullableFirestoreId,
  brandInfoId: NullableFirestoreId,
});

export const AccessoriesGroupSchema = z.object({
  id: FirestoreId,
  type: z.string().min(3).max(32),
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  samplePhotoUrl: z.string().max(256),
  connectingParameters: z.array(z.string()),
  connectedProducts: z.array(FirestoreId),
});

export const BrandInfoSchema = z.object({
  id: FirestoreId,
  brandName: z.string().min(3).max(32),
  brandDescription: z.string().min(3).max(256),
  brandLogoUrl: z.string().max(256),
  connectedProductIds: z.array(NullableFirestoreId),
});

export type SizeKey = z.infer<typeof SizeKey>;
export type CmValue = z.infer<typeof CmValue>;
export type FirestoreId = z.infer<typeof FirestoreId>;
export type NullableFirestoreId = z.infer<typeof NullableFirestoreId>;
export type SizingTable = z.infer<typeof SizingTableSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type AccessoriesGroup = z.infer<typeof AccessoriesGroupSchema>;
export type ProductType = z.infer<typeof ProductSchema>["productType"];
export type BrandInfo = z.infer<typeof BrandInfoSchema>;
