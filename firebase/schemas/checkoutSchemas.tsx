import { z } from "zod";
import { PickupPointSchema } from "./ordersSchemas";

export const DeliveryMethodSchema = z.enum(["courier", "pickupPoint"]);
export const PaymentMethodSchema = z.enum([
  "BLIK",
  "quickTransfer",
  "card",
  "COD",
]);

export const CheckoutDataSchema = z.object({
  firstName: z.string().min(3, "Imię jest wymagane."),
  lastName: z.string().min(3, "Nazwisko jest wymagane."),
  email: z
    .string()
    .min(1, "Email jest wymagany.")
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
      apartmentNumber: z.string().min(1, "Numer mieszkania jest wymagany."),
    })
    .optional(),
  deliveryMethod: DeliveryMethodSchema,
  paymentMethod: PaymentMethodSchema,
  pickupPoint: PickupPointSchema.optional(),
});

export type CheckoutData = z.infer<typeof CheckoutDataSchema>;
