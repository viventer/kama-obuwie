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
    // Delegacja walidacji i przełączania do rodzica
    onNext?.();
  };

  // Funkcja do obsługi zmian w polach z automatycznym czyszczeniem błędów
  const handleFieldChange =
    (fieldName: "firstName" | "lastName" | "phoneNumber" | "email") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Aktualizuj wartość pola
      form.setValue(fieldName, e.target.value);
      // Usuń błąd dla tego pola jeśli istnieje
      if (form.formState.errors[fieldName]) {
        form.clearErrors(fieldName);
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
                onChange={handleFieldChange("firstName")}
                maxLength={24}
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
                onChange={handleFieldChange("lastName")}
                maxLength={36}
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
                onChange={handleFieldChange("phoneNumber")}
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
                onChange={handleFieldChange("email")}
                maxLength={254}
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
