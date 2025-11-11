import { z } from "zod";
import { PickupPointSchema } from "./commonSchemas";

export const paymentMethods = ["BLIK", "quickTransfer", "card", "COD"] as const;

export const paymentMethodsLabels: Record<string, string> = {
  BLIK: "BLIK",
  quickTransfer: "Szybki przelew",
  card: "Karta płatnicza",
  COD: "Płatność przy odbiorze",
} as const;

export const DeliveryMethodSchema = z.enum(["courier", "parcelLocker"]);
export const PaymentMethodSchema = z.enum([
  "BLIK",
  "quickTransfer",
  "card",
  "COD",
]);

export const CheckoutDataSchema = z.object({
  firstName: z
    .string()
    .min(3, "Imię jest wymagane.")
    .max(24, "Imię jest zbyt długie."),
  lastName: z
    .string()
    .min(3, "Nazwisko jest wymagane.")
    .max(36, "Nazwisko jest zbyt długie."),
  email: z
    .string()
    .min(1, "Email jest wymagany.")
    .max(254, "Email jest zbyt długi.")
    .email("Nieprawidłowy format e-maila."),
  phoneNumber: z
    .string()
    .min(1, "Numer telefonu jest wymagany.")
    .regex(
      /^(\d{9}|\d{3} \d{3} \d{3})$/,
      "Numer telefonu powinien składać się z 9 cyfr. Bez znaków specjalnych."
    ),
  address: z
    .object({
      city: z.string().min(2, "Miasto jest wymagane."),
      postalCode: z
        .string()
        .min(1, "Kod pocztowy jest wymagany.")
        .regex(
          /^\d{2}-\d{3}$/,
          "Kod pocztowy musi być w formacie dd-ddd (np. 00-000)."
        ),
      street: z.string().min(3, "Ulica jest wymagana."),
      buildingNumber: z.string().min(1, "Numer budynku jest wymagany."),
      apartmentNumber: z.string().optional(),
    })
    .optional(),
  deliveryMethod: DeliveryMethodSchema,
  paymentMethod: PaymentMethodSchema,
  pickupPoint: PickupPointSchema.optional(),
  totalToPay: z.string(),
  activeTab: z.enum(["firstStep", "secondStep"]),
});

export type CheckoutData = z.infer<typeof CheckoutDataSchema>;
