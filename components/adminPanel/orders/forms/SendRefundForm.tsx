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
import { FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";
import { useToast } from "@/hooks/useToast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { allegroSalesChannels } from "@/lib/constants";

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
  salesChannel,
}: {
  refund: Refund | undefined;
  paymentId: string | undefined;
  lineItems: Order["lineItems"];
  salesChannel: Order["salesChannel"];
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

  const { showDialog } = useConfirmDialog();
  const { showToast } = useToast();
  const router = useRouter();
  const handleReject = async (e: FormEvent) => {
    e.preventDefault();

    showDialog({
      message: "Czy na pewno chcesz odrzucić zmiany?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        router.back();
        showToast("Zmiany zostały odrzucone.", "default");
      },
    });
  };

  const { id } = useParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isValid = await form.trigger();
    if (!isValid) {
      showToast("Formularz zawiera błędy.", "error");
      return;
    }

    // Oblicz sumę wartości wszystkich zwracanych produktów
    const lineItemsData = form.getValues("lineItems") || [];
    const totalRefundAmount = lineItemsData.reduce((sum, item) => {
      const itemAmount = Number(item.value?.amount || 0);
      return sum + itemAmount;
    }, 0);

    if (totalRefundAmount <= 0) {
      showToast("Kwota zwrotu musi być większa niż 0.", "error");
      return;
    }

    // Ustaw wartość amount na obliczoną sumę
    form.setValue("amount", {
      amount: totalRefundAmount.toString(),
      currency: "PLN",
    });

    // Sprawdź czy ilości zwracanych produktów nie przekraczają zamówionych
    for (let index = 0; index < lineItemsData.length; index++) {
      const refundQuantity = Number(lineItemsData[index].quantity || 0);
      const orderQuantity = lineItems[index]?.quantity || 0;

      if (refundQuantity > orderQuantity) {
        showToast(
          "Ilość zwracanego produktu nie może być większa niż zamówiona.",
          "error"
        );
        return;
      }
    }

    // Ustaw wartość type na podstawie porównania ilości produktów
    let refundType: "NONE" | "PARTIAL" | "FULL";

    // Sprawdź czy wszystkie produkty zostały zwrócone w pełnej ilości
    const allItemsFullyRefunded = lineItemsData.every((item, index) => {
      const refundQuantity = Number(item.quantity || 0);
      const orderQuantity = lineItems[index]?.quantity || 0;
      return refundQuantity === orderQuantity;
    });

    if (allItemsFullyRefunded) {
      refundType = "FULL";
    } else {
      refundType = "PARTIAL";
    }

    form.setValue("type", refundType);

    // Przekonwertuj wszystkie quantity na typ number
    const lineItemsWithNumberQuantity = lineItemsData.map((item, index) => ({
      ...item,
      id: lineItems[index].id,
      type: item.type || "AMOUNT",
      quantity: Number(item.quantity || 0),
      value: { amount: item.value?.amount || "0", currency: "PLN" as const },
    }));

    form.setValue("lineItems", lineItemsWithNumberQuantity);

    const data: Refund = form.getValues();

    showDialog({
      message: `Czy na pewno chcesz zwrócić ${totalRefundAmount.toString()} zł?`,
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        await axios.patch(`/api/orders/${id}`, {
          refund: {
            ...data,
          },
        });

        if (["AL1", "AL2"].includes(salesChannel)) {
          await axios.post(`/api/allegro/orders/refunds`, {
            refund: {
              payment: { id: paymentId },
              reason: data.reason,
              lineItems: data.lineItems,
              sellerComment: data.sellerComment,
              delivery: data.delivery,
            },
            account: salesChannel,
          });
        }

        router.replace("/admin-panel/orders/new");
        showToast("Wpłata została zwrócona.", "success");
      },
    });
  };

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
        <div className="flex gap-4 mt-8">
          <Button type="button" onClick={handleSubmit} className="w-fit">
            Zapisz
          </Button>
          <Button
            type="button"
            onClick={handleReject}
            className="w-fit"
            variant="destructive"
          >
            Odrzuć
          </Button>
        </div>
      </div>
    </Form>
  );
}
