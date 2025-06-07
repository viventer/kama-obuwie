import { z } from "zod";
import { SalesChannelSchema } from "./otherSchemas";

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
  salesChannel: SalesChannelSchema,
  allegroId: z.string().optional(),
  rates: z.array(shippingRateSchema),
});

export const SellingPriceSchema = z.object({
  salesChannel: SalesChannelSchema,
  value: z.number().min(1).max(10000),
});

export const AvailabilitySchema = z.object({
  size: z.number().optional(),
  value: z.number().min(0).max(1000),
  isActive: z.boolean(),
  allegroProductIds: z.array(
    z.object({
      value: z.string(),
      salesChannel: z.enum(["AL1", "AL2"]),
    })
  ),
});

export const OfferSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(75),
  productId: z.string(),
  signature: z.string(), // manufacturer code + color variant name
  colorVariantName: z.string().optional(),
  sellingPrices: z.array(SellingPriceSchema),
  initialSellingPrices: z.array(SellingPriceSchema),
  statsId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  shippingRates: ShippingRatesSchema,
  availability: z.array(AvailabilitySchema).min(1),
  allegroOffersIds: z.array(z.string()).optional(),
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

export type ShippingRate = z.infer<typeof shippingRateSchema>;
export type ShippingRates = z.infer<typeof ShippingRatesSchema>;
export type SellingPrice = z.infer<typeof SellingPriceSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Offer = z.infer<typeof OfferSchema>;
