import { z } from "zod";
import { PaymentMethodSchema } from "./checkoutSchemas";

export const ItemSchema = z.object({
  item_id: z.string(), // sku
  item_name: z.string(), // signature
  item_category: z.string(), // category name
  item_brand: z.string().optional(),
  price: z.number().min(0),
  size: z.string().optional(),
  quantity: z.number().min(1),
  item_variant: z.string().optional(), // colorVariantName
});

export const ShoppingEventBaseSchema = z.object({
  items: z.array(ItemSchema).min(1),
  value: z.number().min(0),
  currency: z.enum(["PLN"]),
});

export const ListingSchema = z.object({
  item_list_id: z.string().optional(), // category id
  item_list_name: z.string().optional(), // category name
  from: z.enum(["home_grid", "nav", "home_products_list"]),
});

export const ViewItemSchema = z.object({
  items: z.array(ItemSchema).min(1),
});

export const AddToCartSchema = ShoppingEventBaseSchema;

export const ViewCartSchema = ShoppingEventBaseSchema.extend({
  view: z.enum(["full", "preview"]),
});

export const RemoveFromCartSchema = ShoppingEventBaseSchema;

export const BeginCheckoutSchema = ShoppingEventBaseSchema;

export const SelectParcelLockerSchema = z.object({
  items: z.array(ItemSchema).min(1),
  parcel_locker_type: z.enum([
    "parcel_locker",
    "parcel_locker_superpop",
    "pop",
  ]),
  parcel_locker_name: z.string(),
});

export const AddPaymentInfoSchema = ShoppingEventBaseSchema.extend({
  payment_type: PaymentMethodSchema,
});

export const BeginPaymentSchema = ShoppingEventBaseSchema.extend({
  payment_type: PaymentMethodSchema,
});

export const PurchaseSchema = ShoppingEventBaseSchema.extend({
  transaction_id: z.string(),
  payment_type: PaymentMethodSchema,
});

export type ItemType = z.infer<typeof ItemSchema>;
export type ListingType = z.infer<typeof ListingSchema>;
export type ViewItemType = z.infer<typeof ViewItemSchema>;
export type AddToCartType = z.infer<typeof AddToCartSchema>;
export type ViewCartType = z.infer<typeof ViewCartSchema>;
export type RemoveFromCartType = z.infer<typeof RemoveFromCartSchema>;
export type BeginCheckoutType = z.infer<typeof BeginCheckoutSchema>;
export type SelectParcelLockerType = z.infer<typeof SelectParcelLockerSchema>;
export type AddPaymentInfoType = z.infer<typeof AddPaymentInfoSchema>;
export type BeginPaymentType = z.infer<typeof BeginPaymentSchema>;
export type PurchaseType = z.infer<typeof PurchaseSchema>;
