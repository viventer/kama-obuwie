"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Order } from "@/firebase/schemas/ordersSchemas";
import {
  availableInpostSendingMethods,
  CreateShipmentData,
  DeliveryService,
  inpostSendingMethodsTranslation,
  PackageData,
} from "@/firebase/schemas/shipmentsSchemas";
import { useToast } from "@/hooks/useToast";
import { AllegroSalesChannel } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ReceiverAddressField from "./ReceiverAddressField";
import { Input } from "@/components/ui/input";
import PackageDataFormSection from "./PackageDataFormSection";
import SingleSelect from "../../global/form/SingleSelect";

export type CreateLabelFormValues = Pick<
  CreateShipmentData,
  "receiver" | "referenceNumber" | "additionalProperties"
> & {
  package: PackageData;
};

export default function CreateLabelForm({
  orderNumber,
  salesChannel,
  allegroOrderId,
  orderDeliveryData,
  deliveryService,
  buyer,
}: {
  orderNumber: string;
  salesChannel: AllegroSalesChannel;
  allegroOrderId: string;
  orderDeliveryData: NonNullable<Order["delivery"]>;
  deliveryService: DeliveryService;
  buyer: Order["buyer"];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  if (!orderDeliveryData?.address) {
    router.replace("/admin-panel/orders/new");
    showToast("Nie znaleziono danych adresowych zamówienia", "error");
  }

  const form = useForm<CreateLabelFormValues>({
    defaultValues: {
      receiver: {
        name: `${orderDeliveryData.address.firstName} ${orderDeliveryData.address.lastName}`,
        company: orderDeliveryData.address.companyName || undefined,
        street: orderDeliveryData.address.street,
        postalCode: orderDeliveryData.address.zipCode,
        city: orderDeliveryData.address.city,
        countryCode: orderDeliveryData.address.countryCode,
        email: buyer.email,
        phone: orderDeliveryData.address.phoneNumber || undefined,
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
    </Form>
  );
}
