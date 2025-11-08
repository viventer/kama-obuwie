"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstStepForm from "./FirstStepForm";
import SecondStepForm from "./SecondStepForm";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckoutDataSchema } from "@/firebase/schemas/checkoutSchemas";
import InPostSelector from "./InPostSelector";
import { useToast } from "@/hooks/useToast";
import PaymentMethodSelector from "./PaymentMethodSelector";
import OrderSummary from "./OrderSummary";

export default function CheckoutForms() {
  const { showToast } = useToast();

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

  // Wyodrębniona funkcja walidacji pierwszego etapu
  const validateFirstStep = async (): Promise<boolean> => {
    return await form.trigger([
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
    ]);
  };

  const goToNextStep = async () => {
    const isValid = await validateFirstStep();

    if (isValid) {
      form.setValue("activeTab", "secondStep");
    }
  };

  const activeTab = form.watch("activeTab");

  const handleTabChange = async (value: string) => {
    if (value === "secondStep") {
      const isValid = await validateFirstStep();

      if (isValid) {
        form.setValue("activeTab", value as "firstStep" | "secondStep");
      } else {
        // Wyświetl toast z komunikatem błędu
        showToast(
          "Proszę uzupełnić wszystkie wymagane pola w pierwszym etapie",
          "error"
        );
      }
    } else {
      // Zawsze pozwól na powrót do pierwszego etapu
      form.setValue("activeTab", value as "firstStep" | "secondStep");
    }
  };

  const placeOrder = () => {};

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
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
        <div
          className={`${
            activeTab != "secondStep" ? "hidden" : ""
          } flex gap-8 justify-between`}
        >
          <div className="space-y-8 flex-1">
            <TabsContent value="secondStep">
              <SecondStepForm form={form} />
            </TabsContent>
            <InPostSelector form={form} />
            <PaymentMethodSelector form={form} />
          </div>
          <OrderSummary orderButtonHandler={placeOrder} form={form} />
        </div>
      </Form>
    </Tabs>
  );
}
