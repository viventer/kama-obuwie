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

export const DescriptionElementSchema = z.object({
  type: z.enum(["text", "image"]),
  content: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const DescriptionRowSchema = z.array(DescriptionElementSchema).nonempty({
  message: "DescriptionRow musi zawierać co najmniej jeden element",
});

export const DescriptionSchema = z.array(DescriptionRowSchema);

export const ProductSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(3).max(32),
  manufacturerCode: z.string().min(3).max(32),
  productType: z.enum(["obuwie", "akcesoria"]),
  samplePhotoUrl: z.string().url().optional(),
  rawPhotosUrl: z.array(z.string().url()).max(20).default([]).optional(),
  editedPhotosUrl: z.array(z.string().url()).max(20).default([]).optional(),
  shoeTypes: z.array(z.string().min(3).max(32)).default([]).optional(),
  colors: z.array(z.string().min(3).max(32)).default([]).optional(),
  warrantyPeriod: z.number().min(0).max(240).default(0).optional(),
  parameters: z.record(z.string(), z.string()).default({}).optional(),
  description: DescriptionSchema.default([]).optional(),
  purchasePrice: z.number(),
  creationStage: z.enum([
    "new",
    "photos",
    "photosEdit",
    "parameters",
    "description",
    "postOffer",
    "done",
  ]),
  categoryId: z.string().optional(),
  sizingTableId: z.string().optional(),
  accessoriesGroupId: z.string().optional(),
  brandInfoId: z.string().optional(),
});

export const AccessoriesGroupSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(3).max(32),
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  samplePhotoUrl: z.string().url(),
  connectingParameters: z.array(z.string()),
});

export const BrandInfoSchema = z.object({
  id: z.string().optional(),
  brandName: z.string().min(3).max(32),
  brandDescription: z.string().min(3).max(256),
  brandLogoUrl: z.string().url().optional(),
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

export type DescriptionElement = z.infer<typeof DescriptionElementSchema>;
export type DescriptionRow = z.infer<typeof DescriptionRowSchema>;
export type Description = z.infer<typeof DescriptionSchema>;

export const SizingTableUpdateDataSchema = SizingTableSchema.partial().strict();

export const CategoryUpdateDataSchema = CategorySchema.partial().strict();

export const ProductUpdateDataSchema = ProductSchema.partial().strict();

export const AccessoriesGroupUpdateDataSchema =
  AccessoriesGroupSchema.partial().strict();

export const BrandInfoUpdateDataSchema = BrandInfoSchema.partial().strict();
