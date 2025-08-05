"use client";

import { useFormContext } from "react-hook-form";
import { CreateLabelFormValues } from "./CreateLabelForm";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ReceiverAddressField() {
  const { control } = useFormContext<CreateLabelFormValues>();

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue=""
      className="shadow-md bg-background/50 rounded-sm max-w-md px-4"
    >
      <AccordionItem value="optional">
        <AccordionTrigger className="font-semibold text-lg hover:cursor-pointer">
          Adres odbiorcy
        </AccordionTrigger>
        <AccordionContent className="mt-2 flex flex-col gap-3 max-w-md">
          <FormField
            control={control}
            name="receiver.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię i nazwisko</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa firmy</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ulica</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod pocztowy</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="receiver.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miasto</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
