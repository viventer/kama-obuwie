import CustomerOrderDetails from "@/components/store/checkout/CustomerOrderDetails";
import OrderSummary from "@/components/store/checkout/OrderSummary";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata() {
  return {
    title: `Podziękowanie za zamówienie`,
  };
}

export default async function ThankYouPage(props: Props) {
  const { orderId } = await props.params;
  const { data: orderData } = await getDocumentFromAdminDB<Order>(
    "orders",
    orderId
  );

  if (!orderData) {
    notFound();
  }

  return (
    <div>
      <CustomerOrderDetails orderData={orderData} />
    </div>
  );
}
