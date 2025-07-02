import { z } from "zod";
import { SalesChannelSchema } from "./otherSchemas";
import { ParamValueSchema } from "./productsSchemas";

export const shippingRateSchema = z.object({
  name: z.string().min(3).max(64),
  deliveryMethod: z.object({
    id: z.string(),
  }),
  maxQuantityPerPackage: z.number().min(1),
  maxPackageWeight: z.object({
    value: z.string(),
    unit: z.enum(["KILOGRAM"]),
  }),
  firstItemRate: z.object({
    amount: z.string(),
    currency: z.enum(["PLN"]),
  }),
  nextItemRate: z.object({
    amount: z.string(),
    currency: z.enum(["PLN"]),
  }),
  shippingTime: z.object({
    from: z.string(), // ISO 8601
    to: z.string(),
  }),
});

export const ShippingRatesSchema = z.object({
  allegroId: z.string(),
  rates: z.array(shippingRateSchema).optional(),
});

export const AvailabilitySchema = z.object({
  value: z.string(),
  allegroOffersIds: z.record(z.enum(["AL1", "AL2"]), z.string()).optional(),
});

export const OfferSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(72),
  productId: z.string(),
  signature: z.string(), // brand + manufacturer code + color variant name
  colorVariantName: z.string().optional(),
  sellingPrices: z.record(SalesChannelSchema, z.string()),
  initialSellingPrices: z.record(SalesChannelSchema, z.string()),
  statsId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  shippingRates: z.record(SalesChannelSchema, ShippingRatesSchema),
  returnPolicy: z.record(SalesChannelSchema, z.string()).optional(),
  warranty: z.record(SalesChannelSchema, z.string()).optional(),
  impliedWarranty: z.record(SalesChannelSchema, z.string()).optional(),
  availability: z.record(z.string(), AvailabilitySchema),
  allegroOffersIds: z
    .record(z.enum(["AL1", "AL2"]), z.record(z.string(), z.string()))
    .optional(), // { AL1: { 41: "offerId1" }, AL2: { 42: "offerId2" } }
  offerGroupId: z.string().optional(),
  isPosted: z.object({
    salesChannel: SalesChannelSchema,
    value: z.boolean(),
  }),
  allegroProductsIds: z
    .array(
      z.object({
        value: z.string(),
        salesChannel: z.enum(["AL1", "AL2"]),
        size: z.number(),
      })
    )
    .optional(),
});

export const AllegroDescriptionItemSchema = z.object({
  type: z.enum(["TEXT", "IMAGE"]),
  content: z.string().optional(),
  url: z.string().url().optional(),
});

export const AllegroDescriptionSectionSchema = z.object({
  items: z.array(AllegroDescriptionItemSchema).min(1),
});

export const AllegroOfferDescriptionSchema = z.object({
  sections: z.array(AllegroDescriptionSectionSchema).min(1),
});

export const AllegroOfferParametersSchema = z.array(
  z.object({
    name: z.string(),
    values: z.array(ParamValueSchema),
  })
);

export const AllegroOfferSchema = z.object({
  productSet: z.array(
    z.object({
      product: z.object({
        name: z.string().min(3).max(75),
        category: z.object({
          id: z.string(),
        }),
        parameters: AllegroOfferParametersSchema,
        images: z.array(z.string().url()),
      }),
      marketedBeforeGPSRObligation: z.boolean().optional(),
    })
  ),
  sellingMode: z.object({
    price: z.object({
      amount: z.string(),
      currency: z.enum(["PLN"]),
    }),
  }),
  stock: z.object({
    available: z.number().min(0).max(1000),
  }),
  delivery: z.object({
    handlingTime: z.enum(["PT24H", "P2D", "P3D", "PT0S"]).optional(),
    shippingRates: z.object({
      id: z.string(),
      name: z.string().optional(),
    }),
  }),
  description: AllegroOfferDescriptionSchema,
  external: z
    .object({
      id: z.string(),
    })
    .optional(),
  images: z.array(z.string().url()).optional(),
  afterSalesServices: z.object({
    warranty: z
      .object({
        // gwarancja
        id: z.string(),
        name: z.string().optional(),
      })
      .optional(),
    impliedWarranty: z.object({
      // warunki reklamacji
      id: z.string(),
      name: z.string().optional(),
    }),
    returnPolicy: z.object({
      id: z.string(),
      name: z.string().optional(),
    }),
  }),
});

export const PostOfferFormSchema = OfferSchema.pick({
  title: true,
  sellingPrices: true,
  shippingRates: true,
  availability: true,
  returnPolicy: true,
  warranty: true,
  impliedWarranty: true,
});

export type ShippingRate = z.infer<typeof shippingRateSchema>;
export type ShippingRates = z.infer<typeof ShippingRatesSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type AllegroOffer = z.infer<typeof AllegroOfferSchema>;
export type AllegroDescriptionSection = z.infer<
  typeof AllegroDescriptionSectionSchema
>;
export type AllegroOfferDescription = z.infer<
  typeof AllegroOfferDescriptionSchema
>;
export type AllegroOfferParameters = z.infer<
  typeof AllegroOfferParametersSchema
>;

export type OfferWithId = Omit<Offer, "id"> & { id: string };
