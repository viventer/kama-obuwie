import CustomerOrderDetails from "@/components/store/checkout/CustomerOrderDetails";
import TrustmateReviewInvitation from "@/components/store/global/TrustmateReviewInvitation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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

  const userName =
    [orderData.buyer.firstName, orderData.buyer.lastName]
      .filter(Boolean)
      .join(" ") || orderData.buyer.email;

  return (
    <div className="space-y-6 my-4">
      <section>
        <h2 className="font-medium text-2xl">Dziękujemy za zamówienie</h2>
        <p>
          Informacje o jego realizacji i dostawie otrzymasz na Twój adres
          e-mail.
        </p>
      </section>
      <Card className="gap-2 max-w-xl">
        <CardHeader className="mb-0">
          <CardTitle className="font-medium text-xl">
            Sprawdź aktualny status płatności i zamówienia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/order/details/${orderId}`}>
            <Button>Szczegóły zamówienia</Button>
          </Link>
        </CardContent>
      </Card>
      <CustomerOrderDetails orderData={orderData} />
      <TrustmateReviewInvitation
        userName={userName}
        userEmail={orderData.buyer.email}
        orderNumber={orderData.number}
      />
    </div>
  );
}
