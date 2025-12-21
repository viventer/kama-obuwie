import CustomerOrderDetails from "@/components/store/checkout/CustomerOrderDetails";
import { Button } from "@/components/ui/button";
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

  const transactions = orderData.P24Transactions || [];
  const isTransactionCompleted = transactions.some(
    (t) => t.status === "COMPLETED"
  );

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
          {transactions.map((transaction, index) => (
            <p className="mb-2 font-medium" key={index}>
              <span className="text-muted-foreground">Status: </span>
              {transaction.status === "INITIATED"
                ? "rozpoczęta"
                : transaction.status === "COMPLETED"
                ? "zakończona pomyślnie"
                : "nieznany"}
            </p>
          ))}

          {!isTransactionCompleted ? (
            <div>
              <p className="mb-4">
                Płatność nie została jeszcze zakończona. Jeśli płatność się nie
                udała kliknij poniższy przycisk, aby spróbować ponownie.
              </p>
              <Button variant={"important"}>Ponów płatność</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <CustomerOrderDetails orderData={orderData} />
    </div>
  );
}
