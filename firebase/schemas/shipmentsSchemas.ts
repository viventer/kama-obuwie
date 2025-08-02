import { z } from "zod";

export const availableInpostSendingMethods = [
  "parcel_locker",
  "dispatch_order",
  "pop",
  "any_point",
];

export const inpostSendingMethodsTranslation: Record<string, string> = {
  parcel_locker: "Paczkomat",
  dispatch_order: "Podjazd kuriera",
  pop: "Paczkopunkt",
  any_point: "Dowolny punkt",
};

export type InpostSendingMethod =
  | "parcel_locker"
  | "dispatch_order"
  | "pop"
  | "any_point";

export const InpostSendingMethodSchema = z.enum([
  "parcel_locker",
  "dispatch_order",
  "pop",
  "any_point",
]);

const AdditionalServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const AdditionalPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  required: z.boolean(),
  readOnly: z.boolean(),
});

const CashOnDeliveryLimitSchema = z.object({
  limit: z.number().optional(),
  currency: z.enum(["PLN", "CZK"]).optional(),
  paymentType: z.enum(["MONEY_TRANSFER", "WALLET_TRANSFER"]).optional(),
  forceRequireIban: z.boolean().optional(),
});

const LimitWithCurrencySchema = z.object({
  limit: z.number().optional(),
  currency: z.string().optional(),
});

export const DeliveryServiceSchema = z.object({
  id: z
    .object({
      deliveryMethodId: z.string().optional(),
      credentialsId: z.string().optional(),
    })
    .optional(),
  name: z.string().optional(),
  carrierId: z.string().optional(),
  additionalServices: z.array(AdditionalServiceSchema).optional(),
  additionalProperties: z.array(AdditionalPropertySchema).optional(),
  owner: z.enum(["ALLEGRO", "CLIENT"]).optional(),
  marketplaces: z.array(z.string()).optional(),
  packageTypes: z
    .array(z.enum(["DOX", "PACKAGE", "PALLET", "OTHER"]))
    .optional(),
  cashOnDelivery: CashOnDeliveryLimitSchema.optional(),
  insurance: LimitWithCurrencySchema.optional(),
  features: z.record(z.string(), z.string()).optional(),
});

const DimensionValueSchema = z.object({
  value: z.number(),
  unit: z.literal("CENTIMETER").nullable(),
});

const WeightValueSchema = z.object({
  value: z.number(),
  unit: z.literal("KILOGRAMS").nullable(),
});

const InsuranceSchema = z.object({
  amount: z.string().regex(/\d+[.,]\d{1,2}/),
  currency: z
    .string()
    .length(3)
    .regex(/[A-Z]{3}/),
});

const CashOnDeliverySchema = z.object({
  amount: z.string().regex(/\d+[.,]\d{1,2}/),
  currency: z
    .string()
    .length(3)
    .regex(/[A-Z]{3}/),
  ownerName: z.string().optional(),
  iban: z.string().optional(),
});

const PackageRequestSchema = z.object({
  type: z.enum(["DOX", "PACKAGE", "PALLET", "OTHER"]),
  length: DimensionValueSchema,
  width: DimensionValueSchema,
  height: DimensionValueSchema,
  weight: WeightValueSchema,
  textOnLabel: z.string().optional(),
});

const SenderAddressSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  state: z.string().optional(),
  countryCode: z
    .string()
    .regex(/[A-Z]{2}/)
    .default("PL"),
  email: z.string().email(),
  phone: z.string(),
  point: z.string().optional(),
});

const ReceiverAddressSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  state: z.string().optional(),
  countryCode: z
    .string()
    .regex(/[A-Z]{2}/)
    .default("PL"),
  email: z.string().email(),
  phone: z.string(),
  point: z.string().optional(),
});

export const CreateShipmentDataSchema = z.object({
  deliveryMethodId: z.string(),
  credentialsId: z.string().optional(),
  sender: SenderAddressSchema,
  receiver: ReceiverAddressSchema,
  referenceNumber: z.string().optional(),
  packages: z.array(PackageRequestSchema),
  insurance: InsuranceSchema.optional(),
  cashOnDelivery: CashOnDeliverySchema.optional(),
  labelFormat: z.enum(["PDF", "ZPL"]).optional(),
  additionalServices: z.array(z.string()).optional(),
  additionalProperties: z.record(z.string(), z.string()).optional(),
});

export type ShipmentCreationCommandStatus = {
  commandId: string;
  status: "IN_PROGRESS" | "SUCCESS" | "ERROR";
  errors: Array<{
    code: string;
    message: string;
    details: string;
    path: string;
    userMessage: string;
  }>;
  shipmentId: string;
};

export type CreateShipmentData = z.infer<typeof CreateShipmentDataSchema>;
export type DeliveryService = z.infer<typeof DeliveryServiceSchema>;
export type PackageData = z.infer<typeof PackageRequestSchema>;

// Schema dla metadanych zapisanych etykiet
export const LabelMetadataSchema = z.object({
  orderNumber: z.string(),
  shipmentId: z.string(),
  filename: z.string(),
  storagePath: z.string(),
  downloadUrl: z.string(),
  createdAt: z.string(),
  account: z.enum(["AL1", "AL2"]),
});

export type LabelMetadata = z.infer<typeof LabelMetadataSchema>;
