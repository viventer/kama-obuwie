"use client";

import { Button } from "@/components/ui/button";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { formatDate } from "@/lib/utils";
import LinkText from "../global/LinkText";
import { useToast } from "@/hooks/useToast";
import { useDialogWindow } from "@/components/providers/DialogWindowProvider";
import { useRouter } from "next/navigation";

export default function ShipmentsDialogContent({
  shipmentData,
  orderId,
}: {
  shipmentData: Order["shipment"];
  orderId: string;
}) {
  const router = useRouter();
  const addParcel = () => {
    router.push(`/admin-panel/orders/create-label/${orderId}`);
    closeDialog();
  };
  const { showToast } = useToast();
  const { closeDialog } = useDialogWindow();

  if (!shipmentData?.shipmentIds) {
    showToast("Brak danych o przesyłkach", "error");
    return;
  }

  return (
    <div className="flex flex-col gap-4">
      <section>
        <p>
          Data utworzenia:{" "}
          <span className="font-medium">
            {formatDate(shipmentData?.createdAt) || "nieznana"}
          </span>
        </p>
        <p>
          Przewoźnik:{" "}
          <span className="font-medium">
            {shipmentData?.carrier || "nieznany"}
          </span>
        </p>
        <p>
          Podjazd:{" "}
          <span className="font-medium">
            {shipmentData?.pickupDate || "nie zamówiony"}
          </span>
        </p>
      </section>
      <section>
        <h3 className="font-medium text-lg mb-0">Dodane przesyłki: </h3>
        <ul>
          {Object.entries(shipmentData?.shipmentIds).map(
            ([parcelNumber, shipmentId]) => (
              <li key={parcelNumber} className="flex gap-4">
                <span className="font-medium">{parcelNumber}</span>
                <LinkText
                  href={`/admin-panel/orders/pickup/${orderId}?shipmentId=${shipmentId}`}
                  onClick={() => closeDialog()}
                >
                  Zamów podjazd
                </LinkText>
              </li>
            )
          )}
        </ul>
      </section>
      <div className="flex mt-4 gap-4">
        <Button onClick={() => addParcel()} className="w-fit">
          Dodaj nową przesyłkę
        </Button>
      </div>
    </div>
  );
}
