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
import ItemsToRefundList from "./ItemsToRefundList";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

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
        <ItemsToRefundList lineItems={lineItems} />
        <FormField
          control={form.control}
          name="sellerComment"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-sm opacity-85 font-normal">
                Komentarz sprzedawcy
              </FormLabel>
              <FormControl>
                <Textarea
                  className="w-full p-2 border rounded"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  maxLength={250}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="p-4 rounded-lg">
          <p className="text-lg font-semibold">
            Łączna kwota do zwrotu: {form.watch("amount")?.amount || "0.00"} zł
          </p>
        </div>
      </div>
    </Form>
  );
}
