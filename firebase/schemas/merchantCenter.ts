import { z } from "zod";

const NonEmptyTrimmedString = z.string().trim().min(1);

const CountryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/);

const LanguageCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{2}$/);

const HttpUrlSchema = NonEmptyTrimmedString.url();

export const MerchantCenterAvailabilitySchema = z.enum([
  "in stock",
  "out of stock",
  "preorder",
  "backorder",
]);

export const MerchantCenterConditionSchema = z.enum([
  "new",
  "used",
  "refurbished",
]);

export const MerchantCenterGenderSchema = z.enum(["male", "female", "unisex"]);

export const MerchantCenterAgeGroupSchema = z.enum([
  "newborn",
  "infant",
  "toddler",
  "kids",
  "adult",
]);

export const MerchantCenterSizeSystemSchema = z.enum(["EU", "US", "UK"]);

export const MerchantCenterSizeTypeSchema = z.enum([
  "regular",
  "petite",
  "plus",
  "big and tall",
  "maternity",
]);

export const MerchantCenterMoneySchema = z.object({
  value: z
    .string()
    .trim()
    .regex(/^\d+\.\d{2}$/, "Kwota musi mieć format 123.45"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/),
});

export const MerchantCenterShippingSchema = z.object({
  country: CountryCodeSchema,
  service: NonEmptyTrimmedString.optional(),
  price: MerchantCenterMoneySchema.optional(),
});

const identifierRefiner = (
  data: {
    brand?: string;
    gtin?: string;
    mpn?: string;
    identifierExists?: boolean;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.identifierExists === false) return;
  const hasGtin = Boolean(data.gtin);
  const hasBrandMpn = Boolean(data.brand && data.mpn);
  if (!hasGtin && !hasBrandMpn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Wymagane identyfikatory: podaj gtin albo (brand + mpn), lub ustaw identifierExists=false",
      path: ["gtin"],
    });
  }
};

export const MerchantCenterProductBaseObjectSchema = z.object({
  offerId: NonEmptyTrimmedString.max(50),
  title: NonEmptyTrimmedString.max(150),
  description: NonEmptyTrimmedString.max(5000),

  link: HttpUrlSchema,
  imageLink: HttpUrlSchema,
  additionalImageLinks: z.array(HttpUrlSchema).max(10).optional(),

  contentLanguage: LanguageCodeSchema,
  targetCountry: CountryCodeSchema,
  channel: z.enum(["online", "local"]).default("online"),

  availability: MerchantCenterAvailabilitySchema,
  condition: MerchantCenterConditionSchema,

  price: MerchantCenterMoneySchema,
  salePrice: MerchantCenterMoneySchema.optional(),

  brand: NonEmptyTrimmedString.optional(),
  gtin: z
    .string()
    .trim()
    .regex(/^\d{8,14}$/, "GTIN musi mieć 8-14 cyfr")
    .optional(),
  mpn: NonEmptyTrimmedString.optional(),
  identifierExists: z.boolean().optional(),

  googleProductCategory: z
    .union([z.string().trim().min(1), z.number().int()])
    .optional(),
  productTypes: z.array(NonEmptyTrimmedString).optional(),

  itemGroupId: NonEmptyTrimmedString.max(50).optional(),

  color: NonEmptyTrimmedString.optional(),
  gender: MerchantCenterGenderSchema.optional(),
  ageGroup: MerchantCenterAgeGroupSchema.optional(),
  sizes: z.array(NonEmptyTrimmedString).optional(),
  sizeSystem: MerchantCenterSizeSystemSchema.optional(),
  sizeType: MerchantCenterSizeTypeSchema.optional(),
  material: NonEmptyTrimmedString.optional(),
  pattern: NonEmptyTrimmedString.optional(),

  shippingWeight: z
    .object({
      value: z.preprocess((v) => {
        if (typeof v === "number" && Number.isFinite(v)) return v;
        if (typeof v === "string") return parseFloat(v);
        return v;
      }, z.number().positive()),
      unit: z.enum(["kg", "g", "lb", "oz"]),
    })
    .optional(),
});

export const MerchantCenterProductBaseSchema =
  MerchantCenterProductBaseObjectSchema.superRefine(identifierRefiner);

export const MerchantCenterFootwearProductSchema =
  MerchantCenterProductBaseObjectSchema.extend({
    // Dla obuwia (apparel/footwear) te atrybuty są praktycznie zawsze wymagane
    // do poprawnej klasyfikacji i wariantów.
    color: NonEmptyTrimmedString,
    gender: MerchantCenterGenderSchema,
    ageGroup: MerchantCenterAgeGroupSchema,
    sizes: z.array(NonEmptyTrimmedString).min(1).max(1),
  }).superRefine(identifierRefiner);

export type MerchantCenterFootwearProduct = z.infer<
  typeof MerchantCenterFootwearProductSchema
>;
