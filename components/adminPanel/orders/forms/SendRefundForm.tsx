"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Order, Refund } from "@/firebase/schemas/ordersSchemas";
import { useForm } from "react-hook-form";
import SingleSelect from "../../global/form/SingleSelect";

export const refundReasons = [
  { name: "zwrot produktu", value: "REFUND" },
  {
    name: "reklamacja",
    value: "COMPLAINT",
  },
  { name: "brak produktu", value: "PRODUCT_NOT_AVAILABLE" },
  { name: "zwrot nadpłaty", value: "OVERPAID" },
  { name: "anulowanie przez kupującego", value: "CANCELLED_BY_BUYER" },
  { name: "nieodebrane zamówienie", value: "NOT_COLLECTED" },
  { name: "brak pełnej kwoty za zamówienie", value: "PAID_VALUE_TOO_LOW" },
];

export default function SendRefundForm({
  refund,
  paymentId,
  lineItems,
}: {
  refund: Refund | undefined;
  paymentId: string | undefined;
  lineItems: Order["lineItems"];
}) {
  const form = useForm<Refund>({
    defaultValues: {
      type: refund?.type || "NONE",
      amount: refund?.amount || { amount: "0", currency: "PLN" },
      reason: refund?.reason || "REFUND",
      lineItems: refund?.lineItems || [],
      delivery: refund?.delivery || { amount: "0", currency: "PLN" },
      sellerComment: refund?.sellerComment || "",
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 mt-8">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <SingleSelect
                  availableOptions={refundReasons}
                  label="Powód zwrotu"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
