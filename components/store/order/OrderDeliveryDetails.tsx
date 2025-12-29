import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { TruckIcon } from "lucide-react";
import Link from "next/link";

export default function OrderDeliveryDetails({
  orderData,
}: {
  orderData: OrderWithId;
}) {
  if (!orderData.delivery) {
    return null;
  }

  const parcelNumber = orderData.shipment?.parcelNumbers?.[0];

  return (
    <Card className="gap-2 max-w-xl">
      <CardHeader className="mb-0">
        <CardTitle className="font-medium text-xl flex gap-2 items-center">
          <TruckIcon className="text-brand" />
          Dane dostawy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parcelNumber && (
          <section className="mb-4">
            <Button variant={"important"} className="mb-2" asChild>
              <Link
                href={`https://inpost.pl/sledzenie-przesylek?number=${parcelNumber}`}
              >
                Śledź przesyłkę
              </Link>
            </Button>
            <p className="text-sm">
              <b>Nr przesyłki: </b>
              {parcelNumber}
            </p>
          </section>
        )}

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
