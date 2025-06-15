"use client";

import { useFormContext } from "react-hook-form";
import { EditOfferFormValues } from "./EditOfferForm";
import { FormField, FormLabel } from "@/components/ui/form";
import { salesChannels } from "@/lib/constants";
import { Input } from "@/components/ui/input";

export default function SellingPricesField() {
  const { control } = useFormContext<EditOfferFormValues>();

  return (
    <>
      <h3 className="mt-4 mb-2 font-medium">Ceny sprzedaży:</h3>
      <FormField
        control={control}
        name="sellingPrices"
        render={({ field }) => (
          <div className="flex gap-4 flex-wrap">
            {salesChannels.map((channel) => (
              <div key={channel} className="w-[100px]">
                <FormLabel className="text-sm opacity-85 font-normal">
                  {channel}
                </FormLabel>
                <FormField
                  control={control}
                  name={`sellingPrices.${channel}`}
                  render={({ field: channelField }) => (
                    <Input
                      type="number"
                      value={channelField.value || ""}
                      onChange={channelField.onChange}
                      min={1}
                      max={10000}
                      className="no-spinner"
                    />
                  )}
                />
              </div>
            ))}
          </div>
        )}
      />
    </>
  );
}
