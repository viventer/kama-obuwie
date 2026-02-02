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
  "in_stock",
  "out_of_stock",
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
  amountMicros: z
    .string()
    .trim()
    .regex(/^\d+$/, "amountMicros musi być liczbą"),
  currencyCode: z
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
    gtins?: string[];
    mpn?: string;
    identifierExists?: boolean;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.identifierExists === false) return;
  const hasGtin = Boolean(data.gtins && data.gtins.length > 0);
  const hasBrandMpn = Boolean(data.brand && data.mpn);
  if (!hasGtin && !hasBrandMpn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Wymagane identyfikatory: podaj gtins albo (brand + mpn), lub ustaw identifierExists=false",
      path: ["gtins"],
    });
  }
};

export const MerchantCenterProductAttributesBaseObjectSchema = z.object({
  title: NonEmptyTrimmedString.max(150),
  description: NonEmptyTrimmedString.max(5000).optional(),

  link: HttpUrlSchema,
  imageLink: HttpUrlSchema,
  additionalImageLinks: z.array(HttpUrlSchema).max(10).optional(),

  availability: MerchantCenterAvailabilitySchema,
  condition: MerchantCenterConditionSchema,

  price: MerchantCenterMoneySchema,
  salePrice: MerchantCenterMoneySchema.optional(),

  brand: NonEmptyTrimmedString.optional(),
  gtins: z
    .array(
      z
        .string()
        .trim()
        .regex(/^\d{8,14}$/, "GTIN musi mieć 8-14 cyfr"),
    )
    .max(10)
    .optional(),
  mpn: NonEmptyTrimmedString.optional(),
  identifierExists: z.boolean().optional(),

  googleProductCategory: z.string().trim().min(1).optional(),
  productTypes: z.array(NonEmptyTrimmedString).optional(),

  itemGroupId: NonEmptyTrimmedString.max(50).optional(),

  color: NonEmptyTrimmedString.optional(),
  gender: MerchantCenterGenderSchema.optional(),
  ageGroup: MerchantCenterAgeGroupSchema.optional(),
  size: NonEmptyTrimmedString.optional(),
  sizeSystem: MerchantCenterSizeSystemSchema.optional(),
  sizeTypes: z.array(MerchantCenterSizeTypeSchema).max(2).optional(),
  material: NonEmptyTrimmedString.optional(),
  pattern: NonEmptyTrimmedString.optional(),

  shippingWeight: z
    .object({
      value: z.number().positive(),
      unit: z.enum(["kg", "g", "lb", "oz"]),
    })
    .optional(),
});

export const MerchantCenterProductAttributesBaseSchema =
  MerchantCenterProductAttributesBaseObjectSchema.superRefine(
    identifierRefiner,
  );

export const MerchantCenterProductInputBaseSchema = z.object({
  offerId: NonEmptyTrimmedString.max(50),
  contentLanguage: LanguageCodeSchema,
  feedLabel: CountryCodeSchema,
  productAttributes: MerchantCenterProductAttributesBaseSchema,
});

const MerchantCenterFootwearProductAttributesSchema =
  MerchantCenterProductAttributesBaseObjectSchema.extend({
    availability: z.enum(["in_stock", "out_of_stock"]),
    googleProductCategory: z.literal("187"),
    color: NonEmptyTrimmedString,
    gender: MerchantCenterGenderSchema,
    ageGroup: MerchantCenterAgeGroupSchema,
    size: NonEmptyTrimmedString,
    sizeSystem: z.literal("EU"),
    sizeTypes: z.tuple([z.literal("regular")]),
  }).superRefine(identifierRefiner);

export const MerchantCenterFootwearProductSchema = z.object({
  offerId: NonEmptyTrimmedString.max(50),
  contentLanguage: LanguageCodeSchema,
  feedLabel: CountryCodeSchema,
  productAttributes: MerchantCenterFootwearProductAttributesSchema,
});

export type MerchantCenterFootwearProduct = z.infer<
  typeof MerchantCenterFootwearProductSchema
>;
