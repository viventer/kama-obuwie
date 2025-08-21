"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function TitlesField({
  colorVariants,
}: {
  colorVariants: string[];
}) {
  const { control } = useFormContext<PostOfferFormValues>();

  return (
    <div>
      <h3 className="font-medium">Tytuły ofert:</h3>
      <FormField
        rules={{ required: "Tytuły ofert są wymagane." }}
        control={control}
        name="title"
        render={() => (
          <div className="flex gap-4 flex-wrap">
            {colorVariants.map((variant) => (
              <div key={variant} className="max-w-md w-full">
                <FormLabel className="text-sm opacity-85 font-normal">
                  {variant}
                </FormLabel>
                <FormField
                  control={control}
                  name={`title.${variant}`}
                  render={({ field: variantField }) => (
                    <Input
                      type="text"
                      value={variantField.value || ""}
                      onChange={variantField.onChange}
                      minLength={12}
                      maxLength={72}
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
