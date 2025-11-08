"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";

export default function DeliveryMethodSelector({
  form,
}: {
  form: UseFormReturn<CheckoutData>;
}) {
  const { getCartStats } = useShoppingCart();

  const { totalPrice } = getCartStats();
  const freeDelivery = totalPrice >= 55;

  return (
    <FormField
      control={form.control}
      name="deliveryMethod"
      render={({ field }) => (
        <FormItem className="w-2xl max-w-full">
          <h2 className="text-xl mb-1 font-medium">Metoda dostawy</h2>
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="flex gap-4 flex-wrap"
          >
            <div
              className={`flex items-center gap-4 border-2 px-4 py-2 rounded-sm transition-colors flex-1 ${
                field.value === "courier" ? "border-brand" : "border-border"
              } min-w-fit`}
            >
              <FormControl>
                <RadioGroupItem value={"courier"} id="courier" />
              </FormControl>
              <Label htmlFor="courier" className="text-base gap-4 2xs:text-lg">
                <Image
                  src="InpostKurierRect.svg"
                  alt="logo kurier inpost"
                  className="size-16 hidden 2xs:block"
                  width={128}
                  height={128}
                />
                <div>
                  <p className="text-nowrap">Inpost Kurier</p>
                  <p className="text-base font-normal">
                    {freeDelivery ? "0,00 zł" : "9,99 zł"}
                  </p>
                </div>
              </Label>
            </div>
            <div
              className={`flex items-center gap-4 border-2 px-4 py-2 rounded-sm transition-colors flex-1 ${
                field.value === "parcelLocker"
                  ? "border-brand"
                  : "border-border"
              } min-w-fit`}
            >
              <FormControl>
                <RadioGroupItem value={"parcelLocker"} id="parcelLocker" />
              </FormControl>
              <Label
                htmlFor="parcelLocker"
                className="text-base gap-4 2xs:text-lg"
              >
                <Image
                  src="InpostPaczkomatRect.svg"
                  alt="logo paczkomat inpost"
                  className="size-16 hidden 2xs:block"
                  width={128}
                  height={128}
                />
                <div>
                  <p className="text-nowrap">Inpost Paczkomat</p>
                  <p className="text-base font-normal">
                    {freeDelivery ? "0,00 zł" : "9,99 zł"}
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
          <FormMessage className="text-text" />
        </FormItem>
      )}
    />
  );
}
