"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstStepForm from "./FirstStepForm";
import SecondStepForm from "./SecondStepForm";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckoutDataSchema } from "@/firebase/schemas/checkoutSchemas";
import { useState } from "react";
import InPostSelector from "./InPostSelector";

export default function CheckoutForms() {
  const form = useForm({
    resolver: zodResolver(CheckoutDataSchema),
    mode: "onSubmit", // Walidacja tylko przy submit
    reValidateMode: "onChange", // Ale ponowna walidacja podczas wpisywania po pierwszym błędzie
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: {
        city: "",
        postalCode: "",
        street: "",
        buildingNumber: "",
        apartmentNumber: "",
      },
      deliveryMethod: "courier",
      paymentMethod: "quickTransfer",
      pickupPoint: undefined,
      activeTab: "firstStep",
    },
  });

  const goToNextStep = () => {
    form.setValue("activeTab", "secondStep");
  };

  const activeTab = form.watch("activeTab");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        form.setValue("activeTab", value as "firstStep" | "secondStep")
      }
    >
      <TabsList className="mb-4">
        <TabsTrigger value="firstStep" className="text-xl font-normal">
          <span className="mr-1 aspect-square text-text bg-brand h-full flex items-center justify-center rounded-xs font-bold text-normal">
            1
          </span>
          Dane podstawowe
        </TabsTrigger>
        <TabsTrigger value="secondStep" className="text-xl font-normal">
          <span className="aspect-square mr-1 text-text bg-brand h-full flex items-center justify-center rounded-xs font-bold text-normal">
            2
          </span>
          Dostawa i płatność
        </TabsTrigger>
      </TabsList>
      <Form {...form}>
        <TabsContent value="firstStep">
          <FirstStepForm form={form} onNext={goToNextStep} />
        </TabsContent>
        <TabsContent value="secondStep">
          <SecondStepForm form={form} />
        </TabsContent>
        <InPostSelector form={form} />
      </Form>
    </Tabs>
  );
}
