"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { FormField, FormLabel } from "@/components/ui/form";
import { salesChannels } from "@/lib/constants";
import { Input } from "@/components/ui/input";

export default function SellingPricesField() {
  const { control } = useFormContext<PostOfferFormValues>();

  return (
    <div>
      <h3 className="font-medium">Ceny sprzedaży:</h3>
      <FormField
        rules={{ required: "Ceny sprzedaży są wymagane." }}
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
    </div>
  );
}
