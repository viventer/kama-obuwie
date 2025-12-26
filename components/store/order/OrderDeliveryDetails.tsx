import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { TruckIcon } from "lucide-react";

export default function OrderDeliveryDetails({
  orderData,
}: {
  orderData: OrderWithId;
}) {
  if (!orderData.delivery) {
    return null;
  }

  return (
    <Card className="gap-2 max-w-xl">
      <CardHeader className="mb-0">
        <CardTitle className="font-medium text-xl flex gap-2 items-center">
          <TruckIcon className="text-brand" />
          Dane dostawy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <b>Email: </b>
          {orderData.buyer.email}
        </p>
        <p>
          <b>Nr telefonu: </b>
          {orderData.buyer.phoneNumber}
        </p>
        <p>
          <b>Metoda: </b>
          {orderData.paymentType === "COD"
            ? "Kurier InPost Pobranie"
            : orderData.delivery.method === "courier"
              ? "Kurier InPost"
              : "Paczkomat InPost"}
        </p>
        {orderData.delivery.address && (
          <section>
            <p className="m-0 font-bold">Adres:</p>
            <p>
              {orderData.delivery.address.zipCode}{" "}
              {orderData.delivery.address.city}
            </p>
            <p>
              ul. {orderData.delivery.address.street}{" "}
              {orderData.delivery.address.buildingNumber}
              {orderData.delivery.address.apartmentNumber
                ? `/${orderData.delivery.address.apartmentNumber}`
                : ""}
            </p>
          </section>
        )}
        {orderData.delivery.pickupPoint && (
          <section>
            <p className="m-0 font-bold">
              Paczkomat {orderData.delivery.pickupPoint.name}
            </p>
            <p>{orderData.delivery.pickupPoint.address.city}</p>
            <p>ul. {orderData.delivery.pickupPoint.address.street}</p>
            <p>{orderData.delivery.pickupPoint.description}</p>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
