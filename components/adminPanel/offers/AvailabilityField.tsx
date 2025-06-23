"use client";

import { useFormContext } from "react-hook-form";
import { EditOfferFormValues } from "./EditOfferForm";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MiniLoader from "../global/MiniLoader";

export default function AvailabilityField({ sizes }: { sizes: string[] }) {
  const { control } = useFormContext<EditOfferFormValues>();

  return (
    <div>
      <h3 className="font-medium">Dostępność</h3>
      <div className="mt-2 flex gap-3 flex-wrap max-w-md">
        {sizes.length === 0 ? (
          <MiniLoader />
        ) : (
          sizes.map((size) => (
            <FormField
              rules={{ required: "Wartość dostępności jest wymagana." }}
              key={size}
              control={control}
              name={`availability.${size}.value`}
              render={({ field }) => (
                <FormItem className="w-[70px]">
                  <FormLabel className="text-sm opacity-85 font-normal">
                    r. {size}
                  </FormLabel>
                  <Input
                    type="number"
                    value={field.value || ""}
                    onChange={field.onChange}
                    min={0}
                    max={10000}
                  />
                </FormItem>
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}
