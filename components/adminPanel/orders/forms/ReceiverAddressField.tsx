"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreateInpostShipmentData } from "@/firebase/schemas/inpost/shipmentsSchemas";

export default function ReceiverAddressField() {
  const { control } = useFormContext<CreateInpostShipmentData>();

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue=""
      className="shadow-md bg-background/50 rounded-xs max-w-md px-4"
    >
      <AccordionItem value="optional">
        <AccordionTrigger className="font-semibold text-lg hover:cursor-pointer">
          Adres odbiorcy
        </AccordionTrigger>
        <AccordionContent className="mt-2 flex flex-col gap-3 max-w-md">
          <FormField
            control={control}
            name="receiver.first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwisko</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa firmy</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ulica</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.address.building_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numer budynku</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miasto</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.address.post_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod pocztowy</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
