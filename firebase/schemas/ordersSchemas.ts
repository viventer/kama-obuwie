import { z } from "zod";
import { SalesChannelSchema } from "./otherSchemas";
import { CheckoutDataSchema, PaymentMethodSchema } from "./checkoutSchemas";
import { ShoppingCartItemSchema } from "./shoppingCartSchemas";
import { AddressSchema, PickupPointSchema, PriceSchema } from "./commonSchemas";

export const AllegroPaymentTypeSchema = z.enum([
  "CASH_ON_DELIVERY",
  "WIRE_TRANSFER",
  "ONLINE",
  "SPLIT_PAYMENT",
  "EXTENDED_TERM",
]);

export const PaymentTypeSchema = z.enum(["COD", "P24", "ALLEGRO_ONLINE"]);

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
  "UNPAID",
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

export const OrderPhaseSchema = z.enum([
  "unpaid",
  "new",
  "processing",
  "ready_for_shipment",
  "sent",
  "cancelled",
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

const RefundReasonSchema = z.enum([
  "REFUND",
  "COMPLAINT",
  "PRODUCT_NOT_AVAILABLE",
  "PAID_VALUE_TOO_LOW",
  "OVERPAID",
  "CANCELLED_BY_BUYER",
  "NOT_COLLECTED",
]);

export const BuyerSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  login: z.string().optional(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  companyName: z.string().nullable(),
  guest: z.boolean(),
  preferences: z.object({
    language: z.string().nullable(),
  }),
});

export const AllegroPaymentSchema = z.object({
  id: z.string(),
  type: AllegroPaymentTypeSchema,
  provider: PaymentProviderSchema.nullable().optional(),
  finishedAt: z.string().nullable(),
  paidAmount: PriceSchema.nullable(),
  reconcilation: PriceSchema.nullable().optional(),
});

export const OrderDeliveryDataSchema = z.object({
  address: AddressSchema.optional(),
  method: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  pickupPoint: PickupPointSchema.nullable(),
  cost: PriceSchema.nullable(),
  smart: z.boolean().nullable(),
  calculatedNumberOfPackages: z.number().nullable(),
});

export const InvoiceInfoSchema = z.object({
  required: z.boolean(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
    countryCode: z.string().length(2),
    company: z
      .object({
        name: z.string(),
        ids: z
          .array(
            z.object({
              type: z.enum(["PL_NIP", "VAT_EU", "OTHER"]),
              value: z.string(),
            })
          )
          .nullable(),
        vatPayerStatus: z.enum(["ACTIVE", "NON_ACTIVE", "NOT_APPLICABLE"]),
      })
      .optional()
      .nullable(),
    naturalPerson: z
      .object({
        firstName: z.string(),
        lastName: z.string(),
      })
      .nullable(),
  }),
  isAdded: z.boolean().optional(),
  sendingMethod: z.enum(["inBox", "allegro", "email"]).optional(),
});

export const OrderItemSchema = z.object({
  id: z.string(),
  offer: z.object({
    thumbnail: z.string().url(),
    id: z.string().nullable(), // null in case of accessories
    allegroId: z.string().nullable(),
    name: z.string().nullable(),
    signature: z.string(),
    size: z.string().nullable(),
    SKU: z.string().nullable(),
  }),
  quantity: z.number().min(1),
  originalPrice: PriceSchema,
  price: PriceSchema,
  reconcilation: z
    .object({
      value: PriceSchema,
      type: z.enum(["BILLING", "WALLET"]),
      quantity: z.number().nullable(),
    })
    .nullable(),
  discount: z.array(DiscountSchema).nullable(),
});

export const RefundItemSchema = z.object({
  id: z.string(), // line item id
  type: z.enum(["AMOUNT", "QUANTITY"]),
  quantity: z.number().optional(), // required if type is "QUANTITY"
  value: PriceSchema.optional(), // required if type is "AMOUNT"
});

export const RefundDocumentItemSchema = z.object({
  quantity: z.number().int().min(1),
  value: z.string(),
  name: z.string(),
});

export const RefundDocumentSchema = z.object({
  items: z.array(RefundDocumentItemSchema),
  filePath: z.string().optional(),
});

export const RefundSchema = z.object({
  type: z.enum(["PARTIAL", "FULL", "NONE"]),
  amount: PriceSchema.optional(),
  reason: RefundReasonSchema.optional(),
  lineItems: z.array(RefundItemSchema).optional(),
  delivery: PriceSchema.optional(),
  sellerComment: z.string().max(250).optional(),
  refundDocument: RefundDocumentSchema.optional(),
});

