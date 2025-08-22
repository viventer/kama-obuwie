"use client";

import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { Input } from "@/components/ui/input";
import MiniLoader from "../../global/MiniLoader";

export default function EANsField({
  colorVariants,
  sizes,
}: {
  colorVariants: string[];
  sizes: string[];
}) {
  const { control } = useFormContext<PostOfferFormValues>();

  if (colorVariants.length === 0 || sizes.length === 0) {
    return <MiniLoader />;
  }

  return (
    <div>
      <h3 className="font-medium">EAN</h3>
      <div className="mt-2 flex gap-8 flex-wrap max-w-md">
        {colorVariants.map((colorVariant) => (
          <div key={colorVariant}>
            <FormLabel className="font-normal">{colorVariant}</FormLabel>
            {sizes.map((size) => (
              <FormField
                key={size}
                // rules={{ required: "EAN jest wymagany dla każdego rozmiaru." }}
                control={control}
                name={`EAN.${colorVariant}.r${size}`}
                render={({ field }) => (
                  <FormItem className="w-[150px] gap-0">
                    <FormLabel className="text-sm opacity-85 font-normal">
                      r. {size}
                    </FormLabel>
                    <Input
                      type="text"
                      minLength={13}
                      maxLength={13}
                      value={field.value || ""}
                      onChange={field.onChange}
                      className="mb-4"
                    />
                  </FormItem>
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
