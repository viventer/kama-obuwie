import { Order, Refund } from "@/firebase/schemas/ordersSchemas";
import MiniLoader from "../../global/MiniLoader";
import OrderItemFromList from "../OrderItemFromList";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function ItemsToRefundList({
  lineItems,
}: {
  lineItems: Order["lineItems"];
}) {
  const { control, watch } = useFormContext<Refund>();

  const lineItemsValue = watch("lineItems");

  return (
    <div>
      <h3 className="font-medium">Przedmioty do zwrotu</h3>
      <div className="mt-2 flex gap-3 flex-col">
        {lineItems.length === 0 ? (
          <MiniLoader />
        ) : (
          lineItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <OrderItemFromList item={item} withPrice={false} />
              <FormField
                rules={{ required: "Ilość do zwrotu jest wymagana." }}
                control={control}
                name={`lineItems.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="w-fit">
                    <FormLabel className="text-sm w-fit opacity-85 font-normal">
                      Ilość do zwrotu
                    </FormLabel>
                    <div className="flex gap-2 items-end">
                      <Input
                        type="number"
                        value={field.value || ""}
                        onChange={field.onChange}
                        max={item.quantity}
                        className="w-[70px]"
                      />
                      <p className="text-lg font-medium">
                        z {item.quantity} szt/par
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                rules={{ required: "Kwota zwrotu jest wymagana." }}
                control={control}
                name={`lineItems.${index}.value.amount`}
                render={({ field }) => (
                  <FormItem className="w-fit">
                    <FormLabel className="text-sm w-fit opacity-85 font-normal">
                      Kwota zwrotu
                    </FormLabel>
                    <div className="flex gap-2 items-end">
                      <Input
                        type="number"
                        value={
                          field.value ||
                          Number(item.price.amount) *
                            (lineItemsValue?.[index]?.quantity &&
                            lineItemsValue?.[index]?.quantity > 0
                              ? lineItemsValue?.[index]?.quantity
                              : 0)
                        }
                        onChange={field.onChange}
                        max={item.quantity}
                        className="w-[90px] no-spinner"
                      />
                      <p className="text-lg font-medium">zł</p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
