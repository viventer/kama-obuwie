"use server";

import OrderCancelled from "@/components/store/emails/order/OrderCancelled";
import OrderCreated from "@/components/store/emails/order/OrderCreated";
import OrderPaymentConfirmation from "@/components/store/emails/order/OrderPaymentConfirmation";
import OrderSent from "@/components/store/emails/order/OrderSent";
import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import { CreateEmailResponseSuccess, Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const emailTemplates = {
  orderCreated: OrderCreated,
  orderPaymentConfirmation: OrderPaymentConfirmation,
  orderSent: OrderSent,
  orderCancelled: OrderCancelled,
};

export type OrderTemplateName = keyof typeof emailTemplates;

export type SendOrderEmailPayload = {
  templateName: OrderTemplateName;
  to: string;
  subject: string;
  emailOrderData: EmailOrderData;
};

export async function sendOrderEmail({
  templateName,
  to,
  subject,
  emailOrderData,
}: SendOrderEmailPayload): Promise<CreateEmailResponseSuccess> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      react: emailTemplates[templateName]({ emailOrderData }),
    });

    if (error) {
      console.error("Błąd podczas wysyłania emaila:", error);
      throw new Error("Błąd podczas wysyłania emaila");
    }

    return data;
  } catch (err) {
    console.error("Nieoczekiwany błąd podczas wysyłania emaila:", err);
    throw new Error("Błąd podczas wysyłania emaila");
  }
}
