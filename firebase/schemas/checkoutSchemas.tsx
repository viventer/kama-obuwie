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
    .min(5, "Email jest wymagany.")
    .email("Nieprawidłowy format emaila."),
  phoneNumber: z.string().min(9, "Numer telefonu jest wymagany."),
  deliveryData: z.object({
    city: z.string().min(2, "Miasto jest wymagane."),
    postalCode: z.string().min(5, "Kod pocztowy jest wymagany."),
    address: z.string().min(3, "Adres jest wymagany."),
    method: DeliveryMethodSchema,
  }),
  paymentMethod: PaymentMethodSchema,
  pickupPoint: PickupPointSchema.optional(),
});

export type CheckoutData = z.infer<typeof CheckoutDataSchema>;
