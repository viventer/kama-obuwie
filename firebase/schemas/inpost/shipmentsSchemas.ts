import { z } from "zod";

export const InpostAddressSchema = z.object({
  id: z.string().optional(),
  street: z.string(),
  building_number: z.string(),
  city: z.string(),
  post_code: z.string(),
  country_code: z.literal("PL"),
});

export const PeerSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  company_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string(),
  phone: z.string(),
  address: InpostAddressSchema.optional(),
});

export const ServiceNameSchema = z.enum([
  "inpost_locker_standard",
  "inpost_courier_standard",
]);

export const ServiceSchema = z.object({
  id: z.string(),
  name: ServiceNameSchema,
  description: z.string().optional(),
});

export const CarrierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  status: z.enum(["initiated", "success", "failure"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  offer_id: z.number().int(),
});

export const parcelSizeTemplateSchema = z.enum([
  "small",
  "medium",
  "large",
  "xlarge",
]);

export const InpostOfferSchema = z.object({
  id: z.number().int(),
  service: ServiceSchema,
  carrier: CarrierSchema,

  additional_services: z.array(z.string()).optional(),

  status: z.enum([
    "in_preparation",
    "available",
    "unavailable",
    "selected",
    "bought",
    "expired",
  ]),

  expires_at: z.string().datetime(),

  rate: z.number(), // Decimal → number
  currency: z.string(),

  unavailability_reasons: z.array(z.any()).optional(),
});

export const InpostParcelSchema = z.object({
  id: z.string().optional(),

  template: parcelSizeTemplateSchema.optional(),

  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
      unit: z.literal("mm"),
    })
    .optional(),

  weight: z
    .object({
      amount: z.number(),
      unit: z.literal("kg"),
    })
    .optional(),

  tracking_number: z.string().optional(),

  is_non_standard: z.boolean().optional(),
});

export const MoneyDataSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const CustomAttributesSchema = z.object({
  target_point: z.string().optional(),
  sending_method: z.string().optional(),
  dropoff_point: z.string().optional(),
  dispatch_order_id: z.number().int().optional(),
});

export const InpostShipmentSchema = z.object({
  href: z.string().optional(),
  id: z.number().int(),
  status: z.string(),
  tracking_number: z.string(),
  return_tracking_number: z.string().optional(),

  service: ServiceNameSchema,
  reference: z.string().optional(),
  is_return: z.boolean().optional(),

  application_id: z.number().int(),
  created_by_id: z.number().int().optional(),

  external_customer_id: z.string().optional(),
  sending_method: z.string().optional(),
  end_of_week_collection: z.boolean().optional(),

  comments: z.string().optional(),
  mpk: z.string().optional(),

  additional_services: z
    .array(z.enum(["insurance", "cod", "sms", "email", "saturday"]))
    .optional(),

  custom_attributes: CustomAttributesSchema.optional(),
  cod: MoneyDataSchema.optional(),
  insurance: MoneyDataSchema.optional(),

  sender: PeerSchema.optional(),
  receiver: PeerSchema,

  selected_offer: InpostOfferSchema.optional(),
  offers: z.array(InpostOfferSchema).optional(),

  transactions: z.array(TransactionSchema).optional(),
  parcels: z.array(InpostParcelSchema),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const PickupPointCustomAttributesSchema = CustomAttributesSchema.extend({
  target_point: z.string(),
});

export const PickupPointParcelSchema = InpostParcelSchema.extend({
  template: z.enum(["small", "medium", "large"]),
});

export const PickupPointInpostShipmentSchema = InpostShipmentSchema.extend({
  custom_attributes: PickupPointCustomAttributesSchema.optional(),
  parcels: z.array(PickupPointParcelSchema),
});

export const CourierPeerSchema = PeerSchema.extend({
  address: InpostAddressSchema,
  first_name: z.string(),
  last_name: z.string(),
});

export const CourierParcelSchema = InpostParcelSchema.extend({
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    unit: z.literal("mm"),
  }),
  weight: z.object({
    amount: z.number(),
    unit: z.literal("kg"),
  }),
});

export const CourierInpostShipmentSchema = InpostShipmentSchema.extend({
  receiver: CourierPeerSchema,
  parcels: z.array(CourierParcelSchema),
});

export const CreateInpostShipmentDataSchema = z.object({
  receiver: PeerSchema,
  sender: PeerSchema.optional(),
  parcels: z.array(InpostParcelSchema).min(1).max(99),
  custom_attributes: CustomAttributesSchema.optional(),
  cod: MoneyDataSchema.optional(),
  insurance: MoneyDataSchema.optional(),
  reference: z.string().min(3).max(100).optional().or(z.literal("")),
  is_return: z.boolean().optional(),
  service: ServiceNameSchema,
  additional_services: z.array(z.enum(["sms", "email", "saturday"])).optional(),
  external_customer_id: z.string().optional(),
  only_choice_of_offer: z.boolean().optional(),
  mpk: z.string().max(255).optional().or(z.literal("")),
  comments: z.string().min(3).max(100).optional().or(z.literal("")),
});

export type InpostShipment = z.infer<typeof InpostShipmentSchema>;
export type InpostParcel = z.infer<typeof InpostParcelSchema>;
export type InpostOffer = z.infer<typeof InpostOfferSchema>;
export type PickupPointInpostShipment = z.infer<
  typeof PickupPointInpostShipmentSchema
>;
export type PickupPointParcel = z.infer<typeof PickupPointParcelSchema>;
export type PickupPointCustomAttributes = z.infer<
  typeof PickupPointCustomAttributesSchema
>;
export type CourierInpostShipment = z.infer<typeof CourierInpostShipmentSchema>;
export type CourierPeer = z.infer<typeof CourierPeerSchema>;
export type CourierParcel = z.infer<typeof CourierParcelSchema>;
export type InpostServiceName = z.infer<typeof ServiceNameSchema>;

export type CreateInpostShipmentData = z.infer<
  typeof CreateInpostShipmentDataSchema
>;
