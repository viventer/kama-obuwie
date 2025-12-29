import CustomerOrderDetails from "@/components/store/checkout/CustomerOrderDetails";
import OrderContactInfo from "@/components/store/order/OrderContactInfo";
import OrderDeliveryDetails from "@/components/store/order/OrderDeliveryDetails";
import OrderInfo from "@/components/store/order/OrderInfo";
import OrderTransactionDetails from "@/components/store/order/OrderTransactionDetails";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata() {
  return {
    title: `Szczegóły zamówienia`,
  };
}

export default async function OrderDetailsPage(props: Props) {
  const { orderId } = await props.params;
  const { data: orderData } = await getDocumentFromAdminDB<OrderWithId>(
    "orders",
    orderId
  );

  if (!orderData) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-medium text-2xl">Szczegóły zamówienia</h2>
        <p>
          Poniżej znajdziesz dokładne i{" "}
          <span className="font-bold">aktualne</span> informacje dotyczące
          Twojego zamówienia.
        </p>
      </section>
      <OrderInfo orderData={orderData} />
      {orderData.paymentType !== "COD" ? (
        <OrderTransactionDetails orderData={orderData} />
      ) : null}
      <OrderDeliveryDetails orderData={orderData} />
      <CustomerOrderDetails orderData={orderData} />
      <OrderContactInfo />
    </div>
  );
}
