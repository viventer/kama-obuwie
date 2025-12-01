"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  CreateInpostShipmentData,
  InpostServiceName,
} from "@/firebase/schemas/inpost/shipmentsSchemas";

export default function PackageDataFormSection() {
  const { control, watch } = useFormContext<CreateInpostShipmentData>();

  const serviceName: InpostServiceName = watch("service");

  return (
    <section>
      <h3 className="font-medium text-lg">Dane przesyłki</h3>
      <div className="mt-2 flex flex-col gap-3 max-w-md">
        <FormField
          control={control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numer referencyjny</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        {serviceName == "inpost_locker_standard" ? (
          <FormField
            control={control}
            name="parcels.0.template"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rozmiar przesyłki</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
        ) : (
          <>
            <FormField
              control={control}
              name="parcels.0.dimensions.length"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Długość (cm)</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parcels.0.dimensions.width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Szerokość (cm)</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parcels.0.dimensions.height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wysokość (cm)</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="parcels.0.weight.amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waga (kg)</FormLabel>
                  <Input {...field} />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </section>
  );
}
