import { z } from "zod";

export type RootCategory =
  | "akcesoria"
  | "obuwie męskie"
  | "obuwie damskie"
  | "obuwie dziecięce"
  | "akcesoria dziecięce";

export type DescriptionVariable =
  | "rozmiar"
  | "kolor"
  | "marka"
  | "kod producenta"
  | "rozmiarówka"
  | "długość wkładki"
  | "tytuł oferty";

export const DescriptionVariables: DescriptionVariable[] = [
  "rozmiar",
  "kolor",
  "marka",
  "kod producenta",
  "rozmiarówka",
  "długość wkładki",
  "tytuł oferty",
];

export type ProductType = "obuwie" | "akcesoria";

export const RootCategoryValues = [
  "obuwie męskie",
  "obuwie damskie",
  "obuwie dziecięce",
  "akcesoria",
  "akcesoria dziecięce",
] as const;

export const ProductCreationStages = [
  "new",
  "photos",
  "photosEdit",
  "parameters",
  "description",
  "postOffer",
  "done",
] as const;

export const sizingAccuracyValues = [
  "zaniżona",
  "normalna",
  "zawyżona",
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
  sizingAccuracy: z
    .enum(["zaniżona", "normalna", "zawyżona"])
    .default("normalna"),
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
  content: z.string().optional(),
  image: z.string().optional(),
});

export const DescriptionRowSchema = z.object({
  elementsTypes: z.array(z.enum(["text", "image"])),
  elements: z.array(DescriptionElementSchema).nonempty({
    message: "DescriptionRow musi zawierać co najmniej jeden element",
  }),
});

export const DescriptionSchema = z.array(DescriptionRowSchema);

export const ColorVariantSchema = z.object({
  color: z.string().min(3).max(32),
  additionalColor: z.string().optional(),
  shade: z.string().optional(),
});

export const ProductCreationStageSchema = z.enum(ProductCreationStages);

export const RawPhotoSchema = z.object({
  colorVariantName: z.string().optional(),
  filePath: z.string(),
});

export const EditedPhotoSchema = RawPhotoSchema;

export const EditedPhotoWithUrlSchema = EditedPhotoSchema.extend({
  url: z.string(),
});

export const ParamValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
]);

export const ProductParametersSchema = z.object({
  required: z.record(z.string(), ParamValueSchema).default({}),
  optional: z.record(z.string(), ParamValueSchema).default({}),
});

export type ProductParameters = z.infer<typeof ProductParametersSchema>;

export const rangeSizeSchema = z.object({
  from: z.number(),
  to: z.number(),
});

export type RangeSize = z.infer<typeof rangeSizeSchema>;

export const ProductSchema = z.object({
  id: z.string().optional(),
  brand: z.string().max(32).optional(),
  manufacturerCode: z.string().min(3).max(32),
  productType: z.enum(["obuwie", "akcesoria"]),
  samplePhoto: z.string().optional(),
  rawPhotos: z.array(RawPhotoSchema).default([]).optional(),
  editedPhotos: z.array(EditedPhotoSchema).default([]).optional(),
  colorVariants: z.array(ColorVariantSchema).default([]).optional(),
  warrantyPeriod: z.number().max(240).default(0).optional(),
  parameters: ProductParametersSchema.default({}),
  matchingCategoriesIds: z.array(z.string()).default([]).optional(),
  rangeSizes: z.array(rangeSizeSchema).optional(),
  suggestedPrice: z.number().min(0),
  description: DescriptionSchema.default([]).optional(),
  purchasePrice: z.number().min(0),
  features: z.array(z.string()).optional(),
  otherInfo: z.string().max(128).optional(),
  rootCategory: z.enum(RootCategoryValues).optional(),
  creationStage: ProductCreationStageSchema,
  categoryId: z.string().optional(),
  sizingTableId: z.string().optional(),
  accessoriesGroupId: z.string().optional(),
  brandInfoId: z.string().optional(),
});

export const ProductPartialSchema = ProductSchema.partial();

export const AccessoriesGroupSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(3).max(32),
  brand: z.string().min(3).max(32),
  productName: z.string().min(3).max(32),
  samplePhoto: z.string(),
  connectingParameters: z.array(z.string()),
});

export const BrandInfoSchema = z.object({
  id: z.string().optional(),
  brandName: z.string().min(3).max(32),
  brandDescription: z.string().min(3).max(256),
  brandLogo: z.string().optional(),
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

export type ColorVariant = z.infer<typeof ColorVariantSchema>;

export type ProductCreationStage = z.infer<typeof ProductCreationStageSchema>;

export type RawPhoto = z.infer<typeof RawPhotoSchema>;
export type EditedPhoto = z.infer<typeof EditedPhotoSchema>;
export type EditedPhotoWithUrl = z.infer<typeof EditedPhotoWithUrlSchema>;

export type ProductWithStatus = ProductWithId & { isReady: boolean };

export const SizingTableUpdateDataSchema = SizingTableSchema.partial().strict();

export const CategoryUpdateDataSchema = CategorySchema.partial().strict();

export const ProductUpdateDataSchema = ProductSchema.partial().strict();

export const AccessoriesGroupUpdateDataSchema =
  AccessoriesGroupSchema.partial().strict();

export const BrandInfoUpdateDataSchema = BrandInfoSchema.partial().strict();
