"use client";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { FormEvent } from "react";
import { UseFormReturn } from "react-hook-form";

export default function FirstStepForm({
  form,
  onNext,
}: {
  form: UseFormReturn<CheckoutData>;
  onNext?: () => void;
}) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Walidacja tylko pól z pierwszego etapu
    const isValid = await form.trigger([
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
    ]);

    if (isValid) {
      // Przejście do następnego etapu
      onNext?.();
    } else {
      console.log("Niektóre pola zawierają błędy");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem className="max-w-2xs">
            <FormLabel>Imię</FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  // Usuwamy błąd dla tego pola po rozpoczęciu edycji
                  form.clearErrors("firstName");
                }}
              />
            </FormControl>
            <FormMessage className="text-text" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem className="max-w-2xs">
            <FormLabel>Nazwisko</FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("lastName");
                }}
              />
            </FormControl>
            <FormMessage className="text-text" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem className="max-w-2xs">
            <FormLabel>Numer telefonu</FormLabel>
            <FormControl>
              <Input
                {...field}
                maxLength={9}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("phoneNumber");
                }}
              />
            </FormControl>
            <FormMessage className="text-text" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="max-w-2xs">
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors("email");
                }}
              />
            </FormControl>
            <FormMessage className="text-text" />
          </FormItem>
        )}
      />
      <Button
        variant={"important"}
        className="w-fit mt-4"
        onClick={(e) => handleSubmit(e)}
      >
        Przejdź dalej
      </Button>
    </div>
  );
}
