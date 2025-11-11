import CustomerOrderDetails from "@/components/store/checkout/CustomerOrderDetails";
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
    <div className="space-y-8">
      <section>
        <h2 className="font-medium text-2xl">Dziękujemy za zamówienie</h2>
        <p>Informacje o dostawie otrzymasz na podany adres e-mail.</p>
      </section>
      <CustomerOrderDetails orderData={orderData} />
    </div>
  );
}
