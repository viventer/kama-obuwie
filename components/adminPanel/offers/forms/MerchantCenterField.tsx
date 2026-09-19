"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function MerchantCenterField({
  colorVariants,
}: {
  colorVariants: string[];
}) {
  const { control, watch, setValue } = useFormContext<PostOfferFormValues>();
  const titles = watch("title");
  const addToMerchantCenter = watch("addToMerchantCenter");
  const manuallyEditedVariants = useRef(new Set<string>());

  useEffect(() => {
    for (const variant of colorVariants) {
      if (manuallyEditedVariants.current.has(variant)) continue;
      setValue(`merchantCenterTitle.${variant}`, titles?.[variant] ?? "");
    }
  }, [titles, colorVariants, setValue]);

  return (
    <div className="flex flex-col gap-3">
      <FormField
        control={control}
        name="addToMerchantCenter"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </FormControl>
            <FormLabel className="font-medium leading-none">
              Dodaj do Merchant Center
            </FormLabel>
          </FormItem>
        )}
      />
      <div>
        <h3 className="font-medium">Tytuły Merchant Center:</h3>
        <FormField
          control={control}
          name="merchantCenterTitle"
          render={() => (
            <div className="flex gap-4 flex-wrap">
              {colorVariants.map((variant) => (
                <div key={variant} className="max-w-md w-full">
                  <FormLabel className="text-sm opacity-85 font-normal">
                    {variant}
                  </FormLabel>
                  <FormField
                    control={control}
                    name={`merchantCenterTitle.${variant}`}
                    render={({ field: variantField }) => (
                      <FormItem className="max-w-md">
                        <FormControl>
                          <Input
                            type="text"
                            value={variantField.value || ""}
                            onChange={(e) => {
                              manuallyEditedVariants.current.add(variant);
                              variantField.onChange(e);
                            }}
                            minLength={3}
                            maxLength={140}
                            disabled={!addToMerchantCenter}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  );
}
