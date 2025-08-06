import { z } from "zod";

const returnStatusSchema = z.enum([
  "CREATED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "FINISHED",
  "FINISHED_APT",
  "REJECTED",
  "COMMISSION_REFUND_CLAIMED",
  "COMMISSION_REFUNDED",
  "WAREHOUSE_DELIVERED",
  "WAREHOUSE_VERIFICATION",
]);

const returnReasonTypeSchema = z.enum([
  "NONE",
  "MISTAKE",
  "TRANSPORT",
  "DAMAGED",
  "NOT_AS_DESCRIBED",
  "DONT_LIKE_IT",
  "OVERDUE_DELIVERY",
  "INCOMPLETE",
  "HIDDEN_FLAW",
  "OTHER_FLAW",
  "DIFFERENT",
  "COUNTERFEIT",
]);

const returnRejectionCodeSchema = z.enum([
  "REFUND_REJECTED",
  "NEW_ITEM_SENT",
  "ITEM_FIXED",
  "MISSING_PART_SENT",
]);

const priceSchema = z.object({
  amount: z.string(),
  currency: z.string(),
});

const customerReturnBuyerSchema = z.object({
  email: z.string(),
  login: z.string(),
});

const customerReturnItemReasonSchema = z.object({
  type: returnReasonTypeSchema,
  userComment: z.string().optional(),
});

const customerReturnRefundBankAccountAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postCode: z.string(),
  countryCode: z.string(),
});

const customerReturnRefundBankAccountSchema = z.object({
  owner: z.string(),
  accountNumber: z.string(),
  iban: z.string(),
  swift: z.string(),
  address: customerReturnRefundBankAccountAddressSchema,
});

const customerReturnRefundSchema = z.object({
  bankAccount: customerReturnRefundBankAccountSchema.optional(),
});

const customerReturnItemSchema = z.object({
  offerId: z.string(),
  quantity: z.number().int(),
  name: z.string(),
  price: priceSchema,
  url: z.string().optional(),
  reason: customerReturnItemReasonSchema.optional(),
});

const customerReturnParcelSenderSchema = z.object({
  phoneNumber: z.string(),
});

const customerReturnReturnParcelSchema = z.object({
  createdAt: z.string(),
  waybill: z.string(),
  transportingWaybill: z.string().nullable(),
  carrierId: z.string(),
  transportingCarrierId: z.string().nullable(),
  sender: customerReturnParcelSenderSchema,
});

const customerReturnRejectionSchema = z.object({
  code: returnRejectionCodeSchema,
  reason: z.string(),
  createdAt: z.string(),
});

export const allegroReturnSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  referenceNumber: z.string(),
  orderId: z.string(),
  buyer: customerReturnBuyerSchema,
  items: z.array(customerReturnItemSchema),
  refund: customerReturnRefundSchema.optional(),
  parcels: z.array(customerReturnReturnParcelSchema).optional(),
  rejection: customerReturnRejectionSchema.optional(),
  marketplaceId: z.string(),
  status: returnStatusSchema,
});

export type AllegroReturn = z.infer<typeof allegroReturnSchema>;
export type ReturnStatus = z.infer<typeof returnStatusSchema>;
export type ReturnReasonType = z.infer<typeof returnReasonTypeSchema>;
export type ReturnRejectionCode = z.infer<typeof returnRejectionCodeSchema>;
export type CustomerReturnRefund = z.infer<typeof customerReturnRefundSchema>;
export type CustomerReturnReturnParcel = z.infer<
  typeof customerReturnReturnParcelSchema
>;
export type CustomerReturnRejection = z.infer<
  typeof customerReturnRejectionSchema
>;
