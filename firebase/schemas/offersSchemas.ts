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
  productId: z.string().nullable(),
  legacyProductId: z.string().nullable().optional(),
  thumbnail: z.string().optional(),
  signature: z.string(), // brand + manufacturer code + color variant name
  colorVariantName: z.string().optional(),
  sellingPrices: z.record(SalesChannelSchema, z.string()),
  initialSellingPrices: z.record(SalesChannelSchema, z.string()),
  statsId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  shippingRates: z.record(SalesChannelSchema, ShippingRatesSchema),
  returnPolicy: z.record(SalesChannelSchema, z.string()).optional(),
  warranty: z.record(SalesChannelSchema, z.string().optional()).optional(),
  impliedWarranty: z.record(SalesChannelSchema, z.string()).optional(),
  availability: z.record(z.string(), AvailabilitySchema),
  allegroOffersIds: z
    .record(z.enum(["AL1", "AL2"]), z.record(z.string(), z.string()))
    .optional(), // { AL1: { 41: "offerId1" }, AL2: { 42: "offerId2" } }
  offerGroupId: z.string().optional(),
  allegroProductsIds: z
    .array(
      z.object({
        value: z.string(),
        salesChannel: z.enum(["AL1", "AL2"]),
        size: z.string(),
      }),
    )
    .optional(),
  EAN: z.record(z.string(), z.string().optional()).optional(), // { "31": "1234567890123", "32": "9876543210987" }
  SKU: z.string().optional(),
  isAddedToMerchantCenter: z.boolean().optional(),
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
    valuesIds: z.array(z.string()).optional(),
  }),
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
      responsiblePerson: z
        .object({
          name: z.string(),
          id: z.string().optional(),
        })
        .optional(),
      responsibleProducer: z
        .object({
          type: z.literal("NAME"),
          name: z.string(),
        })
        .optional(),
      safetyInformation: z
        .object({
          type: z.literal("TEXT"),
          description: z.string().max(5000),
        })
        .optional(),
    }),
  ),
  sellingMode: z.object({
    price: z.object({
      amount: z.string(),
      currency: z.enum(["PLN"]),
    }),
  }),
  stock: z.object({
    available: z.number().min(0).max(1000),
    unit: z.enum(["UNIT", "PAIR", "SET"]),
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
  sizeTable: z
    .object({
      id: z.string(),
      name: z.string().optional(),
    })
    .optional(),
  name: z.string().optional(),
});

export const PostOfferFormSchema = OfferSchema.pick({
  sellingPrices: true,
  shippingRates: true,
  availability: true,
  returnPolicy: true,
  warranty: true,
  impliedWarranty: true,
}).extend({
  title: z.record(z.string(), z.string().min(12).max(72)),
  EAN: z
    .record(z.string(), z.record(z.string(), z.string().optional()))
    .optional(),
});

export const AllegroOfferFromListingSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.object({
    id: z.string(),
  }),
  primaryImage: z.object({
    url: z.string(),
  }),
  sellingMode: z.object({
    format: z.enum(["BUY_NOW", "AUCTION", "ADVERTISEMENT"]),
    price: z.object({
      amount: z.string(),
      currency: z.string(),
    }),
  }),
  saleInfo: z
    .object({
      currentPrice: z.object({
        amount: z.string(),
        currency: z.string(),
      }),
    })
    .optional(),
  stock: z.object({
    available: z.number().min(0),
    sold: z.number().min(0),
  }),
  stats: z
    .object({
      watchersCount: z.number().min(0),
      visitsCount: z.number().min(0),
    })
    .nullable(),
  publication: z.object({
    status: z.enum(["INACTIVE", "ACTIVATING", "ACTIVE", "ENDED"]),
    startingAt: z.string().optional(),
    startedAt: z.string().optional(),
    endingAt: z.string().optional(),
    endedAt: z.string().optional(),
    marketplaces: z.object({
      base: z.object({}),
      additional: z.array(z.object({})),
    }),
  }),
  afterSalesServices: z.object({
    impliedWarranty: z.object({
      id: z.string(),
    }),
    returnPolicy: z.object({
      id: z.string(),
    }),
    warranty: z.object({
      id: z.string(),
    }),
  }),
  additionalServices: z.object({
    id: z.string(),
  }),
  external: z.object({
    id: z.string().max(100),
  }),
  delivery: z.object({
    shippingRates: z.object({
      id: z.string(),
    }),
  }),
  b2b: z.object({
    buyableOnlyByBusiness: z.boolean(),
  }),
  fundraisingCampaign: z
    .object({
      id: z.string(),
    })
    .optional(),
});

export type ShippingRate = z.infer<typeof shippingRateSchema>;
export type ShippingRates = z.infer<typeof ShippingRatesSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type AllegroOffer = z.infer<typeof AllegroOfferSchema>;
export type AllegroOfferFromListing = z.infer<
  typeof AllegroOfferFromListingSchema
>;
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
