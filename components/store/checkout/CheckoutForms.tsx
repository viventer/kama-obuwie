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
import { FrontendOrder } from "@/firebase/schemas/ordersSchemas";
import { useShoppingCart } from "@/hooks/useShoppingCart";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useFullPageLoading } from "@/components/adminPanel/global/FullPageLoader";
import {
  fetchOffersData,
  checkCartItemsAvailability,
} from "@/helpers/checkCartAvailability";
import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";
import { handleApiError } from "@/server-actions/errorHandlers";
import { RegisterTransactionData } from "@/firebase/schemas/p24Schemas";

export default function CheckoutForms() {
  const { showToast } = useToast();
  const { cart, clearCart, isLoading, updateItemAvailability } =
    useShoppingCart();
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { startLoading, stopLoading } = useFullPageLoading();
  const { showDialog } = useConfirmDialog();

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
      totalToPay: "0",
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

  const placeOrder = async () => {
    startLoading();

    try {
      const offersData = await fetchOffersData(cart);
      const availabilityCheck = checkCartItemsAvailability(
        cart,
        offersData,
        updateItemAvailability
      );

      if (availabilityCheck.hasUnavailable) {
        stopLoading();

        showDialog({
          message: "Niektóre produkty są już niedostępne.",
          description: "Usuń je z koszyka przed złożeniem zamówienia.",
          onConfirm: () => {
            router.push("/shopping-cart");
          },
          hasCancelButton: false,
          variant: "error",
          confirmText: "Przejdź do koszyka",
        });

        return;
      }

      // Proceed with order placement
      const checkoutData = form.getValues();
      if (checkoutData.deliveryMethod === "parcelLocker") {
        checkoutData.address = null;
      }

      // showDialog({
      //   message: "Obecnie nie przyjmujemy zamówień poprzez sklep internetowy.",
      //   description:
      //     "Zamówienie możesz złożyć przez Allegro. Oczekujemy na podłączenie płatności online w naszym sklepie.",
      //   confirmText: "Kup przez Allegro",
      //   cancelText: "Anuluj",
      //   onConfirm: () => {
      //     window.location.href = "https://allegro.pl/uzytkownik/kama-obuwie_pl";
      //   },
      // });

      // return;

      const orderData: FrontendOrder = {
        checkoutData,
        shoppingCartItems: cart.map((cartItem) => ({ ...cartItem.item })),
      };

      const response = await axios.post("/api/orders", orderData);
      clearCart();

      if (checkoutData.paymentMethod === "COD") {
        while (isLoading) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        stopLoading();
        router.replace(`/order-summary/${response.data.id}`);
        return;
      }

      const { data: createdOrder } = await axios.get(
        `/api/orders/${response.data.id}`
      );

      const transactionData: Pick<
        RegisterTransactionData,
        "amount" | "email" | "channel"
      > = {
        amount: Math.round(
          parseFloat(createdOrder.summary.totalToPay.amount) * 100
        ),
        email: checkoutData.email,
      };

      try {
        const { data: p24Response } = await axios.post("/api/p24/register", {
          transactionData,
          orderId: response.data.id,
        });
        window.location.href = p24Response.url;
      } catch (err) {
        handleApiError(err, "Błąd podczas rejestracji transakcji P24.");
        return;
      } finally {
        stopLoading();
      }
    } catch (err: any) {
      stopLoading();
      handleError(err, "Błąd podczas składania zamówienia.");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-4 gap-0 2xs:gap-2">
        <TabsTrigger
          value="firstStep"
          className="text-sm font-normal xs:text-base sm:text-lg"
        >
          <span className="mr-1 aspect-square text-text bg-brand h-full items-center justify-center rounded-xs font-bold text-normal hidden xs:flex">
            1
          </span>
          Dane{" "}
          <span className="max-w-[60px] overflow-hidden whitespace-nowrap text-ellipsis 2xs:max-w-full">
            podstawowe
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="secondStep"
          className="text-sm font-normal xs:text-base sm:text-lg"
        >
          <span className="aspect-square mr-1 text-text bg-brand h-full items-center justify-center rounded-xs font-bold text-normal hidden xs:flex">
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
          } flex flex-col gap-8 justify-between xl:flex-row`}
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
