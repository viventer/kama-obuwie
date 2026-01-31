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
  offerId: NonEmptyTrimmedString.max(50), // sku with size ABDCr12
  title: NonEmptyTrimmedString.max(150),
  description: NonEmptyTrimmedString.max(5000).optional(), // from parseProductDescription (if exists)

  link: HttpUrlSchema, // https://kama-obuwie.pl/product/id?colorVariantName=colorVariantName
  // id - productId or legacyOfferId
  imageLink: HttpUrlSchema, // url from offer.thumbnail
  additionalImageLinks: z.array(HttpUrlSchema).max(10).optional(), // urls from product.editedPhotos[:10] or legacyProduct.imagesUrls

  contentLanguage: LanguageCodeSchema,
  targetCountry: CountryCodeSchema,
  channel: z.enum(["online", "local"]).default("online"),

  availability: MerchantCenterAvailabilitySchema,
  condition: z.literal("new"),

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

  googleProductCategory: z.string().trim().min(1).optional(),
  productTypes: z.array(NonEmptyTrimmedString).optional(),

  itemGroupId: NonEmptyTrimmedString.max(50).optional(), // brand-manufacturer-code

  color: NonEmptyTrimmedString.optional(),
  gender: MerchantCenterGenderSchema.optional(),
  ageGroup: MerchantCenterAgeGroupSchema.optional(),
  sizes: z.array(NonEmptyTrimmedString).optional(),
  sizeSystem: MerchantCenterSizeSystemSchema.optional(),
  sizeType: MerchantCenterSizeTypeSchema.optional(),
  material: NonEmptyTrimmedString.optional(), // "materiał zewnętrzny" or "materiał" product parameter (if exists)
  pattern: NonEmptyTrimmedString.optional(),

  shippingWeight: z
    .object({
      value: z.number().positive(),
      unit: z.enum(["kg", "g", "lb", "oz"]),
    })
    .optional(),
});

export const MerchantCenterProductBaseSchema =
  MerchantCenterProductBaseObjectSchema.superRefine(identifierRefiner);

export const MerchantCenterFootwearProductSchema =
  MerchantCenterProductBaseObjectSchema.extend({
    availability: z.enum(["in stock", "out of stock"]),
    googleProductCategory: z.literal("187"), // shoes
    color: NonEmptyTrimmedString,
    gender: MerchantCenterGenderSchema,
    ageGroup: MerchantCenterAgeGroupSchema,
    sizes: z.array(NonEmptyTrimmedString).min(1).max(1),
    sizeSystem: z.literal("EU"),
    sizeType: z.literal("regular"),
  }).superRefine(identifierRefiner);

export type MerchantCenterFootwearProduct = z.infer<
  typeof MerchantCenterFootwearProductSchema
>;
