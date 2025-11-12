"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Order, OrderWithId } from "@/firebase/schemas/ordersSchemas";
import {
  availableInpostSendingMethods,
  CreateShipmentData,
  DeliveryService,
  inpostSendingMethodsTranslation,
  PackageData,
} from "@/firebase/schemas/shipmentsSchemas";
import { useToast } from "@/hooks/useToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  AllegroSalesChannel,
  bankAccountData,
  senderAddress,
} from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import ReceiverAddressField from "./ReceiverAddressField";
import PackageDataFormSection from "./PackageDataFormSection";
import SingleSelect from "../../global/form/SingleSelect";
import { Button } from "@/components/ui/button";
import { FormEvent } from "react";
import axios from "axios";
import { useFullPageLoading } from "@/components/adminPanel/global/FullPageLoader";

export type CreateLabelFormValues = Pick<
  CreateShipmentData,
  "receiver" | "referenceNumber" | "additionalProperties"
> & {
  package: PackageData;
};

export default function CreateLabelForm({
  orderData,
  deliveryService,
}: {
  orderData: OrderWithId;
  deliveryService: DeliveryService;
}) {
  const {
    number: orderNumber,
    buyer,
    delivery: orderDeliveryData,
    salesChannel,
  } = orderData as OrderWithId & {
    delivery: NonNullable<Order["delivery"]>;
    salesChannel: AllegroSalesChannel;
  };

  const router = useRouter();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const { startLoading, stopLoading } = useFullPageLoading();

  if (!orderDeliveryData?.address) {
    router.replace("/admin-panel/orders/new");
    showToast("Nie znaleziono danych adresowych zamówienia", "error");
  }

  const form = useForm<CreateLabelFormValues>({
    defaultValues: {
      receiver: {
        name: `${orderDeliveryData!.address!.firstName} ${
          orderDeliveryData.address!.lastName
        }`,
        company: orderDeliveryData.address!.companyName || undefined,
        street: orderDeliveryData.address!.street,
        postalCode: orderDeliveryData.address!.zipCode,
        city: orderDeliveryData.address!.city,
        countryCode: orderDeliveryData.address!.countryCode,
        email: buyer.email,
        phone: orderDeliveryData.address!.phoneNumber || undefined,
        point: orderDeliveryData?.pickupPoint?.id || undefined,
      },
      referenceNumber: orderNumber,
      package: {
        type: "PACKAGE" as const,
        length: {
          value: 64,
          unit: "CENTIMETER",
        },
        width: {
          value: 38,
          unit: "CENTIMETER",
        },
        height: {
          value: 19,
          unit: "CENTIMETER",
        },
        weight: {
          value: 1,
          unit: "KILOGRAMS",
        },
        textOnLabel: orderNumber,
      },
      additionalProperties: {},
    },
  });

  const handleReject = async (e: FormEvent) => {
    e.preventDefault();

    router.back();
    showToast("Zmiany zostały odrzucone.", "default");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    startLoading();

    const deliveryPrice = Number(orderDeliveryData?.cost?.amount) || 0;
    const refundAmount = Number(orderData.refund?.amount?.amount) || 0;
    const totalToPay = Number(orderData.summary.totalToPay.amount);

    const insuranceAmount = totalToPay - deliveryPrice - refundAmount;

    const formData = form.getValues();
    const data: CreateShipmentData = {
      deliveryMethodId: orderDeliveryData!.method!.id,
      credentialsId: deliveryService.id?.credentialsId,
      sender: senderAddress,
      receiver: formData.receiver,
      referenceNumber: formData.referenceNumber,
      packages: [formData.package],
      insurance: {
        amount: insuranceAmount.toFixed(2),
        currency: "PLN",
      },
      labelFormat: "PDF",
    };

    if (deliveryService.carrierId === "INPOST") {
      data.additionalProperties = formData.additionalProperties;
    }

    if (
      orderData!.allegroPayment!.type === "CASH_ON_DELIVERY" &&
      deliveryService.cashOnDelivery?.forceRequireIban === false
    ) {
      data.cashOnDelivery = {
        amount: totalToPay.toFixed(2),
        currency: "PLN",
      };
    } else if (
      orderData!.allegroPayment!.type === "CASH_ON_DELIVERY" &&
      deliveryService.cashOnDelivery?.forceRequireIban === true
    ) {
      data.cashOnDelivery = {
        ...bankAccountData,
        amount: totalToPay.toFixed(2),
        currency: "PLN",
      };
    }

    try {
      const response = await axios.post(
        "/api/allegro/shipment-management/label",
        {
          data,
          account: salesChannel,
        }
      );

      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, "_blank");

        await axios.patch(`/api/orders/${orderData.id}`, {
          shipment: {
            isCreated: true,
            isPickupOrdered:
              deliveryService.carrierId === "INPOST" ||
              orderData?.shipment?.isPickupOrdered ||
              false,
            parcelNumbers: [
              ...(orderData?.shipment?.parcelNumbers || []),
              response.data.parcelNumber,
            ],
            labelFilePath: response.data.storagePath,
            shipmentIds: {
              ...(orderData?.shipment?.shipmentIds || {}),
              [response.data.parcelNumber]: response.data.shipmentId,
            },
            isPickupAvailable: response.data.isPickupAvailable,
            createdAt:
              orderData?.shipment?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            carrier: deliveryService.carrierId,
          },
        });

        stopLoading();

        if (
          response.data.isPickupAvailable &&
          deliveryService.carrierId !== "INPOST"
        ) {
          router.replace(
            `/admin-panel/orders/pickup/${orderData.id}?shipmentId=${response.data.shipmentId}`
          );
        } else {
          router.back();
        }

        showToast(
          `Etykieta została pomyślnie utworzona i zapisana w chmurze (${response.data.storagePath})`,
          "success"
        );
      } else {
        stopLoading();
        console.error("Brak downloadUrl w odpowiedzi:", response.data);
        showToast(
          "Etykieta została utworzona, ale nie znaleziono linku do pobrania",
          "error"
        );
      }
    } catch (err: any) {
      handleError(
        err,
        "Wystąpił nieoczekiwany błąd podczas tworzenia etykiety"
      );
      stopLoading();
      return;
    }
  };

  return (
    <Form {...form}>
      <div className="flex flex-col gap-6 mt-6">
        <ReceiverAddressField />
        <PackageDataFormSection />
        {deliveryService.carrierId == "INPOST" && (
          <FormField
            control={form.control}
            name="additionalProperties.inpost#sendingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sposób nadania</FormLabel>
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  availableOptions={availableInpostSendingMethods.map(
                    (method) => ({
                      name: inpostSendingMethodsTranslation[method],
                      value: method,
                    })
                  )}
                  defaultValue="dispatch_order"
                />
              </FormItem>
            )}
          />
        )}
      </div>
      <div className="flex mt-8 gap-4">
        <Button onClick={(e) => handleSubmit(e)} className="w-fit">
          Wygeneruj etykietę
        </Button>
        <Button
          onClick={(e) => handleReject(e)}
          className="w-fit"
          variant="destructive"
        >
          Odrzuć
        </Button>
      </div>
    </Form>
  );
}
