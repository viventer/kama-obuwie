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
import { getCurrentDateTimeInPoland } from "@/helpers/datetime";

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

  const isCourier = orderDeliveryData.method === "courier";

  const form = useForm<CreateInpostShipmentData>({
    defaultValues: {
      receiver: {
        company_name: orderDeliveryData.address?.companyName || undefined,
        first_name: orderDeliveryData.address?.firstName || undefined,
        last_name: orderDeliveryData.address?.lastName || undefined,
        email: buyer.email,
        phone: buyer.phoneNumber!,
        address: {
          street: orderDeliveryData.address?.street || "",
          building_number: orderDeliveryData.address?.apartmentNumber
            ? orderDeliveryData.address!.buildingNumber +
              ` / ${orderDeliveryData.address?.apartmentNumber}`
            : orderDeliveryData.address?.buildingNumber
              ? orderDeliveryData.address.buildingNumber
              : "",
          city: orderDeliveryData.address?.city || "",
          post_code: orderDeliveryData.address?.zipCode || "",
          country_code: "PL",
        },
      },
      // Kurier: wymiary + waga (bez template). Paczkomat: tylko template.
      // Szablon lockerowy ma na stałe przypisaną wagę 25 kg i nadpisuje weight w API InPost.
      parcels: isCourier
        ? [
            {
              dimensions: {
                length: 64,
                width: 38,
                height: 19,
                unit: "mm",
              },
              weight: {
                amount: 1,
                unit: "kg",
              },
            },
          ]
        : [
            {
              template: "medium",
            },
          ],
      reference: orderNumber,
      service: isCourier ? "inpost_courier_standard" : "inpost_locker_standard",
      // additional_services: ["sms", "email"],
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
    const isCOD = orderData.paymentType == "COD";

    // InPost wymaga, żeby insurance === cod; dla COD nie odejmujemy dostawy/zwrotu
    const insuranceAmount = isCOD
      ? totalToPay
      : totalToPay - deliveryPrice - refundAmount;

    const formData = form.getValues();

    const parcels = formData.parcels.map((parcel) => {
      if (formData.service === "inpost_courier_standard") {
        return {
          dimensions: {
            // Formularz zbiera cm, ShipX wymaga mm
            length: Number(parcel.dimensions?.length) * 10,
            width: Number(parcel.dimensions?.width) * 10,
            height: Number(parcel.dimensions?.height) * 10,
            unit: "mm" as const,
          },
          weight: {
            amount: Number(parcel.weight?.amount),
            unit: "kg" as const,
          },
        };
      }

      return {
        template: parcel.template,
      };
    });

    // Usuń adres odbiorcy dla przesyłek do paczkomatu
    const receiver = { ...formData.receiver };
    if (orderDeliveryData.method === "parcelLocker") {
      delete receiver.address;
    }

    const data: CreateInpostShipmentData = {
      ...formData,
      receiver,
      parcels,
      insurance: {
        amount: insuranceAmount,
        currency: "PLN",
      },
    };

    if (isCOD) {
      data.cod = {
        amount: totalToPay,
        currency: "PLN",
      };
    }

    if (orderDeliveryData.method == "parcelLocker") {
      data.custom_attributes = {
        target_point: orderDeliveryData.pickupPoint!.name,
        sending_method: "dispatch_order",
      };
    } else {
      data.custom_attributes = {
        sending_method: "dispatch_order",
      };
    }

    try {
      const response = await axios.post("/api/inpost/shipment", data);
      const shipmentId = String(response.data.shipmentId);
      const parcelNumber = response.data.parcelNumber;

      if (!shipmentId || !parcelNumber) {
        stopLoading();
        showToast("Nie udało się utworzyć przesyłki InPost", "error");
        return;
      }

      const labelResponse = await axios.get(
        `/api/inpost/shipment/label/${shipmentId}`
      );
      const downloadUrl = labelResponse?.data?.downloadUrl;

      if (!downloadUrl) {
        stopLoading();
        showToast("Nie udało się pobrać etykiety InPost", "error");
        return;
      }

      window.open(downloadUrl, "_blank");

      await axios.patch(`/api/orders/${orderData.id}`, {
        shipment: {
          isCreated: true,
          isPickupOrdered: true,
          parcelNumbers: [
            ...(orderData?.shipment?.parcelNumbers || []),
            parcelNumber,
          ],
          labelFilePath: labelResponse.data.storagePath,
          shipmentIds: {
            ...(orderData?.shipment?.shipmentIds || {}),
            [parcelNumber]: shipmentId,
          },
          isPickupAvailable: false,
          createdAt:
            orderData?.shipment?.createdAt || getCurrentDateTimeInPoland(),
          updatedAt: getCurrentDateTimeInPoland(),
          carrier: "Inpost",
        },
      });

      stopLoading();

      router.back();

      showToast(
        `Etykieta została pomyślnie utworzona i zapisana w chmurze (${labelResponse.data.storagePath})`,
        "success"
      );
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
