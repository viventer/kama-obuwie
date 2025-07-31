import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Order } from "@/firebase/schemas/ordersSchemas";
import {
  CreateShipmentData,
  CreateShipmentDataSchema,
  DeliveryService,
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
          value: 0,
          unit: "CENTIMETER",
        },
        width: {
          value: 0,
          unit: "CENTIMETER",
        },
        height: {
          value: 0,
          unit: "CENTIMETER",
        },
        weight: {
          value: 0,
          unit: "KILOGRAMS",
        },
        textOnLabel: orderNumber,
      },
      additionalProperties: {},
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-6">
        <ReceiverAddressField />
        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numer referencyjny</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="package.textOnLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tekst na etykiecie</FormLabel>
              <Input {...field} />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
