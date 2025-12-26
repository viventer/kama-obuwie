import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RetryPaymentButton from "./RetryPaymentButton";
import { CircleDollarSignIcon, TriangleAlertIcon } from "lucide-react";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";

export default function OrderTransactionDetails({
  orderData,
}: {
  orderData: OrderWithId;
}) {
  const transactions = orderData.P24Transactions || [];
  const completedTransactions = transactions.filter(
    (t) => t.status === "COMPLETED"
  );
  const isTransactionCompleted = !!completedTransactions.length;
  const hasRedundantTransactions = completedTransactions.length > 1;
  const failedTransactions = transactions.filter((t) => t.status === "FAILED");
  const isEveryTransactionFailed =
    transactions.length > 0 &&
    failedTransactions.length === transactions.length;
  const hasInitiatedTransactions = transactions.some(
    (t) => t.status === "INITIATED"
  );

  return (
    <Card className="gap-2 max-w-xl">
      <CardHeader className="mb-0">
        <CardTitle className="font-medium text-xl flex gap-2 items-center">
          <CircleDollarSignIcon className="text-brand" />
          Szczegóły płatności
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isTransactionCompleted ? (
          <div className="mb-2">
            <p className="mb-2">
              Status:{" "}
              <span className="text-success font-medium">
                zakończona pomyślnie
              </span>
            </p>
            {hasRedundantTransactions && (
              <p className="text">
                <TriangleAlertIcon />
                Wykryto wielokrotne udane transakcje dla tego zamówienia.
                Nadpłata zostanie zwrócona.
              </p>
            )}
          </div>
        ) : isEveryTransactionFailed ? (
          <div className="mb-2">
            <p className="mb-2">
              Status:{" "}
              <span className="text-destructive font-medium">
                zakończona niepowodzeniem
              </span>
            </p>
            <p>
              Nie otrzymaliśmy płatności za to zamówienie. Kliknij poniższy
              przycisk, aby spróbować ponownie.
            </p>
          </div>
        ) : hasInitiatedTransactions ? (
          <div className="mb-2">
            <p className="mb-2">
              Status:{" "}
              <span className="text-yellow-300 font-medium">
                w trakcie realizacji
              </span>
            </p>
            <p>
              Jeśli nie zakończyłeś płatności, kliknij poniższy przycisk, aby
              dokończyć transakcję.
            </p>
          </div>
        ) : (
          <div className="mb-2">
            <p className="mb-2">
              Status:{" "}
              <span className="text-destructive font-medium">
                brak płatności
              </span>
            </p>
            <p>
              Nie wykryto żadnych prób płatności za to zamówienie. Kliknij
              poniższy przycisk, aby rozpocząć płatność.
            </p>
          </div>
        )}

        {!isTransactionCompleted ? (
          <RetryPaymentButton
            transactionData={{
              amount: Math.round(
                parseFloat(orderData.summary.totalToPay.amount) * 100
              ),
              email: orderData.buyer.email,
            }}
            orderId={orderData.id as string}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
