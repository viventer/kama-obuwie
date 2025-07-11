import { z } from "zod";
import { SalesChannelSchema } from "./otherSchemas";

export const PaymentTypeSchema = z.enum([
  "CASH_ON_DELIVERY",
  "WIRE_TRANSFER",
  "ONLINE",
  "SPLIT_PAYMENT",
  "EXTENDED_TERM",
]);

export const PaymentProviderSchema = z.enum([
  "PAYU",
  "P24",
  "AF",
  "OFFLINE",
  "EPT",
]);

export const AllegroOrderStatusSchema = z.enum([
  "BOUGHT",
  "FILLED_IN",
  "READY_FOR_PROCESSING",
  "CANCELLED",
]);

export const FulfillmentStatusSchema = z.enum([
  "NEW",
  "PROCESSING",
  "READY_FOR_SHIPMENT",
  "READY_FOR_PICKUP",
  "SENT",
  "PICKED_UP",
  "CANCELLED",
  "SUSPENDED",
  "RETURNED", // status that can't be set by the seller
]);

export const DiscountSchema = z.enum([
  "BUNDLE",
  "UNIT_PERCENTAGE_DISCOUNT",
  "WHOLESALE_PRICE_LIST",
  "LARGE_ORDER_DISCOUNT",
  "TURNOVER_DISCOUNT",
  "COUPON",
  "CAMPAIGN",
]);

export type PaymentType = z.infer<typeof PaymentTypeSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type AllegroOrderStatus = z.infer<typeof AllegroOrderStatusSchema>;
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type AllegroOrder = z.infer<typeof AllegroOrderSchema>;

export const PriceSchema = z.object({
  amount: z.string(),
  currency: z.enum(["PLN"]),
});

export const BuyerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  login: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  guest: z.boolean(),
  preferences: z.object({
    language: z.string().optional(),
  }),
});

export const PaymentSchema = z.object({
  id: z.string(),
  type: PaymentTypeSchema,
  provider: PaymentProviderSchema,
  finishedAt: z.string().optional(),
  paidAmount: PriceSchema,
  reconcilation: PriceSchema.optional(),
});

export const AddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  street: z.string(),
  city: z.string(),
  zipCode: z.string(), // postal code
  countryCode: z.string().length(2), // ISO 3166-1 alpha-2
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const OrderDeliveryDataSchema = z.object({
  address: AddressSchema,
  method: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  pickupPoint: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string(),
        countryCode: z.string().length(2),
      }),
    })
    .optional(),
  cost: PriceSchema.optional(),
  smart: z.boolean().optional(),
  calculatedNumberOfPackages: z.number().optional(),
});

export const InvoiceInfoSchema = z.object({
  required: z.boolean(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
    countryCode: z.string().length(2),
    company: z.object({
      name: z.string(),
      ids: z
        .array(
          z.object({
            type: z.enum(["PL_NIP", "VAT_EU", "OTHER"]),
            value: z.string(),
          })
        )
        .optional(),
      vatPayerStatus: z.enum(["ACTIVE", "NON_ACTIVE", "NOT_APPLICABLE"]),
    }),
    naturalPerson: z
      .object({
        firstName: z.string(),
        lastName: z.string(),
      })
      .optional(),
  }),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  offer: z.object({
    id: z.string(),
    allegroId: z.string().optional(),
    name: z.string().optional(),
    signature: z.string(),
  }),
  quantity: z.number().min(1),
  originalPrice: PriceSchema,
  price: PriceSchema,
  reconcilation: z.object({
    value: PriceSchema,
    type: z.enum(["BILLING", "WALLET"]),
    quantity: z.number().optional(), // quantity of reconciled items
  }),
  discount: z.array(DiscountSchema).optional(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  allegroId: z.string().optional(), // checkout form id
  messageToSeller: z.string().optional(),
  buyer: BuyerSchema,
  payment: PaymentSchema.optional(),
  allegroStatus: AllegroOrderStatusSchema,
  fulfillment: z
    .object({
      status: FulfillmentStatusSchema,
    })
    .optional(),
  delivery: OrderDeliveryDataSchema.optional(),
  invoce: InvoiceInfoSchema.optional(),
  lineItems: z.array(OrderItemSchema).min(1),
  surcharges: z.array(PaymentSchema),
  summary: z.object({
    totalToPay: PriceSchema,
  }),
  updatedAt: z.string().optional(),
  salesChannel: SalesChannelSchema,
});

export const AllegroOrderItemSchema = z.object({
  id: z.string(),
  offer: z.object({
    id: z.string(),
    name: z.string().optional(),
    external: z
      .object({
        id: z.string().optional(),
      })
      .optional(),
  }),
  quantity: z.number().min(1),
  originalPrice: PriceSchema,
  price: PriceSchema,
  reconcilation: z.object({
    value: PriceSchema,
    type: z.enum(["BILLING", "WALLET"]),
    quantity: z.number().optional(),
  }),
  discount: z.array(DiscountSchema).optional(),
});

export const AllegroOrderSchema = z.object({
  id: z.string(), // checkout form id
  messageToSeller: z.string().optional(),
  buyer: BuyerSchema,
  payment: PaymentSchema.optional(),
  status: FulfillmentStatusSchema,
  fulfillment: z
    .object({
      status: FulfillmentStatusSchema,
    })
    .optional(),
  delivery: OrderDeliveryDataSchema.optional(),
  invoce: InvoiceInfoSchema.optional(),
  lineItems: z.array(AllegroOrderItemSchema).min(1),
  surcharges: z.array(PaymentSchema),
  summary: z.object({
    totalToPay: PriceSchema,
  }),
  updatedAt: z.string().optional(),
});
