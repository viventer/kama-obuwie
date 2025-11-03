"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstStepForm from "./FirstStepForm";
import SecondStepForm from "./SecondStepForm";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckoutDataSchema } from "@/firebase/schemas/checkoutSchemas";

export default function CheckoutForms() {
  const form = useForm({
    resolver: zodResolver(CheckoutDataSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      deliveryData: {
        city: "",
        postalCode: "",
        address: "",
        method: "courier",
      },
      paymentMethod: "quickTransfer",
      pickupPoint: undefined,
    },
  });

  return (
    <Tabs defaultValue="firstStep">
      <TabsList>
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
          <FirstStepForm />
        </TabsContent>
        <TabsContent value="secondStep">
          <SecondStepForm />
        </TabsContent>
      </Form>
    </Tabs>
  );
}
