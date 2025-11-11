import { Order, OrderItemType } from "@/firebase/schemas/ordersSchemas";
import OrderItem from "./OrderItem";

export default function CustomerOrderDetails({
  orderData,
}: {
  orderData: Order;
}) {
  const offersData: OrderItemType[] = orderData.lineItems;

  return (
    <div>
      <section className="max-w-xl flex flex-col gap-2 mb-4">
        <h2 className="font-medium text-xl">Zamówione produkty</h2>
        {offersData.map((offer) => (
          <OrderItem key={offer.id} itemData={offer} />
        ))}
      </section>
      <section>
        <p>
          <span className="font-medium text-lg">Koszt dostawy: </span>
          {orderData?.delivery?.cost?.amount} zł
        </p>
        <p>
          <span className="font-medium text-lg">Łączna kwota: </span>
          {orderData?.summary?.totalToPay.amount} zł
        </p>
      </section>
    </div>
  );
}
