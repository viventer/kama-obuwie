import { z } from "zod";

export type RootCategory =
  | "akcesoria"
  | "obuwie męskie"
  | "obuwie damskie"
  | "obuwie dziecięce"
  | "akcesoria dziecięce";

export const RootCategoryValues = [
  "obuwie męskie",
  "obuwie damskie",
  "obuwie dziecięce",
  "akcesoria",
  "akcesoria dziecięce",
] as const;

export const SizingTableSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(32),
  insoleLengths: z.array(
    z.object({
      size: z.number(),
      insoleLength: z.number(),
    })
  ),
});

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(32),
  rootCategory: z.enum(RootCategoryValues),
  allegroCategoryId: z.string(),
  variantParameters: z.array(z.string()).default([]),
});

export const CategorySchemaWithAllegroCategoryName = CategorySchema.merge(
  z.object({ allegroCategoryName: z.string() })
);

export const ProductSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  rawPhotosUrl: z.array(z.string().max(256)).max(20).default([]),
  editedPhotosUrl: z.array(z.string().max(256)).max(20).default([]),
  shoeTypes: z.array(z.string().min(3).max(32)).default([]),
  colors: z.array(z.string().min(3).max(32)).default([]),
  warrantyPeriod: z.number().min(0).max(240).default(0),
  parameters: z.record(z.string(), z.string()).default({}),
  purchasePrice: z.number(),
  CategoryId: z.string().optional(),
  sizingTableId: z.string().optional(),
  mainCategoryId: z.string().optional(),
  accessoriesGroupId: z.string().optional(),
  brandInfoId: z.string().optional(),
});

export const AccessoriesGroupSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(3).max(32),
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  samplePhotoUrl: z.string().max(256),
  connectingParameters: z.array(z.string()),
  connectedProducts: z.array(z.string().optional()),
});

export const BrandInfoSchema = z.object({
  id: z.string().optional(),
  brandName: z.string().min(3).max(32),
  brandDescription: z.string().min(3).max(256),
  brandLogoUrl: z.string().max(256),
  connectedProductIds: z.array(z.string().optional()),
});

export type SizingTable = z.infer<typeof SizingTableSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type AccessoriesGroup = z.infer<typeof AccessoriesGroupSchema>;
export type BrandInfo = z.infer<typeof BrandInfoSchema>;

export type SizingTableWithId = Omit<SizingTable, "id"> & { id: string };
export type CategoryWithId = Omit<Category, "id"> & { id: string };
export type ProductWithId = Omit<Product, "id"> & { id: string };
export type AccessoriesGroupWithId = Omit<AccessoriesGroup, "id"> & {
  id: string;
};
export type BrandInfoWithId = Omit<BrandInfo, "id"> & { id: string };
export type CategoryWithAllegroCategoryName = Omit<
  z.infer<typeof CategorySchemaWithAllegroCategoryName>,
  "id"
> & {
  id: string;
};

export const SizingTableUpdateDataSchema = SizingTableSchema.partial().strict();

export const CategoryUpdateDataSchema = CategorySchema.partial().strict();

export const ProductUpdateDataSchema = ProductSchema.partial().strict();

export const AccessoriesGroupUpdateDataSchema =
  AccessoriesGroupSchema.partial().strict();

export const BrandInfoUpdateDataSchema = BrandInfoSchema.partial().strict();