export const AllegroRefundSchema = z.object({
  payment: z.object({
    id: z.string(),
  }),
  order: z
    .object({
      id: z.string(),
    })
    .optional(),
  reason: RefundReasonSchema,
  lineItems: z.array(RefundItemSchema).optional(),
  delivery: PriceSchema.optional(),
  sellerComment: z.string().max(250).optional(),
});

export const OrderShipmentSchema = z.object({
  DTCShipmentId: z.string().optional(),
  isCreated: z.boolean(),
  isPickupOrdered: z.boolean(),
  parcelNumbers: z.array(z.string()),
  labelFilePath: z.string().optional(),
  shipmentIds: z.record(z.string(), z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isPickupAvailable: z.boolean(),
  carrier: z.string().optional(),
  pickupDate: z.string().optional(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  number: z.string(),
  allegroId: z.string().nullable(), // order id in Allegro
  messageToSeller: z
    .object({
      content: z.string().nullable(),
      isRead: z.boolean(),
    })
    .nullable(),
  buyer: BuyerSchema,
  allegroPayment: AllegroPaymentSchema.nullable().optional(),
  paymentType: PaymentTypeSchema,
  allegroStatus: AllegroOrderStatusSchema.optional(),
  fulfillment: z
    .object({
      status: FulfillmentStatusSchema,
    })
    .nullable(),
  delivery: OrderDeliveryDataSchema.nullable(),
  invoice: InvoiceInfoSchema.nullable(),
  lineItems: z.array(OrderItemSchema).min(1),
  allegroSurcharges: z.array(AllegroPaymentSchema),
  summary: z.object({
    totalToPay: PriceSchema,
  }),
  P24Transaction: z
    .object({
      sessionId: z.string(),
      amount: z.number(), // kwota w groszach
      status: z.enum(["INITIATED", "COMPLETED", "FAILED", "UNAUTHORIZED"]),
    })
    .optional(),
  updatedAt: z.string().nullable(),
  createdAt: z.string(),
  salesChannel: SalesChannelSchema,
  refund: RefundSchema.optional(),
  shipment: OrderShipmentSchema.optional(),
  returnDocumentFilePath: z.string().optional(),
});

export const AllegroOrderItemSchema = z.object({
  id: z.string(),
  offer: z.object({
    id: z.string(),
    name: z.string().nullable(),
    external: z
      .object({
        id: z.string().nullable(),
      })
      .nullable(),
  }),
  quantity: z.number().min(1),
  originalPrice: PriceSchema,
  price: PriceSchema,
  reconcilation: z
    .object({
      value: PriceSchema,
      type: z.enum(["BILLING", "WALLET"]),
      quantity: z.number().nullable(),
    })
    .nullable()
    .optional(),
  discount: z.array(DiscountSchema).nullable().optional(),
});

export const AllegroOrderSchema = z.object({
  id: z.string(), // order id, not checkout form id
  messageToSeller: z.string().nullable(),
  buyer: BuyerSchema,
  payment: AllegroPaymentSchema.nullable(),
  status: AllegroOrderStatusSchema,
  fulfillment: z
    .object({
      status: FulfillmentStatusSchema,
    })
    .nullable(),
  delivery: OrderDeliveryDataSchema.nullable(),
  invoice: InvoiceInfoSchema.nullable().optional(),
  lineItems: z.array(AllegroOrderItemSchema).min(1),
  surcharges: z.array(AllegroPaymentSchema),
  summary: z.object({
    totalToPay: PriceSchema,
  }),
  updatedAt: z.string().nullable(),
});

export const FrontendOrderSchema = z.object({
  checkoutData: CheckoutDataSchema,
  shoppingCartItems: z.array(ShoppingCartItemSchema.shape.item),
});

export type PaymentType = z.infer<typeof PaymentTypeSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type AllegroOrderStatus = z.infer<typeof AllegroOrderStatusSchema>;
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderWithId = Order & { id: string };
export type AllegroOrder = z.infer<typeof AllegroOrderSchema>;
export type OrderPhase = z.infer<typeof OrderPhaseSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type RefundReason = z.infer<typeof RefundReasonSchema>;
export type AllegroRefund = z.infer<typeof AllegroRefundSchema>;
export type FrontendOrder = z.infer<typeof FrontendOrderSchema>;
