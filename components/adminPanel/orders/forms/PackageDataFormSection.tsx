"use client";

import { useFormContext } from "react-hook-form";
import { CreateLabelFormValues } from "./CreateLabelForm";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function PackageDataFormSection() {
  const { control } = useFormContext<CreateLabelFormValues>();

  return (
    <section>
      <h3 className="font-medium text-lg">Dane przesyłki</h3>
      <div className="mt-2 flex flex-col gap-3 max-w-md">
        <FormField
          control={control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numer referencyjny</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="package.textOnLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tekst na etykiecie</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="package.length.value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Długość (cm)</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="package.width.value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szerokość (cm)</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="package.height.value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wysokość (cm)</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="package.weight.value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Waga (kg)</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
