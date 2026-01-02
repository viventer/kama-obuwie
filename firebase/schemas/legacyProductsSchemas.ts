import { z } from "zod";

import {
  ColorVariantSchema,
  ProductParametersSchema,
} from "./productsSchemas";
import { AllegroOfferSchema } from "./offersSchemas";

export const LegacyProductSchema = z.object({
  id: z.string().optional(),
  signature: z.string().min(1).optional(),

  sizingTableId: z.string().optional(),

  manufacturerCode: z.string().optional(),
  brand: z.string().optional(),
  colorVariantName: z.string().optional(),

  colorVariants: z.array(ColorVariantSchema).default([]).optional(),
  parameters: ProductParametersSchema.default({}).optional(),

  // ID dokumentu z kolekcji `categories`
  categoryId: z.string().optional(),

  // Zdjęcia do sklepu: { [colorVariantName]: [url1, url2, ...] }
  imagesUrls: z.record(z.string(), z.array(z.string().url())).optional(),

  // Snapshoty ofert z Allegro do odtwarzania: { AL1: { "41": AllegroOffer }, AL2: { ... } }
  offerTemplates: z
    .object({
      AL1: z.record(z.string(), AllegroOfferSchema),
      AL2: z.record(z.string(), AllegroOfferSchema),
    })
    .partial()
    .optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type LegacyProduct = z.infer<typeof LegacyProductSchema>;
export type LegacyProductWithId = LegacyProduct & { id: string };
