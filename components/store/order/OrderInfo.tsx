import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { getShippingInfo } from "@/helpers/store";
import { orderStatusTranslations } from "@/lib/constants";
import { InfoIcon } from "lucide-react";

export default function OrderInfo({ orderData }: { orderData: OrderWithId }) {
  const isCancelled = orderData.fulfillment!.status === "CANCELLED";
  const deliveryDate = getShippingInfo(new Date(orderData.createdAt), true);

  return (
    <Card className="gap-2 max-w-xl">
      <CardHeader className="mb-0">
        <CardTitle className="font-medium text-xl flex gap-2 items-center">
          <InfoIcon className="text-brand" />
          Informacje o zamówieniu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-2">
          Status:{" "}
          <span className="font-medium underline decoration-success decoration-2 underline-offset-2">
            {orderStatusTranslations[orderData.fulfillment!.status]}
          </span>
        </p>
        <p>
          <b>Numer zamówienia: </b>
          {orderData.number}
        </p>
        <p>
          <b>Data złożenia zamówienia: </b>
          {new Date(orderData.createdAt).toLocaleString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {!isCancelled && (
          <p>
            <b>Przewidywany czas dostawy: </b>
            {deliveryDate}
          </p>
        )}
        {orderData.fulfillment!.status === "UNPAID" && (
          <p className="text-sm mt-2">
            Przewidywany czas dostawy zakłada otrzymanie płatności za zamówienie
            w momencie jego złożenia.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
