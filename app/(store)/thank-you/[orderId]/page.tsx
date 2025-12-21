import CustomerOrderDetails from "@/components/store/checkout/CustomerOrderDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  console.log(orderData.P24Transaction);

  return (
    <div className="space-y-8">
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
            Szczegóły płatności
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 font-medium">
            <span className="text-muted-foreground">Status: </span>
            {orderData.P24Transaction?.status === "INITIATED"
              ? "rozpoczęta"
              : orderData.P24Transaction?.status === "COMPLETED"
              ? "zakończona pomyślnie"
              : "nieznany"}
          </p>
          {orderData.P24Transaction?.status !== "COMPLETED" ? (
            <p>
              Aktualny status płatności sprawdzisz klikając w link wysłany na
              Twój adres e-mail.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <CustomerOrderDetails orderData={orderData} />
    </div>
  );
}
