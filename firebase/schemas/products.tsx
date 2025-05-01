import { z } from "zod";

const FirestoreId = z
  .string()
  .regex(/^(?!\.\.?$)(?!__.*__)(?!.*\/)[\s\S]{1,1500}$/, {
    message: "Nieprawidłowy identyfikator dokumentu Firestore",
  });

const NullableFirestoreId = FirestoreId.nullable().default(null);

export type RootCategory =
  | "accessories"
  | "male"
  | "female"
  | "children"
  | "childrenAccessories";

export const RootCategoryValues = [
  "accessories",
  "male",
  "female",
  "children",
  "childrenAccessories",
] as const;

export const SizingTableSchema = z.object({
  name: z.string().min(3).max(32),
  insoleLengths: z.array(
    z.object({
      size: z.number(),
      insoleLength: z.number(),
    })
  ),
});

export const CategorySchema = z.object({
  name: z.string().min(3).max(32),
  productType: z.enum(["shoe", "accessory"]),
  rootCategory: z.enum(RootCategoryValues),
  allegroCategoryId: FirestoreId,
  variantParameters: z.array(z.string()).default([]),
});

export const ProductSchema = z.object({
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
  CategoryId: NullableFirestoreId,
  sizingTableId: NullableFirestoreId,
  mainCategoryId: NullableFirestoreId,
  accessoriesGroupId: NullableFirestoreId,
  brandInfoId: NullableFirestoreId,
});

export const AccessoriesGroupSchema = z.object({
  type: z.string().min(3).max(32),
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  samplePhotoUrl: z.string().max(256),
  connectingParameters: z.array(z.string()),
  connectedProducts: z.array(FirestoreId),
});

export const BrandInfoSchema = z.object({
  brandName: z.string().min(3).max(32),
  brandDescription: z.string().min(3).max(256),
  brandLogoUrl: z.string().max(256),
  connectedProductIds: z.array(NullableFirestoreId),
});

type WithId<T> = T & { id: FirestoreId };

export type FirestoreId = z.infer<typeof FirestoreId>;
export type NullableFirestoreId = z.infer<typeof NullableFirestoreId>;
export type SizingTable = WithId<z.infer<typeof SizingTableSchema>>;
export type Category = WithId<z.infer<typeof CategorySchema>>;
export type Product = WithId<z.infer<typeof ProductSchema>>;
export type AccessoriesGroup = WithId<z.infer<typeof AccessoriesGroupSchema>>;
export type ProductType = z.infer<typeof ProductSchema>["productType"];
export type BrandInfo = WithId<z.infer<typeof BrandInfoSchema>>;

export const SizingTableUpdateDataSchema = SizingTableSchema.partial().strict();

export const CategoryUpdateDataSchema = CategorySchema.partial().strict();

export const ProductUpdateDataSchema = ProductSchema.partial().strict();

export const AccessoriesGroupUpdateDataSchema =
  AccessoriesGroupSchema.partial().strict();

export const BrandInfoUpdateDataSchema = BrandInfoSchema.partial().strict();
