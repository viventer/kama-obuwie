import { z } from "zod";

export const AddressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  street: z.string(),
  city: z.string(),
  zipCode: z.string(), // postal code
  countryCode: z.string().length(2), // ISO 3166-1 alpha-2
  companyName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
});

export const PickupPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
    countryCode: z.string().length(2),
  }),
});

export const PriceSchema = z.object({
  amount: z.string(),
  currency: z.enum(["PLN"]),
});
