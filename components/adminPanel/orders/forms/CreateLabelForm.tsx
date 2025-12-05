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

    const insuranceAmount = totalToPay - deliveryPrice - refundAmount;

    const formData = form.getValues();

    const parcels = formData.parcels.map((parcel) => {
      const convertedParcel = { ...parcel };

      if (convertedParcel.dimensions) {
        convertedParcel.dimensions = {
          length: Number(convertedParcel.dimensions.length),
          width: Number(convertedParcel.dimensions.width),
          height: Number(convertedParcel.dimensions.height),
          unit: "mm" as const,
        };
      }

      if (convertedParcel.weight) {
        convertedParcel.weight = {
          amount: Number(convertedParcel.weight.amount),
          unit: "kg" as const,
        };
      }

      return convertedParcel;
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
          createdAt: orderData?.shipment?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          carrier: "Inpost",
        },
      });

      stopLoading();

      router.back();

      showToast(
        `Etykieta została pomyślnie utworzona i zapisana w chmurze (${response.data.storagePath})`,
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
