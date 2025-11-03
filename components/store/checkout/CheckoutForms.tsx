"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstStepForm from "./FirstStepForm";
import SecondStepForm from "./SecondStepForm";

export default function CheckoutForms() {
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
      <TabsContent value="firstStep">
        <FirstStepForm />
      </TabsContent>
      <TabsContent value="secondStep">
        <SecondStepForm />
      </TabsContent>
    </Tabs>
  );
}
