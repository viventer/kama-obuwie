"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Order, OrderWithId } from "@/firebase/schemas/ordersSchemas";
import {
  availableInpostSendingMethods,
  CreateShipmentData,
  inpostSendingMethodsTranslation,
  PackageData,
} from "@/firebase/schemas/shipmentsSchemas";
import { useToast } from "@/hooks/useToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { bankAccountData, senderAddress } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import SingleSelect from "../../global/form/SingleSelect";
import { Button } from "@/components/ui/button";
import { FormEvent } from "react";
import axios from "axios";
import { useFullPageLoading } from "@/components/adminPanel/global/FullPageLoader";
import { CreateInpostShipmentData } from "@/firebase/schemas/inpost/shipmentsSchemas";
import ReceiverAddressField from "./ReceiverAddressField";
import PackageDataFormSection from "./PackageDataFormSection";

export type CreateAllegroLabelFormValues = Pick<
  CreateShipmentData,
  "receiver" | "referenceNumber" | "additionalProperties"
> & {
  package: PackageData;
};

export default function CreateLabelForm({
  orderData,
}: {
  orderData: OrderWithId;
}) {
  const {
    number: orderNumber,
    buyer,
    delivery: orderDeliveryData,
    salesChannel,
    summary: orderSummary,
  } = orderData as OrderWithId & {
    delivery: NonNullable<Order["delivery"]>;
  };

  const router = useRouter();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const { startLoading, stopLoading } = useFullPageLoading();

  if (!orderDeliveryData?.address) {
    router.replace("/admin-panel/orders/new");
    showToast("Nie znaleziono danych adresowych zamówienia", "error");
  }

  const form = useForm<CreateInpostShipmentData>({
    defaultValues: {
      receiver: {
        company_name: orderDeliveryData.address?.companyName || undefined,
        first_name: orderDeliveryData.address?.firstName || undefined,
        last_name: orderDeliveryData.address?.firstName || undefined,
        email: buyer.email,
        phone: buyer.phoneNumber!,
        address: {
          street: orderDeliveryData.address?.street || "",
          building_number:
            orderDeliveryData.address?.buildingNumber ||
            "" + orderDeliveryData.address?.apartmentNumber
              ? ` / ${orderDeliveryData.address?.apartmentNumber}`
              : "",
          city: orderDeliveryData.address?.city || "",
          post_code: orderDeliveryData.address?.zipCode || "",
          country_code: "PL",
        },
      },
      parcels: [
        {
          template: "medium",
        },
      ],
      reference: orderNumber,
      service:
        orderDeliveryData.method == "courier"
          ? "inpost_courier_standard"
          : "inpost_locker_standard",
      additional_services: ["sms", "email"],
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
    const totalToPay = Number(orderSummary.totalToPay.amount);

    const insuranceAmount = totalToPay - deliveryPrice - refundAmount;

    const formData = form.getValues();
    const data: CreateInpostShipmentData = {
      ...formData,
      insurance: {
        amount: insuranceAmount,
        currency: "PLN",
      },
    };

    if (orderData.paymentType == "COD") {
      data.cod = {
        amount: totalToPay,
        currency: "PLN",
      };
    }

    if (orderDeliveryData.method == "parcelLocker") {
      data.custom_attributes = {
        target_point: orderDeliveryData.pickupPoint!.name,
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
